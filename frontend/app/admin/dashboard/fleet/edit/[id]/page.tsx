"use client";

import { useEffect, useState } from "react";
import { CarForm } from "@/components/admin/CarForm";
import { useRouter } from "next/navigation";

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchCar() {
            try {
                const { id } = await params;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cars/${id}`);
                if (!res.ok) throw new Error("Car not found");
                const data = await res.json();
                setCar(data);
            } catch (error) {
                console.error("Error fetching car:", error);
                router.push("/admin/dashboard/fleet");
            } finally {
                setLoading(false);
            }
        }
        fetchCar();
    }, [params, router]);

    if (loading) return <div>Loading...</div>;
    if (!car) return <div>Car not found</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Car</h1>
            <CarForm initialData={car} isEdit={true} />
        </div>
    );
}
