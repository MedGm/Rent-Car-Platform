"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Fuel, Users, Settings2 } from "lucide-react";

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

export function CarCard({ car }: { car: Car }) {
    return (
        <Link
            href={`/cars/${car.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-red-900/20 hover:-translate-y-1"
        >
            {/* Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                {car.images?.[0] ? (
                    <Image
                        src={car.images[0]}
                        alt={car.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
                {/* Category Badge */}
                <span className="absolute top-3 left-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {car.category}
                </span>
                {/* Brand Logo */}
                {car.brand_logo && (
                    <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm p-1 shadow-sm">
                        <Image
                            src={car.brand_logo}
                            alt="Brand"
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                        {car.name}
                    </h3>
                    <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                            {car.price_per_day > 0 ? `${car.price_per_day} DH` : 'Contact us'}
                        </div>
                        <div className="text-xs text-muted-foreground">/ day</div>
                    </div>
                </div>

                {/* Specs */}
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {car.specs?.seats && (
                        <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            {car.specs.seats} Places
                        </span>
                    )}
                    {car.specs?.fuel && (
                        <span className="flex items-center gap-1.5">
                            <Fuel className="h-4 w-4" />
                            {car.specs.fuel}
                        </span>
                    )}
                    {car.specs?.transmission && (
                        <span className="flex items-center gap-1.5">
                            <Settings2 className="h-4 w-4" />
                            {car.specs.transmission}
                        </span>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-auto pt-4">
                    <span className="inline-flex h-9 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 px-5 text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-white w-full">
                        View Details
                    </span>
                </div>
            </div>
        </Link>
    );
}
