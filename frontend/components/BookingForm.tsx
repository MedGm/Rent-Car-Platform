"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface UnavailableRange {
    start: string;
    end: string;
    type: string;
}

interface BookingFormProps {
    carId: number;
    carName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function BookingForm({ carId, carName, isOpen, onClose }: BookingFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [unavailableRanges, setUnavailableRanges] = useState<UnavailableRange[]>([]);
    const [dateConflict, setDateConflict] = useState(false);
    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        driver_name: "",
        email: "",
        phone: "",
        address_morocco: "",
        address_abroad: "",
        license_number: "",
        license_issued_at: "",
        passport: "",
        cin: "",
        cin_valid_until: "",
        birth_date: "",
        nationality: "",
        delivery_location: "",
        return_location: "",
    });

    useEffect(() => {
        if (isOpen) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/availability/${carId}`)
                .then(res => res.json())
                .then(data => setUnavailableRanges(data))
                .catch(() => setUnavailableRanges([]));
            setError("");
            setDateConflict(false);
        }
    }, [isOpen, carId]);

    const checkDateConflict = useCallback((start: string, end: string) => {
        if (!start || !end) { setDateConflict(false); return; }
        const s = new Date(start), e = new Date(end);
        setDateConflict(unavailableRanges.some(r => s < new Date(r.end) && e > new Date(r.start)));
    }, [unavailableRanges]);

    function handleDateChange(field: "start_date" | "end_date", value: string) {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        setError("");
        checkDateConflict(updated.start_date, updated.end_date);
    }

    function updateField(field: string, value: string) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (dateConflict) {
            setError("This car is not available for the selected dates.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, car_id: carId }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Booking failed");
            }
            setSuccess(true);
            setTimeout(() => { setSuccess(false); onClose(); }, 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to submit booking.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-0 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-neutral-900 p-6 text-white flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Request to Rent</h2>
                        <p className="text-neutral-400 text-sm mt-1">{carName}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 sm:p-8">
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
                            {error && (
                                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* ── Section: Rental Dates ── */}
                            <fieldset className="space-y-4">
                                <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Rental Period</legend>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="start_date">Start Date *</Label>
                                        <Input id="start_date" type="date" required value={formData.start_date}
                                            onChange={(e) => handleDateChange("start_date", e.target.value)}
                                            className={`h-10 ${dateConflict ? 'border-red-400 ring-1 ring-red-400' : ''}`} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="end_date">End Date *</Label>
                                        <Input id="end_date" type="date" required value={formData.end_date}
                                            onChange={(e) => handleDateChange("end_date", e.target.value)}
                                            className={`h-10 ${dateConflict ? 'border-red-400 ring-1 ring-red-400' : ''}`} />
                                    </div>
                                </div>
                                {dateConflict && (
                                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        These dates overlap with an existing reservation
                                    </p>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="delivery_location">Delivery Location</Label>
                                        <Input id="delivery_location" placeholder="e.g. Agadir Airport" value={formData.delivery_location}
                                            onChange={(e) => updateField("delivery_location", e.target.value)} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="return_location">Return Location</Label>
                                        <Input id="return_location" placeholder="e.g. Agadir Airport" value={formData.return_location}
                                            onChange={(e) => updateField("return_location", e.target.value)} className="h-10" />
                                    </div>
                                </div>
                            </fieldset>

                            <hr className="border-border" />

                            {/* ── Section: Personal Info ── */}
                            <fieldset className="space-y-4">
                                <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Personal Information</legend>
                                <div className="space-y-1.5">
                                    <Label htmlFor="driver_name">Full Name *</Label>
                                    <Input id="driver_name" required placeholder="Full name as on ID" value={formData.driver_name}
                                        onChange={(e) => updateField("driver_name", e.target.value)} className="h-10" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input id="email" type="email" required placeholder="john@example.com" value={formData.email}
                                            onChange={(e) => updateField("email", e.target.value)} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone">Phone *</Label>
                                        <Input id="phone" type="tel" required placeholder="+212 6XX XXX XXX" value={formData.phone}
                                            onChange={(e) => updateField("phone", e.target.value)} className="h-10" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="birth_date">Date of Birth *</Label>
                                        <Input id="birth_date" type="date" required value={formData.birth_date}
                                            onChange={(e) => updateField("birth_date", e.target.value)} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="nationality">Nationality *</Label>
                                        <Input id="nationality" required placeholder="e.g. Moroccan" value={formData.nationality}
                                            onChange={(e) => updateField("nationality", e.target.value)} className="h-10" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address_morocco">Address in Morocco</Label>
                                    <Input id="address_morocco" placeholder="Street, City" value={formData.address_morocco}
                                        onChange={(e) => updateField("address_morocco", e.target.value)} className="h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="address_abroad">Address Abroad</Label>
                                    <Input id="address_abroad" placeholder="Street, City, Country" value={formData.address_abroad}
                                        onChange={(e) => updateField("address_abroad", e.target.value)} className="h-10" />
                                </div>
                            </fieldset>

                            <hr className="border-border" />

                            {/* ── Section: Identity Documents ── */}
                            <fieldset className="space-y-4">
                                <legend className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Identity & License</legend>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="license_number">Driver&apos;s License N° *</Label>
                                        <Input id="license_number" required placeholder="License number" value={formData.license_number}
                                            onChange={(e) => updateField("license_number", e.target.value)} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="license_issued_at">Issued At</Label>
                                        <Input id="license_issued_at" placeholder="City / Country" value={formData.license_issued_at}
                                            onChange={(e) => updateField("license_issued_at", e.target.value)} className="h-10" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cin">C.I.N. N°</Label>
                                        <Input id="cin" placeholder="National ID number" value={formData.cin}
                                            onChange={(e) => updateField("cin", e.target.value)} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="cin_valid_until">C.I.N. Valid Until</Label>
                                        <Input id="cin_valid_until" type="date" value={formData.cin_valid_until}
                                            onChange={(e) => updateField("cin_valid_until", e.target.value)} className="h-10" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="passport">Passport N°</Label>
                                    <Input id="passport" placeholder="Passport number (if applicable)" value={formData.passport}
                                        onChange={(e) => updateField("passport", e.target.value)} className="h-10" />
                                </div>
                            </fieldset>

                            <Button type="submit" disabled={loading || dateConflict}
                                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 mt-2 disabled:opacity-50">
                                {loading ? "Submitting..." : dateConflict ? "Dates Unavailable" : "Submit Request"} <Calendar className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
