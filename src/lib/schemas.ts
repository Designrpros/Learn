
import { z } from 'zod';

export const syllabusSchema = z.object({
    title: z.string().describe("The main title of the course"),
    description: z.string().describe("A brief tagline (1 sentence)"),
    tags: z.array(z.string()).describe("Hierarchical keywords/categories (e.g. ['Science', 'Physics', 'Quantum Mechanics'])"),
    isCategory: z.boolean().describe("True if this topic is a broad field or major category (e.g. 'Science', 'History', 'Eastern Thought') that should be at the root level. False if it is a specific sub-topic."),
    courseOverview: z.string().describe("A detailed, welcoming introduction to the course topic (2-3 paragraphs). Use Markdown."),
    chapters: z.array(z.object({
        title: z.string().describe("Chapter title"),
        id: z.string().describe("Unique slug-like ID for the chapter"),
        description: z.string().describe("2-3 sentences summarizing what this chapter covers."),
    })).describe("A logical progression of 5-8 chapters"),
    relatedTopics: z.array(z.object({
        topic: z.string().describe("Name of a related topic"),
        type: z.enum(["prerequisite", "extension", "related"]).describe("Relationship type"),
    })).describe("3-5 related topics to expand the knowledge graph"),
});
