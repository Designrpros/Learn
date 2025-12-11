"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "typescript", filename, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950/80 backdrop-blur-sm my-6", className)} {...props}>
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
          <span className="text-xs font-mono text-slate-400">{filename}</span>
          <span className="text-xs text-slate-500">{language}</span>
        </div>
      )}
      <div className="relative p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed text-slate-200">
          <code>{code}</code>
        </pre>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
    </div>
  );
}