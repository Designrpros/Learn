import { getOrCreateTopicStub, getTopicFAQs, logActivity } from '@/lib/db-queries';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import React from 'react';
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Book, Calendar, Loader2, Play, GitGraph, Sparkles } from 'lucide-react';
import { WikiComments } from '@/components/wiki/wiki-comments';
import { GenerationManager } from '@/components/generation-manager';
// Note: GenerationManager is in layout, but we might want a client wrapper here to Trigger generation?
// Actually, we use a client component "WikiContent" to handle streaming.

import { WikiContentMonitor } from '@/components/wiki/wiki-content-monitor';
import { WikiLiveUpdater } from '@/components/wiki/wiki-live-updater';
import { WikiFAQ } from '@/components/wiki/wiki-faq';

import { WikiHeaderActions } from '@/components/wiki/wiki-header-actions';
import { WikiChapter } from '@/components/wiki/wiki-chapter';
import { WikiTopicImageGrid } from '@/components/wiki/wiki-topic-image-grid';
import { WikiArticleView } from '@/components/wiki/wiki-article-view';

export const dynamic = 'force-dynamic'; // Ensure we always check fresh DB state

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { userId } = await auth(); // Get current user
    const topic = await getOrCreateTopicStub(slug);

    // Log Navigation Event (fire and forget)
    if (topic && userId) {
        // We catch errors to prevent logging from breaking the page load
        try {
            logActivity(
                `Visited ${topic.title}`,
                "NAVIGATION",
                { slug: topic.slug, topicId: topic.id, userId } // Pass userId in metadata for now as schema support is mixed
            ).catch(e => console.error("Failed to log visit:", e));
        } catch (e) {
            // Include a failsafe ignore
        }
    }

    if (!topic) {
        notFound();
    }

    // Determine if we need to auto-trigger generation?
    // If syllabus is empty (just a seed stub), we might want to prompt user or auto-start.
    // Given the user wants "continue in background", auto-start is a good premium feel if they land on an empty page.
    const isStub = !topic.syllabus || (Array.isArray(topic.syllabus) && topic.syllabus.length === 0);

    // Relationships Logic
    const children = topic.children || [];
    const related = [...(topic.outgoing || []), ...(topic.incoming || [])].filter(rel => {
        // Exclude if it's actually a child interaction (though schema separates them)
        return true;
    });

    // Explicitly fetch FAQs to ensure visibility
    const faqs = await getTopicFAQs(topic.id);

    return (
        <>
            {/* Main Content Grid - Header is now in layout.tsx */}
            <WikiArticleView topic={topic} faqs={faqs} />
        </>
    );
}
