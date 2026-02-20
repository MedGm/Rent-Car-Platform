"use client";

import { useEffect, useState } from "react";
import { Check, X, Eye, ArrowLeft, User, MapPin, FileText, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerDetails {
    address_morocco?: string;
    address_abroad?: string;
    license_number?: string;
    license_issued_at?: string;
    passport?: string;
    cin?: string;
    cin_valid_until?: string;
    birth_date?: string;
    nationality?: string;
    delivery_location?: string;
    return_location?: string;
    documents?: {
        cin_recto?: string;
        cin_verso?: string;
        license_recto?: string;
        license_verso?: string;
    };
}

interface Booking {
    id: number;
    car_name: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_details: CustomerDetails;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
    total_price: number;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
                fetchBookings();
                if (selectedBooking?.id === id) {
                    setSelectedBooking(prev => prev ? { ...prev, status } : null);
                }
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

    // Detail view
    if (selectedBooking) {
        const b = selectedBooking;
        const d = b.customer_details || {};
        const docs = d.documents || {};
        const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

        return (
            <div className="space-y-6">
                <button onClick={() => setSelectedBooking(null)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to bookings
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Booking #{b.id}</h1>
                        <p className="text-muted-foreground mt-1">{b.car_name} &middot; {new Date(b.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                            b.status === 'confirmed' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                b.status === 'cancelled' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}>
                            {b.status}
                        </span>
                        {b.status === 'pending' && (
                            <>
                                <button onClick={() => updateStatus(b.id, 'confirmed')}
                                    className="rounded-lg px-3 py-1.5 text-sm font-medium bg-green-600 text-white hover:bg-green-700">
                                    <Check className="h-4 w-4 inline me-1" /> Confirm
                                </button>
                                <button onClick={() => updateStatus(b.id, 'cancelled')}
                                    className="rounded-lg px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700">
                                    <X className="h-4 w-4 inline me-1" /> Cancel
                                </button>
                            </>
                        )}
                        {b.status === 'confirmed' && (
                            <button onClick={() => updateStatus(b.id, 'cancelled')}
                                className="rounded-lg px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700">
                                <X className="h-4 w-4 inline me-1" /> Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rental Info */}
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Rental Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <DetailItem label="Start Date" value={new Date(b.start_date).toLocaleDateString()} />
                            <DetailItem label="End Date" value={new Date(b.end_date).toLocaleDateString()} />
                            <DetailItem label="Total Price" value={b.total_price ? `${b.total_price.toLocaleString()} DH` : '-'} highlight />
                            <DetailItem label="Duration" value={`${Math.ceil((new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / (1000 * 60 * 60 * 24))} days`} />
                            <DetailItem label="Delivery Location" value={d.delivery_location} />
                            <DetailItem label="Return Location" value={d.return_location} />
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><User className="h-4 w-4" /> Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <DetailItem label="Full Name" value={b.customer_name} />
                            <DetailItem label="Email" value={b.customer_email} />
                            <DetailItem label="Phone" value={b.customer_phone} />
                            <DetailItem label="Nationality" value={d.nationality} />
                            <DetailItem label="Date of Birth" value={d.birth_date} />
                            <DetailItem label="Address (Morocco)" value={d.address_morocco} />
                            <DetailItem label="Address (Abroad)" value={d.address_abroad} span2 />
                        </div>
                    </div>

                    {/* Identity & License */}
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><FileText className="h-4 w-4" /> Identity & License</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <DetailItem label="License N°" value={d.license_number} />
                            <DetailItem label="License Issued At" value={d.license_issued_at} />
                            <DetailItem label="C.I.N. N°" value={d.cin} />
                            <DetailItem label="C.I.N. Valid Until" value={d.cin_valid_until} />
                            <DetailItem label="Passport N°" value={d.passport} />
                        </div>
                    </div>

                    {/* Document Images */}
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Uploaded Documents</h3>
                        {Object.keys(docs).length === 0 ? (
                            <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {docs.license_recto && <DocImage src={`${apiBase}${docs.license_recto}`} label="License — Front" />}
                                {docs.license_verso && <DocImage src={`${apiBase}${docs.license_verso}`} label="License — Back" />}
                                {docs.cin_recto && <DocImage src={`${apiBase}${docs.cin_recto}`} label="C.I.N. — Front" />}
                                {docs.cin_verso && <DocImage src={`${apiBase}${docs.cin_verso}`} label="C.I.N. — Back" />}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Table view
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="p-4 font-medium text-muted-foreground">Car</th>
                            <th className="p-4 font-medium text-muted-foreground">Customer</th>
                            <th className="p-4 font-medium text-muted-foreground">Dates</th>
                            <th className="p-4 font-medium text-muted-foreground">Total</th>
                            <th className="p-4 font-medium text-muted-foreground">Status</th>
                            <th className="p-4 font-medium text-muted-foreground">Created</th>
                            <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-muted/5 cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                                <td className="p-4 font-bold">{booking.car_name}</td>
                                <td className="p-4">
                                    <div className="font-medium">{booking.customer_name}</div>
                                    <div className="text-xs text-muted-foreground">{booking.customer_phone}</div>
                                </td>
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
                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => setSelectedBooking(booking)}
                                            className="rounded p-1 text-blue-600 hover:bg-blue-100" title="View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
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

function DetailItem({ label, value, highlight, span2 }: { label: string; value?: string; highlight?: boolean; span2?: boolean }) {
    return (
        <div className={span2 ? "col-span-2" : ""}>
            <div className="text-muted-foreground text-xs">{label}</div>
            <div className={cn("mt-0.5", highlight ? "font-bold text-primary text-lg" : "font-medium")}>
                {value || <span className="text-muted-foreground/50">—</span>}
            </div>
        </div>
    );
}

function DocImage({ src, label }: { src: string; label: string }) {
    return (
        <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <a href={src} target="_blank" rel="noopener noreferrer" className="block group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={label}
                    className="w-full h-32 object-cover rounded-lg border group-hover:ring-2 ring-primary transition-all" />
            </a>
        </div>
    );
}
