"use client";

import Image from "next/image";
import Link from "next/link";
import { Car, Users, Fuel, Cog } from "lucide-react";

interface CarProps {
    id: number;
    name: string;
    category: string;
    specs: {
        seats?: number;
        transmission?: string;
        fuel?: string;
    };
    images: string[];
    brand_logo?: string;
    is_active: boolean;
}

export function CarCard({ car }: { car: CarProps }) {
    return (
        <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg hover:border-primary/50">
            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                {car.images[0] ? (
                    <Image
                        src={car.images[0]}
                        alt={car.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Car className="h-12 w-12 opacity-50" />
                    </div>
                )}
                <div className="absolute top-2 right-2 rounded-full bg-background/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
                    {car.category}
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-center gap-3">
                    {car.brand_logo && (
                        <img
                            src={car.brand_logo}
                            alt="brand"
                            className="h-8 w-8 object-contain"
                        />
                    )}
                    <h3 className="text-xl font-bold">{car.name}</h3>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-red-500" />
                        <span className="font-semibold text-foreground">Seats:</span> {car.specs.seats || "-"}
                    </div>
                    <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-red-500" />
                        <span className="font-semibold text-foreground">Fuel:</span> {car.specs.fuel || "-"}
                    </div>
                    <div className="flex items-center gap-2">
                        <Cog className="h-4 w-4 text-red-500" />
                        <span className="font-semibold text-foreground">Trans:</span> {car.specs.transmission || "-"}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-medium text-green-600">Available Now</span>
                    </div>

                    <Link
                        href={`/cars/${car.id}`}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
