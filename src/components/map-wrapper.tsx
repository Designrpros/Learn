"use client";

import dynamic from 'next/dynamic';

const VectorMap3D = dynamic(() => import('@/components/vector-map-3d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full text-muted-foreground animate-pulse">Initializing Knowledge Universe...</div>
});

const VectorMap2D = dynamic(() => import('@/components/vector-map-2d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full text-muted-foreground animate-pulse">Drawing Mind Map...</div>
});

import { useUIStore } from '@/lib/ui-store';

export default function MapWrapper({ topics, edges }: { topics: any[], edges: any[] }) {
    const { mapViewMode } = useUIStore();


    return (
        <div className="relative w-full h-full">
            {mapViewMode === '3d' ? (
                <VectorMap3D topics={topics} edgesData={edges} />
            ) : (
                <VectorMap2D topics={topics} edgesData={edges} />
            )}
        </div>
    );
}
