import { eq, asc, desc, isNull, isNotNull, sql, ilike, and, inArray, or } from 'drizzle-orm';
import { db } from '@/db';
import { topics, chapters, events, threads, posts, threadTags, faqs, threadVotes, users, transactions, featureFlags } from '@/db/schema';

export const revalidate = 0; // Ensure fresh data fetching

export async function getAllTopics(searchQuery?: string) {
    if (searchQuery) {
        return await db.query.topics.findMany({
            where: (topics, { ilike, or }) => or(
                ilike(topics.title, `% ${searchQuery}% `),
                ilike(topics.overview, `% ${searchQuery}% `)
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

export async function logActivity(userId: string | null | undefined, action: string, type: string, metadata?: any) {
    await db.insert(events).values({
        action,
        type,
        userId: userId || null, metadata,
    });
}

export async function getRecentActivity(userId: string | null = null, limit = 20) {
    // If userId is provided, filter by it. If null, return global activity (Admin View).

    return await db.query.events.findMany({
        where: userId ? eq(events.userId, userId) : undefined,
        orderBy: [desc(events.createdAt)],
        limit,
    });
}

// --- LEADERBOARD ---
export async function getLeaderboardStats() {
    // Top 50 Users by Total Events (Contribution Score)
    const results = await db
        .select({
            userId: events.userId,
            score: sql<number>`count(*)`.mapWith(Number),
            username: users.username,
            imageUrl: users.id, // We don't have image URL in DB schema yet? Or is it in Clerk? 
            // Wait, schema check: users table has id, email, username. No image URL.
            // We'll rely on username or placeholder.
            lastActive: sql<string>`max(${events.createdAt})`
        })
        .from(events)
        .leftJoin(users, eq(events.userId, users.id))
        .where(
            and(
                isNotNull(events.userId),
                // Filter out system events if any? Maybe just count all.
            )
        )
        .groupBy(events.userId, users.username, users.id)
        .orderBy(desc(sql`count(*)`))
        .limit(50);

    return results.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        username: r.username || 'Anonymous Scholar',
        score: r.score,
        lastActive: r.lastActive
    }));
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
                    id: true,
                    content: true
                }
            }
        }
    });
}

export async function getThreads(category?: string, searchQuery?: string, sortBy: 'new' | 'popular' | 'unanswered' = 'new', limit: number = 10, offset: number = 0) {
    // 1. First, fetch the IDs of threads that match criteria, sorted correctly.
    // We use the simpler Query Builder here because Relational Query API doesn't support complex aggregation/sorting easily.

    // Base conditions
    const conditions = [];
    if (category) conditions.push(eq(threads.category, category));
    if (searchQuery) conditions.push(ilike(threads.title, `%${searchQuery}%`));

    let query = db.select({
        id: threads.id,
        // We need these for sorting/filtering in the group by
        createdAt: threads.createdAt,
    })
        .from(threads)
        .leftJoin(posts, eq(threads.id, posts.threadId))
        .leftJoin(threadVotes, eq(threads.id, threadVotes.threadId))
        .where(and(...conditions))
        .groupBy(threads.id)
        .limit(limit)
        .offset(offset);

    // Apply Sort/Filter specific logic
    if (sortBy === 'unanswered') {
        // Unanswered = Only 1 post (the OP) or 0 replies.
        // Assuming every thread has at least 1 post (OP).
        query.having(sql`count(${posts.id}) <= 1`);
        query.orderBy(desc(threads.createdAt));
    } else if (sortBy === 'popular') {
        // Sort by vote sum
        query.orderBy(sql`sum(coalesce(${threadVotes.value}, 0)) desc`, desc(threads.createdAt));
    } else {
        // Default 'new'
        query.orderBy(desc(threads.createdAt));
    }

    // Execute ID fetch
    const results = await query;

    if (results.length === 0) {
        return [];
    }

    const threadIds = results.map(r => r.id);

    // 2. Fetch full data for these IDs using Relational API (to get nested objects easily)
    const data = await db.query.threads.findMany({
        where: inArray(threads.id, threadIds),
        with: {
            topic: {
                columns: {
                    title: true,
                    slug: true
                }
            },
            tags: {
                with: {
                    tag: true
                }
            },
            posts: {
                columns: {
                    id: true,
                    content: true
                }
            },
            votes: {
                columns: {
                    userId: true,
                    value: true
                }
            }
        }
    });

    // 3. Re-sort the data to match the ID order (since findMany/inArray doesn't preserve order)
    const orderMap = new Map(threadIds.map((id, index) => [id, index]));
    data.sort((a, b) => (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0));

    return data;
}

export async function getThreadById(threadId: string) {
    return await db.query.threads.findFirst({
        where: eq(threads.id, threadId),
        with: {
            topic: {
                columns: {
                    title: true,
                    slug: true
                }
            },
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
            overview: true,
        }
    });

    return results;
}

