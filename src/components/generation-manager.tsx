"use client";

import { useGenerationStore } from "@/lib/generation-store";
import { useCompletion } from "@ai-sdk/react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useEffect } from "react";
import { syllabusSchema } from "@/lib/schemas";

export function GenerationManager() {
    const { activeJob, updateJobContent, finishJob } = useGenerationStore();

    // -------------------------------------------------------------------------
    // 1. Chapter Generation (Text Stream)
    // -------------------------------------------------------------------------
    const {
        complete: completeChapter,
        completion: chapterCompletion,
        isLoading: isChapterLoading
    } = useCompletion({
        api: '/api/generate-chapter',
        onFinish: () => finishJob('completed'),
        onError: (err) => {
            console.error("Chapter Gen Error", err);
            finishJob('failed');
        }
    });

    // -------------------------------------------------------------------------
    // 2. Syllabus Generation (Object Stream -> Markdown)
    // -------------------------------------------------------------------------
    const {
        submit: submitSyllabus,
        object: syllabusObject,
        isLoading: isSyllabusLoading
    } = useObject({
        api: '/api/generate-syllabus',
        schema: syllabusSchema,
        onFinish: () => finishJob('completed'),
        onError: (err) => {
            console.error("Syllabus Gen Error", err);
            finishJob('failed');
        }
    });

    // -------------------------------------------------------------------------
    // Trigger Logic
    // -------------------------------------------------------------------------
    useEffect(() => {
        // Only trigger if 'generating' but content is empty (start)
        if (activeJob?.status === 'generating' && activeJob.content === '') {

            if (activeJob.type === 'chapter' && !isChapterLoading) {
                console.log("Triggering Chapter Generation...", activeJob);
                // Pass empty prompt, send real data in body
                completeChapter("", {
                    body: {
                        topicId: activeJob.topicId,
                        chapterId: activeJob.chapterId
                    }
                });
            }

            if (activeJob.type === 'syllabus' && !isSyllabusLoading) {
                console.log("Triggering Syllabus Generation...", activeJob);
                submitSyllabus({
                    topicId: activeJob.topicId,
                    force: activeJob.force // Pass FORCE flag
                });
            }
        }
    }, [activeJob, isChapterLoading, isSyllabusLoading, completeChapter, submitSyllabus]);


    // -------------------------------------------------------------------------
    // Sync Logic
    // -------------------------------------------------------------------------

    // Chapter Sync
    useEffect(() => {
        if (activeJob?.type === 'chapter' && isChapterLoading) {
            // console.log("Streaming Chapter chunk:", chapterCompletion.length);
            updateJobContent(chapterCompletion);
        }
    }, [chapterCompletion, isChapterLoading, activeJob?.type, updateJobContent]);

    // Syllabus Sync
    useEffect(() => {
        if (activeJob?.type === 'syllabus' && isSyllabusLoading && syllabusObject) {
            // Transform Partial Object to Markdown used by Monitor
            const title = syllabusObject.title || "Untitled Course";
            const overview = syllabusObject.courseOverview || "";
            // We construct a preview string
            const md = `# ${title}\n\n${overview}`;
            updateJobContent(md);
        }
    }, [syllabusObject, isSyllabusLoading, activeJob?.type, updateJobContent]);

    return null;
}
