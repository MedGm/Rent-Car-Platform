"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const NAV_LINKS = [
    { label: "Cars", href: "#cars" },
    { label: "Services", href: "#services" },
    { label: "Articles", href: "#articles" },
    { label: "Contact", href: "#contact" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault();
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
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-background/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/30 border-b border-border"
                    : "bg-transparent"
                    }`}
            >
                <div className="container mx-auto flex h-16 items-center justify-between sm:h-20 px-4">
                    {/* Brand Name */}
                    <Link href="/" className="shrink-0 text-lg xs:text-xl sm:text-2xl font-extrabold tracking-tighter sm:tracking-tight uppercase">
                        <span className={`transition-colors ${scrolled ? "text-foreground" : "text-white"}`}>
                            MISTERS{" "}
                        </span>
                        <span className={`transition-colors ${scrolled
                            ? "text-primary"
                            : theme === "dark"
                                ? "text-red-500"
                                : "text-white"
                            }`}>
                            DRIVERS
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${scrolled
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
                            href="https://wa.me/212671920545?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20un%20v%C3%A9hicule."
                            target="_blank"
                            className="hidden sm:inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:scale-105 hover:bg-red-600 hover:shadow-red-600/40 active:scale-100"
                        >
                            Book Now
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
                    <div className="absolute right-0 top-0 h-full w-72 bg-background border-l border-border shadow-2xl p-6 pt-24 flex flex-col gap-2 animate-in slide-in-from-right">
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
                                href="https://wa.me/212671920545?text=Bonjour%2C%20je%20souhaite%20r%C3%A9server%20un%20v%C3%A9hicule."
                                target="_blank"
                                className="flex h-12 items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-600"
                                onClick={() => setMobileOpen(false)}
                            >
                                Book Now
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
