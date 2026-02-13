"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, Edit } from "lucide-react";

interface Car {
    id: number;
    name: string;
    category: string;
    is_active: boolean;
}

export default function AdminFleetPage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCars() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cars`);
                if (res.ok) {
                    setCars(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch cars");
            } finally {
                setLoading(false);
            }
        }
        fetchCars();
    }, []);

    async function deleteCar(id: number) {
        if (!confirm("Are you sure you want to delete this car?")) return;

        const token = localStorage.getItem("admin_token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cars/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCars(cars.filter(c => c.id !== id));
            }
        } catch (err) {
            alert("Failed to delete car");
        }
    }

    if (loading) return <div>Loading fleet...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Add Car
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cars.map((car) => (
                    <div key={car.id} className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold uppercase">{car.category}</span>
                            <span className={`h-2 w-2 rounded-full ${car.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </div>
                        <h3 className="text-lg font-bold">{car.name}</h3>

                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 rounded border border-input bg-background px-3 py-1 text-sm font-medium hover:bg-muted">
                                Edit
                            </button>
                            <button
                                onClick={() => deleteCar(car.id)}
                                className="flex-1 rounded border border-destructive/20 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
