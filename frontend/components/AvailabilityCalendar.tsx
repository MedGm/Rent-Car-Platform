"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AvailabilityCalendar({ carId }: { carId: number }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Mock availability data (Red = Booked)
    // In a real app, fetch this from /api/cars/{id}/availability
    const bookedDates = [
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 5).toDateString(),
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 6).toDateString(),
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 15).toDateString(),
    ];

    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">Availability</h3>
                <div className="flex gap-2">
                    <button className="rounded-full p-1 hover:bg-muted">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium">
                        {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                    </span>
                    <button className="rounded-full p-1 hover:bg-muted">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {blanks.map((_, i) => (
                    <div key={`blank-${i}`} />
                ))}
                {days.map((day) => {
                    const dateStr = new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day
                    ).toDateString();
                    const isBooked = bookedDates.includes(dateStr);

                    return (
                        <div
                            key={day}
                            className={cn(
                                "aspect-square flex items-center justify-center rounded-md text-sm cursor-default",
                                isBooked
                                    ? "bg-destructive/10 text-destructive font-bold line-through decoration-destructive"
                                    : "bg-secondary text-foreground hover:bg-primary/20"
                            )}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-secondary"></div> Available
                </div>
                <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-destructive/10 border border-destructive/20"></div> Booked
                </div>
            </div>
        </div>
    );
}
