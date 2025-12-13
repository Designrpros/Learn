"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Image as ImageIcon, Layout, Rocket, Check, Zap, Map as MapIcon, Calendar, CreditCard, ChevronDown, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import InteractiveMap from "@/components/admin/interactive-map";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { ALL_COUNTRIES, REGIONS } from "@/lib/constants/countries";
import { toast } from "sonner"; // Assuming sonner is available based on previous tasks

interface CampaignWizardProps {
    initialData?: any;
    isEditMode?: boolean;
}

export default function CampaignWizard({ initialData, isEditMode = false }: CampaignWizardProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Creative State
    const [headline, setHeadline] = useState(initialData?.headline || "");
    const [body, setBody] = useState(initialData?.body || "");
    const [destUrl, setDestUrl] = useState(initialData?.destinationUrl || "");
    const [cta, setCta] = useState(initialData?.callToAction || "Learn More");
    const [images, setImages] = useState<string[]>(initialData?.images || []);

    // Targeting State
    const [selectedCountries, setSelectedCountries] = useState<string[]>(initialData?.targetCountries || []);
    const [availableCountries, setAvailableCountries] = useState<{ id: string; name: string }[]>([]);
    const [budget, setBudget] = useState(initialData?.dailyBudget || 20);
    const [duration, setDuration] = useState(initialData?.durationDays || 7);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'x402'>('stripe');
    const [cryptoModalOpen, setCryptoModalOpen] = useState(false);
    const [cryptoDetails, setCryptoDetails] = useState<{ amount: string, recipient: string, chainId: number, campaignId: string } | null>(null);

    // Helpers
    const toggleCountry = (id: string, name: string) => {
        if (selectedCountries.includes(id)) {
            setSelectedCountries(prev => prev.filter(c => c !== id));
        } else {
            setSelectedCountries(prev => [...prev, id]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsUploading(true);
        const file = e.target.files[0];

        try {
            const response = await fetch(`/api/upload?filename=${file.name}`, {
                method: 'POST',
                body: file,
            });

            if (!response.ok) throw new Error('Upload failed');

            const newBlob = await response.json();
            setImages([newBlob.url]);
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed. Ensure BLOB_READ_WRITE_TOKEN is set in .env.');
        } finally {
            setIsUploading(false);
        }
    };


    const handleSubmit = async (status: 'draft' | 'active') => {
        try {
            setIsSubmitting(true);

            const payload = {
                name: headline || "Untitled Campaign",
                status: status === 'active' ? 'active' : 'draft', // If activating, set to active. If saving draft, keep draft.
                headline,
                body,
                destinationUrl: destUrl,
                callToAction: cta,
                images,
                targetCountries: selectedCountries,
                dailyBudget: budget,
                durationDays: duration,
            };

            let campaign;

            if (isEditMode && initialData?.id) {
                // UPDATE existing
                const response = await fetch(`/api/ads/campaigns/${initialData.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) throw new Error(await response.text());
                campaign = await response.json();
            } else {
                // CREATE new
                const response = await fetch('/api/ads/campaigns', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, status: 'draft' }), // Always create as draft first conceptually, or handle activation below
                });
                if (!response.ok) throw new Error(await response.text());
                campaign = await response.json();
            }

            // 2. Handle Activation (Payment) - ONLY if status is 'active' AND strictly simplified for now
            // If user clicks "Publish", we initiate payment.
            // If editing an active campaign, modifying it might require re-approval or payment adjustment, but for now let's assume simple updates.
            // Actually, if it's already active, we just save. If it was draft and we make it active, we pay.

            const needsPayment = status === 'active' && (initialData?.status !== 'active');

            if (needsPayment) {
                if (paymentMethod === 'stripe') {
                    // Stripe Flow
                    const checkoutRes = await fetch('/api/stripe/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            campaignId: campaign.id,
                            campaignName: campaign.name,
                            amount: campaign.dailyBudget * campaign.durationDays,
                        }),
                    });

                    if (!checkoutRes.ok) throw new Error(await checkoutRes.text() || "Payment initialization failed");

                    const { url } = await checkoutRes.json();

                    if (url) {
                        window.location.href = url;
                        return;
                    }
                } else {
                    // X402 Crypto Flow
                    const res = await fetch(`/api/ads/campaigns/${campaign.id}/activate/x402`, { method: 'POST' });

                    if (res.status === 402) {
                        const data = await res.json();
                        setCryptoDetails({ ...data.paymentRequest, campaignId: campaign.id });
                        setCryptoModalOpen(true);
                        return;
                    } else if (!res.ok) {
                        throw new Error("Activation failed");
                    }
                }
            }

            toast.success(status === 'draft' ? "Draft saved successfully" : "Campaign updated successfully");
            if (!needsPayment && !cryptoModalOpen) {
                router.push('/ads');
            }
        } catch (error: any) {
            console.error("Failed to save campaign:", error);
            toast.error(error.message || "Failed to save campaign");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dynamic Estimates State
    const [estimates, setEstimates] = useState({
        impressions: { min: 0, max: 0 },
        clicks: { min: 0, max: 0 }
    });
    const [userCount, setUserCount] = useState(0);
    const [loadingEstimates, setLoadingEstimates] = useState(false);

    // Fetch Estimates Debounced
    useEffect(() => {
        const fetchEstimates = async () => {
            setLoadingEstimates(true);
            try {
                const res = await fetch('/api/ads/estimates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        budget,
                        duration,
                        countryIds: selectedCountries
                    })
                });
                const data = await res.json();
                setEstimates(data);
                setUserCount(data.users);
            } catch (e) {
                console.error("Failed to fetch estimates", e);
            } finally {
                setLoadingEstimates(false);
            }
        };

        const timer = setTimeout(fetchEstimates, 500);
        return () => clearTimeout(timer);
    }, [budget, duration, selectedCountries]);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#050505', overflowY: 'auto' }}>
            <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row items-center md:justify-between mb-8 md:mb-12 border-b border-neutral-800 pb-4 md:pb-6 sticky top-0 bg-[#050505]/95 backdrop-blur-md z-50 gap-4 md:gap-0">
                    <div className="flex items-center justify-between w-full md:w-auto gap-4">
                        <Link href="/ads" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
                            <div className="p-2 rounded-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </Link>
                        <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent truncate">
                            {isEditMode ? "Edit Campaign" : "Create Campaign"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <div className="text-right hidden lg:block">
                            <div className="text-sm font-semibold text-neutral-200">
                                {isEditMode ? "Editing..." : "Draft saved"}
                            </div>
                            <div className="text-xs text-neutral-500">Just now</div>
                        </div>
                        <Button
                            variant="outline"
                            className="border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:text-white hover:bg-neutral-800"
                            onClick={() => handleSubmit('draft')}
                            disabled={isSubmitting}
                        >
                            Save Draft
                        </Button>
                        <Button
                            className="bg-white text-black hover:bg-neutral-200"
                            onClick={() => handleSubmit('active')}
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditMode && initialData?.status === 'active' ? "Update Campaign" : "Publish Campaign"}
                        </Button>

                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full pb-32">

                    {/* LEFT: Form Sections */}
                    <div className="lg:col-span-7 space-y-12">

                        {/* SECTION 1: CREATIVE */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold border border-neutral-700">1</div>
                                    <h2 className="text-xl font-semibold text-white">Creative</h2>
                                </div>
                                <div className="text-xs font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
                                    Base Cost: $0.00
                                </div>
                            </div>

                            <div className="mt-4 lg:mt-0 lg:ml-12 p-4 md:p-6 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-6 md:space-y-8">
                                {/* Asset Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-300">Images or Video <span className="text-red-500">*</span></label>
                                    <div
                                        className="border-2 border-dashed border-neutral-800 rounded-lg p-8 flex flex-col items-center justify-center gap-4 hover:border-neutral-700 transition-colors cursor-pointer group relative overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*,video/*"
                                            onChange={handleFileSelect}
                                        />

                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                                <p className="text-sm text-neutral-400">Uploading...</p>
                                            </div>
                                        ) : images.length > 0 ? (
                                            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black">
                                                <img src={images[0]} alt="Ad Creative" className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-sm font-medium text-white bg-black/50 px-3 py-1 rounded backdrop-blur">Click to change</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-4 rounded-full bg-neutral-900 group-hover:bg-neutral-800 transition-colors">
                                                    <Upload className="w-6 h-6 text-neutral-400" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-white">Drag and drop or browse</p>
                                                    <p className="text-xs text-neutral-500 mt-1">1200x628px recommended</p>
                                                </div>
                                            </>
                                        )}
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
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold border border-neutral-700">2</div>
                                    <h2 className="text-xl font-semibold text-white">Targeting & Delivery</h2>
                                </div>
                                <div className="text-xs font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
                                    Budget: ${(budget * duration).toFixed(2)}
                                </div>
                            </div>

                            <div className="mt-4 lg:mt-0 lg:ml-12 p-4 md:p-6 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-6 md:space-y-8">
                                {/* Map */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-neutral-300">Locations</label>
                                        <div className="flex items-center gap-2">
                                            {selectedCountries.slice(0, 5).map(id => (
                                                <Badge key={id} variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs font-mono">
                                                    {ALL_COUNTRIES[id] || id}
                                                </Badge>
                                            ))}
                                            {selectedCountries.length > 5 && (
                                                <span className="text-xs text-neutral-500">+{selectedCountries.length - 5} more</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="rounded-lg overflow-hidden border border-neutral-800 relative group">
                                        {/* Tool Bar */}
                                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                                            <div className="pointer-events-auto">
                                                <select
                                                    className="bg-black/60 backdrop-blur border border-neutral-800 text-xs text-white rounded px-3 py-1.5 outline-none focus:border-indigo-500 hover:bg-black/80 transition-colors cursor-pointer appearance-none pr-8 relative"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'world') {
                                                            if (availableCountries.length > 0) setSelectedCountries(availableCountries.map(c => c.id));
                                                        } else if (val === 'clear') {
                                                            setSelectedCountries([]);
                                                        } else if (REGIONS[val]) {
                                                            setSelectedCountries(REGIONS[val]);
                                                        }
                                                        e.target.value = "default"; // Reset
                                                    }}
                                                    defaultValue="default"
                                                >
                                                    <option value="default" disabled>Quick Select...</option>
                                                    <option value="world">Entire World</option>
                                                    {Object.keys(REGIONS).map((region) => (
                                                        <option key={region} value={region}>{region}</option>
                                                    ))}
                                                    <option disabled>──────────</option>
                                                    <option value="clear" className="text-red-400">Clear All</option>
                                                </select>
                                            </div>
                                            <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded text-xs text-neutral-400 border border-neutral-800">
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
                                    <div className="bg-neutral-900/30 rounded-lg p-4 border border-neutral-800/50">
                                        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                                            Weekly Estimates
                                            <span className="ml-2 px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-normal normal-case">
                                                Risk Level: {userCount > 10 ? 'Low' : 'High'}
                                            </span>
                                        </h3>
                                        <div className="space-y-3">
                                            {loadingEstimates ? (
                                                <div className="flex items-center justify-center py-4">
                                                    <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
                                                </div>
                                            ) : estimates.impressions.max === 0 ? (
                                                <div className="text-center py-4 text-neutral-500 text-sm">
                                                    <p>No reach in selected area.</p>
                                                    <p className="text-xs mt-1">Select more countries.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-neutral-400">Impressions</div>
                                                        <div className="text-lg font-bold text-white tracking-tight font-mono">
                                                            {estimates.impressions.min.toLocaleString()} - {estimates.impressions.max.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                                                        <div className="text-sm text-neutral-400">Clicks</div>
                                                        <div className="text-lg font-bold text-white tracking-tight font-mono">
                                                            {estimates.clicks.min.toLocaleString()} - {estimates.clicks.max.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
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

                            <div className="mt-4 lg:mt-0 lg:ml-12 p-4 md:p-6 rounded-xl bg-[#0a0a0a] border border-neutral-800 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}`}
                                        onClick={() => setPaymentMethod('stripe')}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                                <CreditCard className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="text-sm font-medium text-white">Card</div>
                                        </div>
                                        <div className="text-xs text-neutral-400">Powered by Stripe</div>
                                    </div>

                                    <div
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'x402' ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}`}
                                        onClick={() => setPaymentMethod('x402')}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                                <Zap className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <div className="text-sm font-medium text-white">Crypto</div>
                                        </div>
                                        <div className="text-xs text-neutral-400">Via X402 Protocol</div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="mt-8 pt-6 border-t border-neutral-800 space-y-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Order Summary</h3>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Campaign Budget</span>
                                        <span className="text-white">${(budget * duration).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Platform Fee</span>
                                        <span className="text-white">$0.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Estimated Tax (25%)</span>
                                        <span className="text-white">${((budget * duration) * 0.25).toFixed(2)}</span>
                                    </div>

                                    <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
                                        <span className="font-semibold text-white">Total Due</span>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-white">${((budget * duration) * 1.25).toFixed(2)}</div>
                                            <div className="text-xs text-neutral-500">Includes all applicable taxes</div>
                                        </div>
                                    </div>
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
                                        {images && images.length > 0 ? (
                                            <img src={images[0]} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-12 h-12 opacity-50" />
                                        )}
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
                                <span className="text-neutral-500">Auto-approved for safe categories</span>
                            </div>

                        </div>
                    </div>
                </main>
            </div >

            <Dialog open={cryptoModalOpen} onOpenChange={setCryptoModalOpen}>
                <DialogContent className="bg-[#0a0a0a] border-neutral-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Complete Payment</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Send the exact amount to the address below to activate your campaign.
                        </DialogDescription>
                    </DialogHeader>

                    {cryptoDetails && (
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Network</label>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">B</div>
                                    <span className="font-medium text-white">Base Mainnet</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Amount</label>
                                <div className="text-2xl font-bold font-mono text-white tracking-tight">
                                    {(Number(cryptoDetails.amount) / 100).toFixed(2)} <span className="text-neutral-500 text-lg">USDC</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Recipient Address</label>
                                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 break-all font-mono text-xs text-neutral-300 flex items-center justify-between gap-4">
                                    <span>{cryptoDetails.recipient}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 hover:bg-neutral-800" onClick={() => navigator.clipboard.writeText(cryptoDetails.recipient)}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-xs text-orange-200 flex items-start gap-2">
                                <Zap className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                <span >Funds must be sent on <strong>Base</strong> network. Sending on other chains may result in loss of funds.</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <div className="flex w-full gap-2">
                            <Link href="/ads" className="w-full">
                                <Button variant="outline" className="w-full border-neutral-800 hover:bg-neutral-800 hover:text-white" onClick={() => setCryptoModalOpen(false)}>
                                    Pay Later
                                </Button>
                            </Link>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" onClick={async () => {
                                if (!cryptoDetails?.campaignId) return;

                                try {
                                    const res = await fetch(`/api/ads/campaigns/${cryptoDetails.campaignId}/activate/confirm`, {
                                        method: 'POST',
                                    });

                                    if (res.ok) {
                                        setCryptoModalOpen(false);
                                        router.push('/ads?success=true');
                                    } else {
                                        alert("Activation failed. Please try again.");
                                    }
                                } catch (error) {
                                    console.error(error);
                                    alert("Error confirming payment.");
                                }
                            }}>
                                I Have Sent It
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div >
    );
}
