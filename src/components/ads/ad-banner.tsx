"use client";

import { useEffect, useState } from "react";
import { trackAdImpression, trackAdClick } from "@/lib/actions/ads";
import { ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AdBannerProps {
    ad: {
        id: string;
        headline: string | null;
        body: string | null;
        images: unknown; // jsonb
        destinationUrl: string | null;
        callToAction: string | null;
    } | null;
}

export function AdBanner({ ad }: AdBannerProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (ad) {
            // Track impression
            trackAdImpression(ad.id);
            setIsVisible(true);
        }
    }, [ad]);

    if (!ad) {
        return (
            <Link href="/ads/new" className="block group">
                <div className="relative overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center transition-all hover:border-foreground/20 hover:bg-muted/50">
                    <div className="mb-3 flex justify-center">
                        <div className="rounded-full bg-background p-2.5 text-muted-foreground shadow-sm ring-1 ring-border transition-colors group-hover:text-foreground">
                            <Sparkles className="h-4 w-4" />
                        </div>
                    </div>
                    <h3 className="mb-1 text-sm font-medium text-foreground">
                        This spot is feeling lonely
                    </h3>
                    <p className="mb-4 text-xs text-muted-foreground">
                        Reach our dozens of highly intelligent users before we get famous.
                    </p>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary transition-colors group-hover:bg-primary/20">
                        Claim This Spot
                    </span>
                </div>
            </Link>
        );
    }

    const handleAdClick = async () => {
        await trackAdClick(ad.id);
        if (ad.destinationUrl) {
            window.open(ad.destinationUrl, '_blank');
        }
    };

    const imageUrl = Array.isArray(ad.images) && ad.images.length > 0 ? ad.images[0] : null;

    return (
        <div
            onClick={handleAdClick}
            className="group relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-4 cursor-pointer transition-all hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
        >
            {/* "Sponsored" Label */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Sponsored
                </span>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div className="space-y-3">
                {imageUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                            src={imageUrl}
                            alt={ad.headline || "Advertisement"}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}

                <div>
                    <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 group-hover:text-indigo-400 transition-colors">
                        {ad.headline}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {ad.body}
                    </p>
                </div>

                <div className="pt-2">
                    <button className="w-full py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors">
                        {ad.callToAction || "Learn More"}
                    </button>
                </div>
            </div>
        </div>
    );
}
