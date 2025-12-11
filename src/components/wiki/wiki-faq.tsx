"use client";

import { useState } from "react";
import { MessageSquarePlus, MessageSquare, Send, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
    id: string;
    question: string;
    answer?: string | null;
    createdAt: Date;
}

interface WikiFAQProps {
    topicId: string;
    initialFaqs?: FAQItem[];
}

export function WikiFAQ({ topicId, initialFaqs = [] }: WikiFAQProps) {
    const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);
    const [question, setQuestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsSubmitting(true);
        // Keep UI optimistic
        const tempId = Math.random().toString();
        const newFaq: FAQItem = {
            id: tempId,
            question: question,
            answer: null, // Pending answer
            createdAt: new Date()
        };

        setFaqs([newFaq, ...faqs]);
        setQuestion("");
        setOpenId(tempId); // Auto-open to show loading state

        try {
            const res = await fetch('/api/wiki/faq', {
                method: 'POST',
                body: JSON.stringify({ topicId, question })
            });

            if (!res.ok) throw new Error("Failed to fetch answer");

            const savedFaq = await res.json();

            // Replace optimistic item with real one
            setFaqs(current => current.map(f => f.id === tempId ? {
                ...savedFaq,
                createdAt: new Date(savedFaq.createdAt) // Ensure Date object
            } : f));

        } catch (e) {
            console.error("FAQ Error:", e);
            // Revert or show error state
            // For now, let's leave it as "thinking" or set error text
            setFaqs(current => current.map(f => f.id === tempId ? { ...f, answer: "Sorry, I couldn't generate an answer right now." } : f));
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleOpen = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <section className="mt-12 pt-8 border-t border-border/40">
            <div className="flex items-center gap-3 mb-12">
                <MessageSquarePlus className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-serif font-bold">Frequently Asked Questions</h3>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="relative group mb-12">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="w-full pl-6 pr-14 py-4 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                    disabled={isSubmitting}
                />
                <button
                    type="submit"
                    disabled={!question.trim() || isSubmitting}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>

            {/* List */}
            <div className="space-y-6">
                {faqs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground/60 italic text-sm">
                        No questions yet. Be the first to ask!
                    </div>
                ) : (
                    faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="border border-border rounded-xl overflow-hidden bg-card hover:border-border/80 transition-colors"
                        >
                            <button
                                onClick={() => toggleOpen(faq.id)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/5 transition-colors"
                            >
                                <span className="font-medium flex items-center gap-3">
                                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                    {faq.question}
                                </span>
                                {openId === faq.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </button>

                            {openId === faq.id && (
                                <div className="p-4 pt-0 pl-11 text-muted-foreground text-sm leading-relaxed border-t border-dashed border-border/50 bg-muted/10 group">
                                    {faq.answer ? (
                                        faq.answer
                                    ) : (
                                        <span className="italic flex items-center gap-2 text-primary">
                                            <Sparkles className="w-3 h-3" />
                                            AI is thinking about an answer...
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
