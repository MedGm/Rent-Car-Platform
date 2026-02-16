"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, Car, AlertCircle, CheckCircle, TrendingUp, DollarSign } from "lucide-react";
import { BookingTrendsChart, StatusDistributionChart, PopularCarsChart, RevenueChart } from "@/components/admin/DashboardCharts";

interface Booking {
    id: number;
    car_id: number;
    car_name: string;
    start_date: string;
    end_date: string;
    status: string;
    total_price: number;
    created_at: string;
}

interface CarData {
    id: number;
    name: string;
    category: string;
    is_active: boolean;
}

export default function DashboardPage() {
    const [stats, setStats] = useState({ cars: 0, bookings: 0, revenue: 0, confirmed: 0 });
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [cars, setCars] = useState<CarData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem("admin_token");

            try {
                const [carsRes, bookingsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cars`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (carsRes.ok) {
                    const carsData = await carsRes.json();
                    setCars(carsData);
                    setStats(prev => ({ ...prev, cars: Array.isArray(carsData) ? carsData.length : 0 }));
                }

                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json();
                    setBookings(bookingsData);

                    if (Array.isArray(bookingsData)) {
                        const confirmed = bookingsData.filter(b => b.status === "confirmed");
                        const totalRevenue = confirmed.reduce((sum, b) => sum + (b.total_price || 0), 0);
                        setStats(prev => ({
                            ...prev,
                            bookings: bookingsData.length,
                            confirmed: confirmed.length,
                            revenue: totalRevenue
                        }));
                    }
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // ─── Data Processing for Charts ───

    // 1. Monthly Trends (Bookings & Revenue)
    const monthlyTrends = useMemo(() => {
        const trends: Record<string, { bookings: number, revenue: number }> = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize with 0
        months.forEach(m => trends[m] = { bookings: 0, revenue: 0 });

        bookings.forEach(b => {
            const date = new Date(b.start_date);
            const monthName = months[date.getMonth()];
            if (trends[monthName]) {
                trends[monthName].bookings++;
                if (b.status === "confirmed") {
                    trends[monthName].revenue += (b.total_price || 0);
                }
            }
        });

        return months.map(name => ({
            name,
            bookings: trends[name].bookings,
            revenue: trends[name].revenue
        }));
    }, [bookings]);

    // 2. Booking Status Distribution
    const statusDistribution = useMemo(() => {
        const counts: Record<string, number> = { confirmed: 0, pending: 0, cancelled: 0 };
        bookings.forEach(b => {
            const status = b.status?.toLowerCase() || 'pending';
            if (counts[status] !== undefined) counts[status]++;
            else counts[status] = 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [bookings]);

    // 3. Popular Cars (Top 5)
    const popularCars = useMemo(() => {
        const data: Record<string, { bookings: number, revenue: number }> = {};
        bookings.forEach(b => {
            const name = b.car_name || cars.find(c => c.id === b.car_id)?.name || "Unknown Car";
            if (!data[name]) data[name] = { bookings: 0, revenue: 0 };
            data[name].bookings++;
            if (b.status === "confirmed") {
                data[name].revenue += (b.total_price || 0);
            }
        });

        return Object.entries(data)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 5);
    }, [bookings, cars]);

    // 4. Recent Bookings (Last 5)
    const recentBookings = useMemo(() => {
        return [...bookings]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
    }, [bookings]);


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground">Monitor your fleet performance and revenue.</p>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Updates
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white group-hover:scale-110 transition-transform">
                        <Car className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Fleet</div>
                        <div className="text-2xl font-extrabold text-foreground">{stats.cars}</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Bookings</div>
                        <div className="text-2xl font-extrabold text-foreground">{stats.bookings}</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700 group-hover:scale-110 transition-transform">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
                        <div className="text-2xl font-extrabold text-foreground">{stats.revenue.toLocaleString()} DH</div>
                        <div className="text-xs text-green-600 font-bold">Approved Only</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 group-hover:scale-110 transition-transform">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">Approved Bookings</div>
                        <div className="text-2xl font-extrabold text-foreground">{stats.confirmed}</div>
                        <div className="text-xs text-muted-foreground">
                            {stats.bookings > 0 ? ((stats.confirmed / stats.bookings) * 100).toFixed(1) : 0}% Conversion
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <RevenueChart data={monthlyTrends} />
                <StatusDistributionChart data={statusDistribution} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <BookingTrendsChart data={monthlyTrends} />
                <PopularCarsChart data={popularCars} />

                {/* Recent Activity / Mini Table */}
                <div className="col-span-2 lg:col-span-4 rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
                        <div className="space-y-4">
                            {recentBookings.map(booking => (
                                <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{booking.car_name}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {booking.status}
                                    </div>
                                </div>
                            ))}
                            {recentBookings.length === 0 && (
                                <div className="text-center text-muted-foreground py-4">No recent activity</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
