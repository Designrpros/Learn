import { pgTable, text, timestamp, uuid, jsonb, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- TOPICS ---
// The core unit of knowledge.
export const topics = pgTable("topics", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(), // URL-friendly version of title
    parentId: uuid("parent_id"), // Self-referencing FK for hierarchy
    overview: text("overview"), // Wiki article summary
    icon: text("icon"), // Icon name (Lucide)
    syllabus: jsonb("syllabus"), // Stores the generated syllabus structure (Object or Array)
    images: jsonb("images"), // Array of image URLs
    creatorId: text("creator_id"), // NULL = System/Global, String = User ID
    isPublic: boolean("is_public").default(true),
    order: integer("order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const topicsRelations = relations(topics, ({ many, one }) => ({
    chapters: many(chapters),
    parent: one(topics, { // Hierarchy relation
        fields: [topics.parentId],
        references: [topics.id],
        relationName: "parent_child",
    }),
    children: many(topics, { // Hierarchy relation
        relationName: "parent_child",
    }),
    posts: many(posts), // A topic (Wiki Article) can have posts (comments)
    outgoing: many(relationships, { relationName: 'source' }),
    incoming: many(relationships, { relationName: 'target' }),
    faqs: many(faqs),
}));

// --- CHAPTERS ---
// Individual learnable units within a topic.
export const chapters = pgTable('chapters', {
    id: uuid('id').defaultRandom().primaryKey(),
    topicId: uuid('topic_id').references(() => topics.id).notNull(),
    title: text('title').notNull(),
    slug: text('slug').notNull(), // "the-nature-of-sound"
    content: text('content'),     // Markdown content
    description: text('description'), // Short summary/teaser
    images: jsonb("images"), // Array of image URLs
    order: integer('order').notNull(), // 1, 2, 3...
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chaptersRelations = relations(chapters, ({ one }) => ({
    topic: one(topics, {
        fields: [chapters.topicId],
        references: [topics.id],
    }),
}));

// --- RELATIONSHIPS ---
// The edges of the Knowledge Graph.
export const relationships = pgTable('relationships', {
    id: uuid('id').defaultRandom().primaryKey(),
    sourceTopicId: uuid('source_topic_id').references(() => topics.id).notNull(),
    targetTopicId: uuid('target_topic_id').references(() => topics.id).notNull(),
    type: text('type').notNull(), // "prerequisite", "related", "extension"
});

export const relationshipsRelations = relations(relationships, ({ one }) => ({
    source: one(topics, {
        fields: [relationships.sourceTopicId],
        references: [topics.id],
        relationName: 'source',
    }),
    target: one(topics, {
        fields: [relationships.targetTopicId],
        references: [topics.id],
        relationName: 'target',
    }),
}));

// --- FORUM ---
export const threads = pgTable('threads', {
    id: uuid('id').defaultRandom().primaryKey(),
    topicId: uuid('topic_id').references(() => topics.id), // If null, it's a global/general thread. If set, it belongs to that Topic's "Subreddit".
    title: text('title').notNull(),
    category: text('category').notNull().default('General'), // "General", "Q&A", "Showcase"
    authorName: text('author_name').notNull().default('Anonymous'),
    authorId: text('author_id'), // Clerk User ID
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const threadsRelations = relations(threads, ({ many, one }) => ({
    posts: many(posts),
    tags: many(threadTags),
    votes: many(threadVotes),
    topic: one(topics, {
        fields: [threads.topicId],
        references: [topics.id],
    }),
}));

export const posts = pgTable("posts", {
    id: uuid("id").defaultRandom().primaryKey(),
    threadId: uuid("thread_id").references(() => threads.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id").references(() => topics.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    authorId: text("author_id").notNull(), // Clerk User ID
    authorName: text("author_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
    thread: one(threads, {
        fields: [posts.threadId],
        references: [threads.id],
    }),
    topic: one(topics, {
        fields: [posts.topicId],
        references: [topics.id],
    }),
}));

export const tags = pgTable('tags', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull().unique(), // "react", "physics"
    category: text('category'), // "Topic", "UserCreated", "System"
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const threadTags = pgTable('thread_tags', {
    id: uuid('id').defaultRandom().primaryKey(),
    threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'cascade' }).notNull(),
    tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
    // unique constraint to prevent duplicate tags on same thread?
}));

export const threadTagsRelations = relations(threadTags, ({ one }) => ({
    thread: one(threads, {
        fields: [threadTags.threadId],
        references: [threads.id],
    }),
    tag: one(tags, {
        fields: [threadTags.tagId],
        references: [tags.id],
    }),
}));

export const threadVotes = pgTable('thread_votes', {
    id: uuid('id').defaultRandom().primaryKey(),
    threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'cascade' }).notNull(),
    userId: text('user_id').notNull(), // Clerk ID
    value: integer('value').notNull(), // 1 or -1
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const threadVotesRelations = relations(threadVotes, ({ one }) => ({
    thread: one(threads, {
        fields: [threadVotes.threadId],
        references: [threads.id],
    })
}));

// --- EVENTS ---
export const events = pgTable('events', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type').notNull(), // "GENERATION", "NAVIGATION", "SYSTEM"
    action: text('action').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- FAQ ---
export const faqs = pgTable('faqs', {
    id: uuid('id').defaultRandom().primaryKey(),
    topicId: uuid('topic_id').references(() => topics.id, { onDelete: 'cascade' }).notNull(),
    question: text('question').notNull(),
    answer: text('answer'), // Can be null initially if just asked? Or AI generated immediately?
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const faqsRelations = relations(faqs, ({ one }) => ({
    topic: one(topics, {
        fields: [faqs.topicId],
        references: [topics.id],
    }),
}));

