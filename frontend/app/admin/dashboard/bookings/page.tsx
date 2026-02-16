"use client";

import { useEffect, useState } from "react";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
    id: number;
    car_name: string;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
    total_price: number;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchBookings() {
        const token = localStorage.getItem("admin_token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setBookings(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(id: number, status: string) {
        const token = localStorage.getItem("admin_token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                fetchBookings(); // Refresh list
            } else {
                alert("Failed to update status. Check for conflicts.");
            }
        } catch (error) {
            console.error("Error updating status");
        }
    }

    useEffect(() => {
        fetchBookings();
    }, []);

    if (loading) return <div>Loading bookings...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="p-4 font-medium text-muted-foreground">Car</th>
                            <th className="p-4 font-medium text-muted-foreground">Dates</th>
                            <th className="p-4 font-medium text-muted-foreground">Total</th>
                            <th className="p-4 font-medium text-muted-foreground">Status</th>
                            <th className="p-4 font-medium text-muted-foreground">Created</th>
                            <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-muted/5">
                                <td className="p-4 font-bold">{booking.car_name}</td>
                                <td className="p-4">
                                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                </td>
                                <td className="p-4 font-semibold text-primary">
                                    {booking.total_price ? `${booking.total_price.toLocaleString()} DH` : '-'}
                                </td>
                                <td className="p-4">
                                    <span className={cn(
                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                        booking.status === 'confirmed' ? "bg-green-100 text-green-800" :
                                            booking.status === 'cancelled' ? "bg-red-100 text-red-800" :
                                                "bg-yellow-100 text-yellow-800"
                                    )}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {new Date(booking.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(booking.id, 'confirmed')}
                                                    className="rounded p-1 text-green-600 hover:bg-green-100" title="Confirm"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(booking.id, 'cancelled')}
                                                    className="rounded p-1 text-red-600 hover:bg-red-100" title="Cancel"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'confirmed' && (
                                            <button
                                                onClick={() => updateStatus(booking.id, 'cancelled')}
                                                className="rounded p-1 text-red-600 hover:bg-red-100" title="Cancel"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">No bookings found.</div>
                )}
            </div>
        </div>
    );
}
