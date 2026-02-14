"use client";

import * as LucideIcons from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ServiceItem {
    id: number;
    title: string;
    description: string;
    icon: string;
}

// Fallback services shown when the API has none
const FALLBACK_SERVICES: ServiceItem[] = [
    { id: -1, title: "24/7 Support", description: "Our team is available round the clock to assist you with your booking or on-road needs.", icon: "Clock" },
    { id: -2, title: "Premium Fleet", description: "Every vehicle is rigorously inspected and maintained to showroom standards for your safety.", icon: "Shield" },
    { id: -3, title: "Concierge Service", description: "Need a driver? Airport transfer? We offer tailored solutions to make your trip effortless.", icon: "HeartHandshake" },
];

function DynamicIcon({ name }: { name: string }) {
    const Icon = (LucideIcons as any)[name];
    if (!Icon) return <LucideIcons.Shield className="h-8 w-8 text-red-600" />;
    return <Icon className="h-8 w-8 text-red-600" />;
}

export function Services() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        fetch(`${API}/services`)
            .then(r => r.ok ? r.json() : [])
            .then((data: ServiceItem[]) => {
                setServices(data.length > 0 ? data : FALLBACK_SERVICES);
            })
            .catch(() => setServices(FALLBACK_SERVICES));
    }, []);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) el.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
        return () => {
            if (el) el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [services]);

    const scroll = (dir: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.querySelector("div")?.offsetWidth || 320;
        el.scrollBy({ left: dir === "left" ? -cardWidth - 16 : cardWidth + 16, behavior: "smooth" });
    };

    return (
        <section className="py-24 bg-white" id="services">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-16">
                    <div className="text-center flex-1">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h2>
                        <p className="mt-4 text-muted-foreground">More than just a rental. A complete mobility experience.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className="h-10 w-10 rounded-full border bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className="h-10 w-10 rounded-full border bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth pb-4 -mb-4"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="flex-shrink-0 w-[300px] sm:w-[340px] flex flex-col items-center text-center p-8 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all bg-white"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-6">
                                <DynamicIcon name={service.icon} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                            <p className="text-muted-foreground">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
