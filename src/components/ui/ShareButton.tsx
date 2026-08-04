"use client";
import { useState } from "react";

export default function ShareButton({ text, label = "שיתוף תוצאה" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={share} className="flex items-center gap-2 px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-accent transition-colors text-sm font-medium text-brand-text">
      <span>{copied ? "✅" : "📤"}</span>
      {copied ? "הועתק!" : label}
    </button>
  );
}
