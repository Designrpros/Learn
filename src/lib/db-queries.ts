import { db } from '@/db';
import { topics, chapters, events, threads, posts, threadTags, faqs } from '@/db/schema';
import { eq, asc, desc, isNull } from 'drizzle-orm';

export const revalidate = 0; // Ensure fresh data fetching

export async function getAllTopics(searchQuery?: string) {
    if (searchQuery) {
        return await db.query.topics.findMany({
            where: (topics, { ilike, or }) => or(
                ilike(topics.title, `%${searchQuery}%`),
                ilike(topics.overview, `%${searchQuery}%`)
            ),
            orderBy: [asc(topics.title)],
            columns: {
                id: true,
                title: true,
                slug: true,
                overview: true,
                createdAt: true,
            },
        });
    }

    return await db.query.topics.findMany({
        orderBy: [asc(topics.title)],
        columns: {
            id: true,
            title: true,
            slug: true,
            overview: true,
            createdAt: true,
        },
    });
}

// --- TREE FETCHING (LAZY LOAD) ---
export async function getTopicChildren(parentId: string | null = null) {
    // If parentId is null, fetch roots (where parentId is null)
    // Otherwise fetch children of parentId
    const where = parentId ? eq(topics.parentId, parentId) : isNull(topics.parentId);

    return await db.query.topics.findMany({
        where,
        orderBy: [asc(topics.order), asc(topics.title)],
        columns: {
            id: true,
            title: true,
            slug: true,
            icon: true,
            order: true,
        },
        with: {
            // We need to know if it HAS children to show the expand arrow
            // But we don't want to fetch all children recursively.
            // A simple way is to fetch just ID of children, or use a count if supported.
            // Drizzle doesn't do "has element" validation easily in relation query without fetching.
            // We'll fetch just ids of children.
            children: {
                columns: {
                    id: true
                },
                limit: 1 // We only need to know if > 0 exists
            }
        }
    });
}

export async function getTopicBySlug(slug: string) {
    const topic = await db.query.topics.findFirst({
        where: eq(topics.slug, slug),
        with: {
            chapters: {
                orderBy: [asc(chapters.order)],
            },
            children: {
                orderBy: [asc(topics.title)]
            },
            parent: {
                // Fetch grandparent for better breadcrumbs (limited depth)
                with: {
                    parent: {
                        with: {
                            parent: true
                        }
                    }
                }
            },
            outgoing: {
                with: {
                    target: true // Get the related topic details
                }
            },
            incoming: {
                with: {
                    source: true // Get the related topic details
                }
            }
        }
    });
    return topic;
}

export async function getOrCreateTopicStub(slug: string) {
    // Decode slug to ensure we match correctly (e.g. "c++" not "c%2B%2B")
    const cleanSlug = decodeURIComponent(slug);

    let topic = await getTopicBySlug(cleanSlug);

    if (!topic) {
        // Create Stub
        // If slug is "how-to-code", title becomes "How To Code"
        const title = cleanSlug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        try {
            const [newTopic] = await db.insert(topics).values({
                title: title,
                slug: cleanSlug,
                overview: "",
                syllabus: [],
                isPublic: true,
                creatorId: "user_stub_trigger"
            }).returning();

            // Re-fetch with relations to match return type of getTopicBySlug
            return await getTopicBySlug(cleanSlug);
        } catch (e: any) {
            // Handle Race Condition (Unique Constraint Violation)
            // Code 23505 is PostgreSQL unique_violation
            if (e.code === '23505' || (e.message && e.message.includes('duplicate key'))) {
                console.log(`[DB] Race condition handling: Topic "${cleanSlug}" already created by another request.`);
                return await getTopicBySlug(cleanSlug);
            }

            console.error("Failed to create stub", e);
            return null;
        }
    }

    return topic;
}

export async function getSidebarData() {
    return await db.query.topics.findMany({
        orderBy: [asc(topics.order), asc(topics.title)],
        columns: {
            id: true,
            title: true,
            slug: true,
        },
        with: {
            chapters: {
                columns: {
                    id: true,
                    title: true,
                    slug: true,
                    order: true,
                },
                orderBy: [asc(chapters.order)],
            }
        }
    });
}

export async function logActivity(action: string, type: string, metadata?: any) {
    await db.insert(events).values({
        action,
        type,
        metadata,
    });
}

export async function getRecentActivity(limit = 20) {
    return await db.query.events.findMany({
        orderBy: [desc(events.createdAt)],
        limit,
    });
}

// --- FORUM QUERIES ---


export async function getTopicFAQs(topicId: string) {
    return await db.query.faqs.findMany({
        where: eq(faqs.topicId, topicId),
        orderBy: [desc(faqs.createdAt)],
    });
}

export async function getThreadsByTopic(topicId: string) {
    return await db.query.threads.findMany({
        where: eq(threads.topicId, topicId),
        orderBy: [desc(threads.createdAt)], // Correct Drizzle syntax for orderBy array
        with: {
            tags: {
                with: {
                    tag: true
                }
            },
            posts: {
                columns: {
                    id: true
                }
            }
        }
    });
}

export async function getThreads(category?: string, searchQuery?: string) {
    const filters = [];
    if (category) filters.push(eq(threads.category, category));

    // Manual search query construction since we need helper functions from 'where' callback
    // But direct array 'and' is cleaner
    // However, Drizzle's 'ilike' usually needs to come from the callback arg in 'findMany'

    // Strategy: Use the findMany 'where' callback completely
    return await db.query.threads.findMany({
        where: (threads, { eq, and, ilike, or }) => {
            const conditions = [];
            if (category) conditions.push(eq(threads.category, category));
            if (searchQuery) {
                conditions.push(or(
                    ilike(threads.title, `%${searchQuery}%`)
                ));
            }
            return and(...conditions);
        },
        orderBy: [desc(threads.createdAt)],
        with: {
            tags: {
                with: {
                    tag: true
                }
            },
            posts: {
                columns: {
                    id: true // just for counting
                }
            }
        }
    });
}

export async function getThreadById(threadId: string) {
    return await db.query.threads.findFirst({
        where: eq(threads.id, threadId),
        with: {
            posts: {
                orderBy: [asc(posts.createdAt)],
                with: {
                    // author: true // if we had a relation to users table, but we use Clerk ID strings
                }
            },
            tags: {
                with: {
                    tag: true
                }
            }
        }
    });
}


// --- SEARCH ---

export async function searchTopics(query: string) {
    if (!query) return [];

    // Simple ILIKE search for now
    const results = await db.query.topics.findMany({
        where: (topics, { ilike, or }) => or(
            ilike(topics.title, `%${query}%`),
            ilike(topics.overview, `%${query}%`)
        ),
        limit: 5,
        columns: {
            id: true,
            title: true,
            slug: true,
        }
    });

    return results;
}

export async function getWikiFilters() {
    // Fetch Root topics (Level 1)
    const roots = await db.query.topics.findMany({
        where: (topics, { isNull }) => isNull(topics.parentId),
        orderBy: (topics, { asc }) => [asc(topics.order), asc(topics.title)],
        columns: {
            id: true,
            title: true,
            slug: true,
            icon: true,
        },
        with: {
            children: {
                columns: {
                    id: true,
                    title: true,
                    slug: true,
                    icon: true,
                },
                orderBy: (topics, { asc }) => [asc(topics.order), asc(topics.title)],
            }
        }
    });

    return roots;
}
