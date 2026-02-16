"use client";

import { useState } from "react";
import { BookingForm } from "./BookingForm";
import { Calendar } from "lucide-react";

export default function ClientBookingWrapper({ carId, carName, pricePerDay }: { carId: number, carName: string, pricePerDay: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-neutral-800"
            >
                <Calendar className="h-5 w-5" /> Request Booking
            </button>

            <BookingForm
                carId={carId}
                carName={carName}
                pricePerDay={pricePerDay}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
