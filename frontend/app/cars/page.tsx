"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CarCard } from "@/components/CarCard";
import { Footer } from "@/components/Footer";
import Image from "next/image";

interface Car {
    id: number;
    name: string;
    category: string;
    specs: any;
    images: string[];
    is_active: boolean;
    price_per_day: number;
}

export default function CarsPage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCars() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cars`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setCars(data);
            } catch (error) {
                console.error("Error fetching cars:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCars();
    }, []);

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section for Cars Page */}
            <section className="relative h-[50vh] w-full overflow-hidden bg-black">
                <div className="absolute inset-0 opacity-60">
                    <Image
                        src="/car2.gif"
                        alt="Background"
                        fill
                        unoptimized
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
                <div className="container mx-auto relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl uppercase drop-shadow-lg">
                        Our <span className="text-primary">Fleet</span>
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-gray-200">
                        Choose from our exclusive collection of premium vehicles.
                    </p>
                </div>
            </section>

            <div className="container mx-auto py-12">
                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[400px] animate-pulse rounded-xl bg-muted" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {cars.map((car) => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
