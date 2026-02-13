import Link from "next/link";
import { CarCard } from "./CarCard";
import { ArrowRight } from "lucide-react";

async function getFeaturedCars() {
    try {
        // Use internal backend URL for server-side fetching
        const apiUrl = 'http://backend:5000/api';
        const res = await fetch(`${apiUrl}/cars`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];

        const cars = await res.json();
        return cars.slice(0, 3); // Return top 3 cars
    } catch (error) {
        return [];
    }
}

export async function FeaturedCars() {
    const cars = await getFeaturedCars();

    if (cars.length === 0) return null;

    return (
        <section className="py-24 bg-gray-50">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Premium Fleet</h2>
                        <p className="mt-2 text-muted-foreground">Choose from our exclusive selection of high-end vehicles.</p>
                    </div>
                    <Link href="/cars" className="hidden md:flex items-center text-primary font-bold hover:underline">
                        View All Cars <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {cars.map((car: any) => (
                        <CarCard key={car.id} car={car} />
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link href="/cars" className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-bold text-white transition-transform hover:scale-105">
                        View All Cars
                    </Link>
                </div>
            </div>
        </section>
    );
}
