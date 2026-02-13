"use client";

import * as LucideIcons from "lucide-react";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ServiceItem {
    id: number;
    title: string;
    description: string;
    icon: string;
}

// Fallback services shown when the API has none
const FALLBACK_SERVICES: ServiceItem[] = [
    { id: -1, title: "24/7 Support", description: "Our team is available round the clock to assist you with your booking or on-road needs.", icon: "Clock" },
    { id: -2, title: "Premium Fleet", description: "Every vehicle is rigorously inspected and maintained to showroom standards for your safety.", icon: "Shield" },
    { id: -3, title: "Concierge Service", description: "Need a driver? Airport transfer? We offer tailored solutions to make your trip effortless.", icon: "HeartHandshake" },
];

function DynamicIcon({ name }: { name: string }) {
    const Icon = (LucideIcons as any)[name];
    if (!Icon) return <LucideIcons.Shield className="h-8 w-8 text-primary" />;
    return <Icon className="h-8 w-8 text-primary" />;
}

export function Services() {
    const [services, setServices] = useState<ServiceItem[]>([]);

    useEffect(() => {
        fetch(`${API}/services`)
            .then(r => r.ok ? r.json() : [])
            .then((data: ServiceItem[]) => {
                setServices(data.length > 0 ? data : FALLBACK_SERVICES);
            })
            .catch(() => setServices(FALLBACK_SERVICES));
    }, []);

    return (
        <section className="py-24 bg-white" id="services">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h2>
                    <p className="mt-4 text-muted-foreground">More than just a rental. A complete mobility experience.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {services.map((service) => (
                        <div key={service.id} className="flex flex-col items-center text-center p-6 rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-lg transition-all">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                                <DynamicIcon name={service.icon} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                            <p className="text-muted-foreground">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
