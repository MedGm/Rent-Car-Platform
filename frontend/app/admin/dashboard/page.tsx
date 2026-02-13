"use client";

import { useEffect, useState } from "react";
import { Calendar, Car, AlertCircle, CheckCircle } from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState({ cars: 0, bookings: 0 });

    useEffect(() => {
        async function fetchStats() {
            const token = localStorage.getItem("admin_token");

            try {
                const [carsRes, bookingsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cars`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const cars = await carsRes.json();
                const bookings = bookingsRes.ok ? await bookingsRes.json() : [];

                setStats({
                    cars: Array.isArray(cars) ? cars.length : 0,
                    bookings: Array.isArray(bookings) ? bookings.length : 0
                });

            } catch (error) {
                console.error("Failed to load dashboard stats");
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Total Cars</div>
                            <div className="text-2xl font-bold">{stats.cars}</div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Total Bookings</div>
                            <div className="text-2xl font-bold">{stats.bookings}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
