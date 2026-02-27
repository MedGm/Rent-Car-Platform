import { notFound } from "next/navigation";
import { CarDetailsContent } from "@/components/CarDetailsContent";

async function getCar(id: string) {
    try {
        // Server-side: use Docker internal URL; client-side fallback to public URL
        const apiUrl = process.env.INTERNAL_API_URL || 'http://backend:5000/api';
        const url = `${apiUrl}/cars/${id}`;
        console.log(`[getCar] Fetching: ${url}`);

        const res = await fetch(url, {
            cache: 'no-store'
        });

        console.log(`[getCar] Response status: ${res.status}`);

        if (!res.ok) {
            console.error(`[getCar] Failed to fetch car ${id}: ${res.status} ${res.statusText}`);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error(`[getCar] Error fetching car ${id}:`, error);
        return null;
    }
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Add debug log
    console.log(`[CarDetailsPage] Rendering car details for ID: ${id}`);

    const car = await getCar(id);

    if (!car) {
        console.error(`[CarDetailsPage] Car not found for ID: ${id}`);
        notFound();
    }

    return <CarDetailsContent car={car} />;
}
