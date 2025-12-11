import { create } from 'zustand';

export interface GenerationJob {
    topicId: string;
    chapterId?: string; // If generating specific chapter
    status: 'idle' | 'generating' | 'completed' | 'failed';
    content: string; // The accumulated streaming content
    type: 'syllabus' | 'chapter'; // Type of generation
    force?: boolean;
}

interface GenerationState {
    activeJob: GenerationJob | null;
    queue: GenerationJob[];

    // Actions
    startJob: (job: Omit<GenerationJob, 'status' | 'content'>) => void;
    updateJobContent: (content: string) => void;
    finishJob: (status: 'completed' | 'failed') => void;
    reset: () => void;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
    activeJob: null,
    queue: [],

    startJob: (job) => {
        // If already generating, maybe queue it (for now just replace or error)
        // Simple version: Only one active job at a time for MVP
        if (get().activeJob?.status === 'generating') {
            console.warn("Already generating. Queuing logic not fully implemented.");
            // For strict MVP, we might just override or return.
            // Let's override for now to allow user to force new generation.
        }

        set({
            activeJob: {
                ...job,
                status: 'generating',
                content: ''
            }
        });
    },

    updateJobContent: (content) => {
        set((state) => ({
            activeJob: state.activeJob ? { ...state.activeJob, content } : null
        }));
    },

    finishJob: (status) => {
        set((state) => ({
            activeJob: state.activeJob ? { ...state.activeJob, status } : null
        }));
    },

    reset: () => set({ activeJob: null, queue: [] })
}));
