"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";
import { LanguageSelector } from "@/components/LanguageSelector";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const NAV_LINKS = [
        { label: t.nav_cars, href: "#cars" },
        { label: t.nav_services, href: "#services" },
        { label: t.nav_articles, href: "#articles" },
        { label: t.nav_contact, href: "#contact" },
    ];

    const whatsappUrl = `https://wa.me/212671920545?text=${encodeURIComponent(t.whatsapp_message)}`;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            if (pathname !== "/") {
                router.push("/" + href);
                setMobileOpen(false);
                return;
            }
            const el = document.querySelector(href);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            setMobileOpen(false);
        }
    };

    return (
        <>
            <nav
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-background/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/30 border-b border-border"
                    : "bg-transparent"
                    }`}
            >
                <div className="container mx-auto flex h-16 items-center justify-between sm:h-24 px-4">
                    {/* Brand Name */}
                    <Link href="/" className="flex items-center group">
                        <div className="relative flex items-center justify-center px-3 py-2">
                            {/* Synced background */}
                            <div
                                className={`absolute inset-0 rounded-lg bg-white transition-opacity duration-200 ${!scrolled && theme !== "dark"
                                    ? "opacity-90 shadow-sm"
                                    : "opacity-0"
                                    }`}
                            />

                            {/* Logo */}
                            <div className="relative z-10">
                                <Image
                                    src="/logo.png"
                                    alt="Misters Drivers Logo"
                                    width={1000}
                                    height={500}
                                    priority
                                    className={`h-11 sm:h-15 w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${theme === "dark" ? "brightness-0 invert" : ""
                                        }`}
                                />
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${scrolled
                                    ? "text-foreground/70 hover:text-foreground hover:bg-accent"
                                    : "text-white/80 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Language selector */}
                        <LanguageSelector
                            className={scrolled
                                ? "text-foreground/70 hover:bg-accent hover:text-foreground"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }
                        />

                        {/* Dark mode toggle */}
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle dark mode"
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${scrolled
                                ? "text-foreground/70 hover:bg-accent hover:text-foreground"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {theme === "dark" ? (
                                <Sun className="h-[18px] w-[18px]" />
                            ) : (
                                <Moon className="h-[18px] w-[18px]" />
                            )}
                        </button>

                        {/* Book Now CTA */}
                        <Link
                            href={whatsappUrl}
                            target="_blank"
                            className="hidden sm:inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:scale-105 hover:bg-red-600 hover:shadow-red-600/40 active:scale-100"
                        >
                            {t.nav_book_now}
                        </Link>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                            className={`flex md:hidden h-9 w-9 items-center justify-center rounded-full transition-colors ${scrolled
                                ? "text-foreground/70 hover:bg-accent"
                                : "text-white/80 hover:bg-white/10"
                                }`}
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile slide-in panel */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Panel */}
                    <div className="absolute end-0 top-0 h-full w-72 bg-background border-s border-border shadow-2xl p-6 pt-24 flex flex-col gap-2 animate-in slide-in-from-right">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="rounded-lg px-4 py-3 text-base font-medium text-foreground/80 hover:bg-accent hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="mt-4 pt-4 border-t border-border">
                            <Link
                                href={whatsappUrl}
                                target="_blank"
                                className="flex h-12 items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-600"
                                onClick={() => setMobileOpen(false)}
                            >
                                {t.nav_book_now}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
