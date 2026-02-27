"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface UnavailableRange {
    start: string;
    end: string;
    type: string;
}

export function AvailabilityCalendar({ carId }: { carId: number }) {
    const { t } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [unavailableRanges, setUnavailableRanges] = useState<UnavailableRange[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch availability (confirmed bookings + maintenance blocks) for this car
    useEffect(() => {
        let isMounted = true;
        async function fetchAvailability() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/availability/${carId}`);
                if (res.ok && isMounted) {
                    const data = await res.json();
                    setUnavailableRanges(data);
                }
            } catch (error) {
                console.error("Failed to fetch availability", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchAvailability();
        return () => { isMounted = false; };
    }, [carId]);

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

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isDateBooked = (day: number) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        checkDate.setHours(0, 0, 0, 0);
        return unavailableRanges.some((range) => {
            const start = new Date(range.start);
            const end = new Date(range.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return checkDate >= start && checkDate <= end;
        });
    };

    return (
        <div className="rounded-xl border bg-card p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="mb-6 flex flex-col gap-4 items-center">
                <h3 className="font-bold text-xl tracking-tight text-center w-full">{t.car_details_check_availability}</h3>
                <div className="flex w-full items-center justify-between bg-secondary/50 p-1.5 rounded-full">
                    <button onClick={prevMonth} className="rounded-full p-2 hover:bg-white hover:shadow-sm transition-all text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-bold flex-1 flex items-center justify-center">
                        {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                    </span>
                    <button onClick={nextMonth} className="rounded-full p-2 hover:bg-white hover:shadow-sm transition-all text-muted-foreground hover:text-foreground">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {blanks.map((_, i) => (
                    <div key={`blank-${i}`} />
                ))}
                {days.map((day) => {
                    const booked = isDateBooked(day);
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                    return (
                        <div
                            key={day}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 cursor-default relative overflow-hidden",
                                booked
                                    ? "bg-red-50 text-red-500 ring-1 ring-inset ring-red-100 opacity-90"
                                    : "bg-secondary/30 text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:scale-105"
                                , isToday && !booked && "bg-primary/5 text-primary ring-2 ring-primary ring-offset-2"
                            )}
                            title={booked ? t.car_details_booked : t.car_details_available}
                        >
                            {day}
                            {booked && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-red-400" />
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex justify-center gap-8 text-xs font-medium border-t pt-4">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-secondary/30 ring-1 ring-inset ring-foreground/10"></div>
                    <span className="text-muted-foreground">{t.car_details_available}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-50 ring-1 ring-inset ring-red-200"></div>
                    <span className="text-muted-foreground">{t.car_details_booked}</span>
                </div>
            </div>
        </div>
    );
}
