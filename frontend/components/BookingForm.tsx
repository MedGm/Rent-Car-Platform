"use client";

import { useState } from "react";
import { X, Calendar } from "lucide-react";

interface BookingFormProps {
    carId: number;
    carName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function BookingForm({ carId, carName, isOpen, onClose }: BookingFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        driver_name: "",
        email: "",
        phone: "",
    });

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, car_id: carId }),
            });

            if (!res.ok) throw new Error("Booking failed");

            alert("Booking request submitted successfully! We will contact you shortly.");
            onClose();
        } catch (error) {
            alert("Failed to submit booking. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Request to Rent: {carName}</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-muted transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                required
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                required
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="John Doe"
                            value={formData.driver_name}
                            onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <input
                            type="tel"
                            required
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="+1 234 567 8900"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-white transition-all hover:bg-primary/90 mt-4 disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit Request"} <Calendar className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
