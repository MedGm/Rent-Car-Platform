"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash, Edit } from "lucide-react";

interface Car {
    id: number;
    name: string;
    category: string;
    images?: string[];
    brand_logo?: string;
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
            } catch {
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
        } catch {
            alert("Failed to delete car");
        }
    }

    if (loading) return <div>Loading fleet...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Fleet Management</h1>
                    <p className="text-muted-foreground mt-1">Manage your vehicle inventory and pricing.</p>
                </div>
                <Link href="/admin/dashboard/fleet/add" className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-neutral-800 hover:scale-105 active:scale-95">
                    <Plus className="h-4 w-4" /> Add Vehicle
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cars.map((car) => (
                    <div key={car.id} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl">
                        {/* Image Area */}
                        <div className="relative h-48 w-full bg-gray-100">
                            {car.images && car.images.length > 0 ? (
                                <img
                                    src={car.images[0] || "/placeholder-car.jpg"}
                                    alt={car.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    <span className="text-sm">No Image</span>
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className={`flex h-2 w-2 rounded-full ${car.is_active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
                            </div>
                            <div className="absolute bottom-3 left-3">
                                <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                    {car.category}
                                </span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5">
                            <div className="flex items-center gap-2">
                                {car.brand_logo && (
                                    <img src={car.brand_logo} alt="brand" className="h-6 w-6 object-contain" />
                                )}
                                <h3 className="text-lg font-bold text-gray-900">{car.name}</h3>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <Link href={`/admin/dashboard/fleet/edit/${car.id}`} className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                                    <Edit className="h-3.5 w-3.5" /> Edit
                                </Link>
                                <button
                                    onClick={() => deleteCar(car.id)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100 hover:border-red-200"
                                    title="Delete Car"
                                >
                                    <Trash className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
