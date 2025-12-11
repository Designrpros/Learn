import { create } from 'zustand';

interface TopicImagesState {
    images: Record<string, string[]>; // topicId -> images[]
    setImages: (topicId: string, images: string[]) => void;
    addImage: (topicId: string, image: string) => void;
}

export const useTopicImagesStore = create<TopicImagesState>((set) => ({
    images: {},
    setImages: (topicId, images) => set((state) => ({
        images: { ...state.images, [topicId]: images }
    })),
    addImage: (topicId, image) => set((state) => ({
        images: {
            ...state.images,
            [topicId]: [image, ...(state.images[topicId] || [])]
        }
    })),
}));
