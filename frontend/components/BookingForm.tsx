"use client";

import { useState } from "react";
import { X, Calendar, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface BookingFormProps {
    carId: number;
    carName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function BookingForm({ carId, carName, isOpen, onClose }: BookingFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
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

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (error) {
            alert("Failed to submit booking. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl bg-white p-0 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="bg-neutral-900 p-6 text-white flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Request to Rent</h2>
                        <p className="text-neutral-400 text-sm mt-1">{carName}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Request Sent!</h3>
                                <p className="text-muted-foreground">We will contact you shortly to confirm.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        required
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="driver_name">Full Name</Label>
                                <Input
                                    id="driver_name"
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={formData.driver_name}
                                    onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                                    className="h-11"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        placeholder="+1 234 567 8900"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 mt-2"
                            >
                                {loading ? "Submitting..." : "Submit Request"} <Calendar className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
