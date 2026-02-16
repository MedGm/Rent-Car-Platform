"use client";

import { useEffect, useState } from "react";
import { CarCard } from "@/components/CarCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface Car {
    id: number;
    name: string;
    category: string;
    specs: { seats?: number; fuel?: string; transmission?: string };
    images: string[];
    brand_logo?: string;
    is_active: boolean;
    price_per_day: number;
}

export function FeaturedCars() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        async function fetchCars() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/cars`
                );
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setCars(data.slice(0, 6));
            } catch (error) {
                console.error("Error fetching cars:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCars();
    }, []);

    return (
        <section id="cars" className="py-20 sm:py-28 bg-background">
            <div className="container mx-auto">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <span className="inline-block rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                        {t.featured_badge}
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
                        {t.featured_title_1} <span className="text-primary">{t.featured_title_2}</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                        {t.featured_desc}
                    </p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-[380px] animate-pulse rounded-2xl bg-muted"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {cars.map((car) => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                )}

                {/* View All Button */}
                <div className="mt-12 text-center">
                    <Link
                        href="/cars"
                        className="inline-flex h-12 items-center justify-center rounded-full border-2 border-primary bg-transparent px-8 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white hover:scale-105"
                    >
                        {t.featured_view_all} <ArrowRight className="ms-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
