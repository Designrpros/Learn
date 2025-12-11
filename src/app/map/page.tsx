import { getMapData } from '@/app/actions/get-map-data';
import MapWrapper from '@/components/map-wrapper';
import { VectorBackground } from '@/components/ui/vector-background';
import { MapControls } from '@/components/map/map-controls';

export const dynamic = 'force-dynamic';

export default async function MapPage() {
    const { topics, edges } = await getMapData();

    return (
        <div className="w-screen h-screen overflow-hidden bg-background relative">
            <VectorBackground color="120, 113, 108" particleCount={60} />



            <div className="absolute top-4 left-4 z-10 bg-background/80 p-4 backdrop-blur rounded-lg border shadow-sm pointer-events-none">
                <h1 className="font-serif text-2xl font-bold">Knowledge Graph</h1>
                <p className="text-muted-foreground text-sm mb-2">
                    {topics.length} Nodes • {edges.length} Connections
                </p>
                <MapControls />
            </div>

            <div className="absolute inset-0 z-0">
                <MapWrapper topics={topics} edges={edges} />
            </div>
        </div>
    );
}
