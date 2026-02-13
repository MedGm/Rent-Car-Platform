"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CarCard } from "@/components/CarCard";

// Define the interface locally or import from types
interface Car {
    id: number;
    name: string;
    category: string;
    specs: any;
    images: string[];
    is_active: boolean;
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

            <div className="container py-12">
                <h1 className="mb-8 text-4xl font-extrabold tracking-tight">Our Fleet</h1>

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
        </main>
    );
}
