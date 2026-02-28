"use client";

import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ar", label: "العربية", flag: "🇲🇦" },
];

export function LanguageSelector({ className, dropdownClassName }: { className?: string; dropdownClassName?: string }) {
    const [langOpen, setLangOpen] = useState(false);
    const { locale, setLocale } = useLanguage();

    return (
        <div className="relative">
            <button
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Select language"
                className={cn(
                    "flex h-9 items-center gap-1.5 rounded-full px-2.5 transition-colors text-xs font-bold uppercase",
                    className
                )}
            >
                <Globe className="h-[16px] w-[16px]" />
                {LANGUAGES.find(l => l.code === locale)?.flag}
                <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                    <div className={cn(
                        "absolute end-0 top-full mt-2 z-50 min-w-[160px] rounded-xl border border-border bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
                        dropdownClassName
                    )}>
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => { setLocale(lang.code); setLangOpen(false); }}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent ${locale === lang.code ? "bg-accent/50 font-semibold text-primary" : "text-foreground/80"}`}
                            >
                                <span className="text-base">{lang.flag}</span>
                                {lang.label}
                                {locale === lang.code && (
                                    <span className="ml-auto text-primary">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