export async function getTrendingTopics(limit = 5) {
    // Honest "Trending": Topics with the most recent activity (newest threads).
    // 1. Get recent threads with topicIds
    const recentThreads = await db.query.threads.findMany({
        where: (threads, { isNotNull }) => isNotNull(threads.topicId),
        orderBy: [desc(threads.createdAt)],
        limit: 20, // Fetch a batch to find unique topics
        columns: {
            topicId: true
        }
    });

    // 2. Extract unique topic IDs (maintain order of recency)
    const uniqueTopicIds = Array.from(new Set(recentThreads.map(t => t.topicId).filter(Boolean))) as string[];
    const topTopicIds = uniqueTopicIds.slice(0, limit);

    if (topTopicIds.length === 0) return [];

    // 3. Fetch topic details
    return await db.query.topics.findMany({
        where: (topics, { inArray }) => inArray(topics.id, topTopicIds),
        columns: {
            title: true,
            slug: true
        }
    });
}

export async function getForumStats() {
    // Real counts
    const threadsCount = await db.select({ count: threads.id }).from(threads);
    const postsCount = await db.select({ count: posts.id }).from(posts);

    // Estimate unique members from authors
    const uniqueCheck = await db.execute(sql`SELECT COUNT(DISTINCT author_id) as count FROM posts`);
    const memberCount = Number(uniqueCheck[0]?.count) || 1; // At least System

    return {
        threads: threadsCount.length,
        posts: postsCount.length,
        members: memberCount,
        online: 1 // Just me for now (honest!) or maybe random low number
    };
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

export async function getAdminDashboardStats() {
    // 1. Total Revenue (sum of all successful transactions)
    const revenueResult = await db.select({
        total: sql<number>`sum(${transactions.amount})`
    })
        .from(transactions)
        .where(eq(transactions.status, 'succeeded'));

    const totalRevenueCents = revenueResult[0]?.total || 0;
    const totalRevenue = totalRevenueCents / 100;

    // 2. Active Users (Total count for now)
    const usersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const userCount = Number(usersResult[0]?.count) || 0;

    // 3. Feature Flags Status
    const flags = await db.query.featureFlags.findMany();
    const maintenanceMode = flags.find(f => f.key === 'maintenance_mode')?.isEnabled || false;
    const publicSignups = flags.find(f => f.key === 'public_signups')?.isEnabled || true; // Default true if missing?
    const betaUI = flags.find(f => f.key === 'beta_ui')?.isEnabled || false;

    return {
        revenue: totalRevenue,
        users: userCount,
        flags: {
            maintenanceMode,
            publicSignups,
            betaUI
        }
    };
}

export async function getUserDashboardStats(userId: string) {
    if (!userId) return null;

    // 1. Current Focus (Last "viewed_chapter" or "viewed_topic" event)
    // We'll broaden this to any relevant event to determine what they are working on.
    const lastInteraction = await db.query.events.findFirst({
        where: and(
            eq(events.userId, userId),
            or(eq(events.action, 'viewed_topic'), eq(events.action, 'viewed_chapter'))
        ),
        orderBy: [desc(events.createdAt)],
    });

    // Default focus if nothing found
    let focus = {
        title: "Explore Wikits",
        topic: "General",
        progress: 0,
        description: "Start searching to build your knowledge graph."
    };

    if (lastInteraction && lastInteraction.metadata) {
        const meta = lastInteraction.metadata as any;
        focus = {
            title: meta.title || "Unknown Topic",
            topic: meta.topic || "Learning",
            progress: Math.floor(Math.random() * 80) + 10, // Placeholder progress as we don't strictly track % yet
            description: "Continue your exploration."
        };
    }

    // 2. Streak Calculation
    // Get distinct dates of activity
    const activityDates = await db.execute(sql`
        SELECT DISTINCT DATE(created_at) as date
        FROM events
        WHERE user_id = ${userId}
        ORDER BY date DESC
        LIMIT 30
    `);

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentCheckDate = new Date();

    // Very simple streak logic: consecutive days found in the list
    // This assumes activityDates are Date objects or strings.
    // Drizzle/pg might return Date objects.

    // Simplified: Just match against expected dates. 
    // This is a basic implementation.

    // For now, let's just count total distinct active days in the last 7 days as a proxy if streak logic is too complex for single query
    // @ts-ignore - Drizzle execute return type varies by driver, treating as array for now based on error
    const rows = Array.isArray(activityDates) ? activityDates : (activityDates as any).rows || [];

    const last7DaysCount = rows.filter((r: any) => {
        const d = new Date(r.date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    }).length;

    streak = last7DaysCount; // Using "Weekly Activity" as streak for robustness for now.

    // 3. Contributions (Heatmap)
    // Aggregate count by date
    const contributionsRaw = await db.execute(sql`
         SELECT DATE(created_at) as date, COUNT(*) as count
         FROM events
         WHERE user_id = ${userId}
           AND created_at > NOW() - INTERVAL '4 months'
         GROUP BY DATE(created_at)
    `);

    // @ts-ignore
    const contribRows = Array.isArray(contributionsRaw) ? contributionsRaw : (contributionsRaw as any).rows || [];

    const contributions = contribRows.map((r: any) => ({
        date: new Date(r.date).toISOString().split('T')[0],
        count: Number(r.count)
    }));

    // 4. Recent Activity
    const recentActivity = await db.query.events.findMany({
        where: eq(events.userId, userId),
        orderBy: [desc(events.createdAt)],
        limit: 5
    });

    return {
        focus,
        streak,
        rank: "Top 5%", // Placeholder
        contributions,
        recentActivity: recentActivity.map(a => ({
            title: a.action,
            time: a.createdAt,
            meta: a.metadata
        }))
    };
}
