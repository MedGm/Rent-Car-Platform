"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Plane,
    Clock,
    Shield,
    Gauge,
    UserCheck,
    Baby,
    type LucideIcon,
} from "lucide-react";

interface ServiceData {
    id: number;
    title: string;
    description: string;
    icon: string;
    is_active: boolean;
    sort_order: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
    Plane,
    Clock,
    Shield,
    Gauge,
    UserCheck,
    Baby,
};

export function Services() {
    const [services, setServices] = useState<ServiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        async function fetchServices() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/services`
                );
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setServices(data);
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchServices();
    }, []);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll, { passive: true });
        window.addEventListener("resize", checkScroll);
        return () => {
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [services]);

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth || 340;
        el.scrollBy({ left: direction === "left" ? -cardWidth - 24 : cardWidth + 24, behavior: "smooth" });
    };

    return (
        <section id="services" className="py-20 sm:py-28 bg-secondary/50 dark:bg-secondary/30">
            <div className="container mx-auto px-6 sm:px-4">
                {/* Section Header */}
                <div className="mb-12 flex flex-col items-center text-center md:flex-row md:items-end md:justify-between md:text-left gap-8">
                    <div className="max-w-2xl">
                        <span className="inline-block rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                            Ce que nous offrons
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground leading-tight">
                            Our <span className="text-primary">Services</span>
                        </h2>
                        <p className="mt-4 text-muted-foreground text-base sm:text-lg">
                            Everything you need for a seamless and worry-free rental experience.
                        </p>
                    </div>

                    {/* Carousel Controls */}
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-all hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-all hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                {loading ? (
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-[200px] min-w-[300px] animate-pulse rounded-2xl bg-muted"
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth pb-8 -mb-4 snap-x snap-mandatory scrollbar-hide no-scrollbar"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {services.map((service) => {
                            const IconComponent = ICON_MAP[service.icon] || Shield;
                            return (
                                <div
                                    key={service.id}
                                    className="group relative min-w-[280px] sm:min-w-[320px] max-w-[360px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-red-900/15 hover:-translate-y-1"
                                >
                                    {/* Icon */}
                                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                        <IconComponent className="h-6 w-6" />
                                    </div>

                                    <h3 className="text-lg font-bold text-card-foreground mb-2">
                                        {service.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
