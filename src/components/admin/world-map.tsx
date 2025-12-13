
"use client";

import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mock Data for Visualization
const countryData = [
    { id: "840", value: 100 }, // USA
    { id: "826", value: 80 },  // UK
    { id: "276", value: 70 },  // Germany
    { id: "392", value: 60 },  // Japan
    { id: "250", value: 50 },  // France
    { id: "356", value: 40 },  // India
    { id: "124", value: 30 },  // Canada
    { id: "036", value: 20 },  // Australia
    { id: "076", value: 50 },  // Brazil
];

const colorScale = scaleLinear<string>()
    .domain([0, 100])
    .range(["#262626", "#ef4444"]); // Neutral-800 to Red-500

export default function WorldMap() {
    const [data, setData] = useState<{ id: string; value: number }[]>([]);

    useEffect(() => {
        setData(countryData);
    }, []);

    return (
        <div className="w-full h-[300px] overflow-hidden rounded-md bg-neutral-900 border border-neutral-800">
            <ComposableMap projectionConfig={{ scale: 140, rotate: [-10, 0, 0] }}>
                <ZoomableGroup center={[0, 0]} zoom={1}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }: { geographies: any[] }) =>
                            geographies.map((geo) => {
                                const cur = data.find((s) => s.id === geo.id);
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={cur ? colorScale(cur.value) : "#262626"}
                                        stroke="#404040"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: "#f87171", outline: "none", cursor: "pointer" }, // Red-400
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
}
