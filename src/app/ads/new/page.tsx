
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Image as ImageIcon, Layout, Rocket, Check, Zap, Map as MapIcon, Calendar, CreditCard, ChevronDown, Upload, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import InteractiveMap from "@/components/admin/interactive-map";
import { Switch } from "@/components/ui/switch";

export default function AdsWizardPage() {
    // Creative State
    const [headline, setHeadline] = useState("");
    const [body, setBody] = useState("");
    const [destUrl, setDestUrl] = useState("");
    const [cta, setCta] = useState("Learn More");

    // Targeting State
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]); // Array of IDs
    const [availableCountries, setAvailableCountries] = useState<{ id: string; name: string }[]>([]);
    const [budget, setBudget] = useState(20);
    const [duration, setDuration] = useState(7);

    // Helpers
    const toggleCountry = (id: string, name: string) => {
        if (selectedCountries.includes(id)) {
            setSelectedCountries(prev => prev.filter(c => c !== id));
        } else {
            setSelectedCountries(prev => [...prev, id]);
        }
    };

    // Estimates
    const estImpressions = budget * 1500;
    const estClicks = Math.floor(estImpressions * 0.015);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#050505', overflowY: 'auto' }}>
            <div className="w-full max-w-[1600px] mx-auto p-6 lg:p-10">

                {/* Header */}
                <header className="flex items-center justify-between mb-12 border-b border-neutral-800 pb-6 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-50">
                    <div className="flex items-center gap-4">
                        <Link href="/ads" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
                            <div className="p-2 rounded-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </Link>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                            Create Campaign
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-semibold text-neutral-200">Draft saved</div>
                            <div className="text-xs text-neutral-500">Just now</div>
                        </div>
                        <Button variant="outline" className="border-neutral-800 text-neutral-300">Save Draft</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Publish Campaign</Button>
                    </div>
                </header>

                <main className="grid lg:grid-cols-12 gap-12 w-full pb-32">

                    {/* LEFT: Form Sections */}
                    <div className="lg:col-span-7 space-y-12">

                        {/* SECTION 1: CREATIVE */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold border border-neutral-700">1</div>
                                <h2 className="text-xl font-semibold text-white">Creative</h2>
                            </div>

                            <div className="ml-12 p-6 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-8">
                                {/* Asset Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-300">Images or Video <span className="text-red-500">*</span></label>
                                    <div className="border-2 border-dashed border-neutral-800 rounded-lg p-8 flex flex-col items-center justify-center gap-4 hover:border-neutral-700 transition-colors cursor-pointer group">
                                        <div className="p-4 rounded-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                                            <Upload className="w-6 h-6 text-neutral-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-white">Drag and drop or browse</p>
                                            <p className="text-xs text-neutral-500 mt-1">1200x628px recommended</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Text Inputs */}
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-medium text-neutral-300">Headline <span className="text-red-500">*</span></label>
                                            <span className="text-xs text-neutral-500">{headline.length}/100</span>
                                        </div>
                                        <Input
                                            value={headline}
                                            onChange={(e) => setHeadline(e.target.value)}
                                            className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-indigo-500"
                                            placeholder="Write a compelling headline"
                                            maxLength={100}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-medium text-neutral-300">Ad Copy</label>
                                            <span className="text-xs text-neutral-500">{body.length}/300</span>
                                        </div>
                                        <Textarea
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-indigo-500 min-h-[100px] resize-none"
                                            placeholder="Tell people why they should care."
                                            maxLength={300}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-300">Call to Action</label>
                                            <select
                                                value={cta}
                                                onChange={(e) => setCta(e.target.value)}
                                                className="w-full h-10 px-3 rounded-md bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                                            >
                                                <option>Learn More</option>
                                                <option>Sign Up</option>
                                                <option>Download</option>
                                                <option>Apply Now</option>
                                                <option>Shop Now</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-neutral-300">Destination URL <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <Input
                                                    value={destUrl}
                                                    onChange={(e) => setDestUrl(e.target.value)}
                                                    className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-indigo-500 pl-9"
                                                    placeholder="https://"
                                                />
                                                <Layout className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2: TARGETING */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold border border-neutral-700">2</div>
                                <h2 className="text-xl font-semibold text-white">Targeting & Delivery</h2>
                            </div>

                            <div className="ml-12 p-6 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-8">
                                {/* Map */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-neutral-300">Locations</label>
                                        <div className="flex items-center gap-2">
                                            {selectedCountries.slice(0, 3).map(id => (
                                                <Badge key={id} variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                                                    {id}
                                                </Badge>
                                            ))}
                                            {selectedCountries.length > 3 && (
                                                <span className="text-xs text-neutral-500">+{selectedCountries.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="rounded-lg overflow-hidden border border-neutral-800 relative group">
                                        {/* Tool Bar */}
                                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                                            <div className="flex gap-2 pointer-events-auto">
                                                <Button
                                                    size="sm" variant="secondary"
                                                    className="bg-black/50 backdrop-blur border border-neutral-800 text-xs hover:bg-black/80"
                                                    onClick={() => {
                                                        // Select All World
                                                        if (availableCountries.length > 0) {
                                                            setSelectedCountries(availableCountries.map(c => c.id));
                                                        }
                                                    }}
                                                >
                                                    Select World
                                                </Button>
                                                <Button
                                                    size="sm" variant="secondary"
                                                    className="bg-black/50 backdrop-blur border border-neutral-800 text-xs hover:bg-black/80"
                                                    onClick={() => setSelectedCountries([])}
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                            <div className="bg-black/80 backdrop-blur px-3 py-1.5 rounded text-xs text-neutral-400 border border-neutral-800">
                                                Click map to toggle
                                            </div>
                                        </div>

                                        <InteractiveMap
                                            selectedIds={selectedCountries}
                                            onToggleRegion={toggleCountry}
                                            onDataLoaded={(countries) => setAvailableCountries(countries)}
                                        />
                                    </div>
                                </div>

                                {/* Budget & Schedule */}
                                <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-neutral-800">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <label className="text-sm font-medium text-neutral-300">Daily Budget</label>
                                                <span className="text-sm font-bold text-white">${budget}.00</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="5" max="500" step="5"
                                                value={budget}
                                                onChange={(e) => setBudget(Number(e.target.value))}
                                                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                            <p className="text-xs text-neutral-500">You'll spend up to ${(budget * duration).toFixed(2)} total.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <label className="text-sm font-medium text-neutral-300">Duration (Days)</label>
                                                <span className="text-sm font-bold text-white">{duration} days</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1" max="30" step="1"
                                                value={duration}
                                                onChange={(e) => setDuration(Number(e.target.value))}
                                                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Estimates */}
                                    <div className="bg-neutral-900/30 rounded-lg p-5 border border-neutral-800/50 space-y-4">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Weekly Estimates</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-2xl font-bold text-white tracking-tight">
                                                    {(estImpressions).toLocaleString()} - {(estImpressions * 1.5).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-neutral-400">Impressions</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white tracking-tight">
                                                    {(estClicks).toLocaleString()} - {(estClicks * 1.8).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-neutral-400">Clicks</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 3: PAYMENT */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold border border-neutral-700">3</div>
                                <h2 className="text-xl font-semibold text-white">Payment</h2>
                            </div>

                            <div className="ml-12 p-6 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-6">
                                <div className="flex items-center gap-4 p-4 border border-neutral-800 rounded-lg bg-neutral-900/20">
                                    <div className="w-10 h-6 bg-neutral-800 rounded flex items-center justify-center border border-neutral-700">
                                        <CreditCard className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">•••• •••• •••• 4242</div>
                                        <div className="text-xs text-neutral-500">Expires 12/28</div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">Change</Button>
                                </div>
                                <div className="text-xs text-neutral-500">
                                    By publishing, you agree to our <span className="underline hover:text-white cursor-pointer">Advertising Terms</span>.
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* RIGHT: Live Preview */}
                    <div className="lg:col-span-5 relative hidden lg:block">
                        <div className="sticky top-32 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Live Preview</h3>
                                <Badge variant="outline" className="border-neutral-700 text-neutral-400">Feed Placement</Badge>
                            </div>

                            {/* THE AD CARD */}
                            <div className="relative group perspective-1000">
                                {/* Glowing backdrop */}
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>

                                <div className="relative p-5 rounded-xl bg-[#050505] border border-neutral-800 shadow-2xl overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-900/50">
                                                A
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white">Advertiser Name</div>
                                                <div className="text-[10px] text-indigo-400 font-medium">Promoted</div>
                                            </div>
                                        </div>
                                        <div className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-500">
                                            Ad
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h4 className="text-base font-semibold text-white mb-2 leading-tight">
                                        {headline || "Your Compelling Headline Goes Here"}
                                    </h4>

                                    {/* Media Placeholder */}
                                    <div className="w-full aspect-video bg-neutral-900 rounded-lg border border-neutral-800 mb-3 flex items-center justify-center text-neutral-700 overflow-hidden relative group/media">
                                        <ImageIcon className="w-12 h-12 opacity-50" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-xs font-medium text-white px-3 py-1.5 rounded-full bg-white/10 backdrop-blur">View Media</span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    {body && (
                                        <p className="text-sm text-neutral-400 mb-3 leading-relaxed">
                                            {body}
                                        </p>
                                    )}

                                    {/* Footer / CTA */}
                                    <div className="flex items-center justify-between pt-3 border-t border-neutral-800/50">
                                        <div className="text-[10px] text-neutral-500 truncate max-w-[150px]">
                                            {destUrl || "wikits.com"}
                                        </div>
                                        <Button size="sm" className="h-8 text-xs bg-neutral-100 text-black hover:bg-neutral-200 font-semibold px-4 rounded-full">
                                            {cta}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Review Badge */}
                            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Auto-approved for safe categories</span>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
