"use client";

import { CarForm } from "@/components/admin/CarForm";

export default function AddCarPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Add New Car</h1>
            <CarForm />
        </div>
    );
}
