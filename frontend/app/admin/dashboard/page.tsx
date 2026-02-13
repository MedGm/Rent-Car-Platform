"use client";

import { useEffect, useState } from "react";
import { Calendar, Car, AlertCircle, CheckCircle } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState({ cars: 0, bookings: 0 });

    useEffect(() => {
        async function fetchStats() {
            const token = localStorage.getItem("admin_token");

            try {
                const carsUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cars`;
                console.log("Fetching cars from:", carsUrl);

                const [carsRes, bookingsRes] = await Promise.all([
                    fetch(carsUrl),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!carsRes.ok) console.error("Cars fetch failed:", carsRes.status);
                const cars = await carsRes.json();
                console.log("Cars data:", cars);

                const bookings = bookingsRes.ok ? await bookingsRes.json() : [];

                setStats({
                    cars: Array.isArray(cars) ? cars.length : 0,
                    bookings: Array.isArray(bookings) ? bookings.length : 0
                });

            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white">
                            <Car className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Total Fleet</div>
                            <div className="text-2xl font-extrabold text-foreground">{stats.cars}</div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Active Bookings</div>
                            <div className="text-2xl font-extrabold text-foreground">{stats.bookings}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
