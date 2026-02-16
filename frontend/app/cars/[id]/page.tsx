import { notFound } from "next/navigation";
import Link from "next/link";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import ClientBookingWrapper from "@/components/ClientBookingWrapper";
import { ImageCarousel } from "@/components/ImageCarousel";
import {
    ArrowLeft,
    MessageCircle,
    Shield,
    Bluetooth,
    Navigation,
    Armchair,
    Radar,
    Gauge,
    Smartphone,
    Users,
    Fuel,
    Cog,
} from "lucide-react";

const SPEC_ICONS: Record<string, any> = {
    seats: Users,
    fuel: Fuel,
    transmission: Cog,
};

const FEATURES = [
    { name: "Bluetooth Audio", icon: Bluetooth, color: "text-foreground", bg: "bg-secondary/20" },
    { name: "Navigation System", icon: Navigation, color: "text-foreground", bg: "bg-secondary/20" },
    { name: "Leather Seats", icon: Armchair, color: "text-foreground", bg: "bg-secondary/20" },
    { name: "Parking Sensors", icon: Radar, color: "text-foreground", bg: "bg-secondary/20" },
    { name: "Cruise Control", icon: Gauge, color: "text-foreground", bg: "bg-secondary/20" },
    { name: "Apple CarPlay", icon: Smartphone, color: "text-foreground", bg: "bg-secondary/20" },
];

async function getCar(id: string) {
    try {
        // Use internal backend URL for server-side fetching in Docker
        // Falls back to NEXT_PUBLIC_API_URL for Vercel / non-Docker deployments
        const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:5000/api';
        const url = `${apiUrl}/cars/${id}`;
        console.log(`[getCar] Fetching: ${url}`);

        const res = await fetch(url, {
            cache: 'no-store'
        });

        console.log(`[getCar] Response status: ${res.status}`);

        if (!res.ok) {
            console.error(`[getCar] Failed to fetch car ${id}: ${res.status} ${res.statusText}`);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error(`[getCar] Error fetching car ${id}:`, error);
        return null;
    }
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Add debug log
    console.log(`[CarDetailsPage] Rendering car details for ID: ${id}`);

    const car = await getCar(id);

    if (!car) {
        console.error(`[CarDetailsPage] Car not found for ID: ${id}`);
        notFound();
    }

    const whatsappMessage = encodeURIComponent(
        `Hi, I'm interested in renting the ${car.name}. Is it available?`
    );

    return (
        <main className="min-h-screen bg-background pb-20">

            {/* Top bar with back link */}
            <div className="container mx-auto px-4 pt-6">
                <Link href="/cars" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="me-2 h-4 w-4" /> Back to Fleet
                </Link>
            </div>

            <div className="container mx-auto px-4 mt-6 grid gap-10 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Car title + category */}
                    <div className="flex items-center gap-4">
                        {car.brand_logo && (
                            <img src={car.brand_logo} alt="brand" className="h-10 w-10 object-contain" />
                        )}
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{car.name}</h1>
                        <div className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                            {car.category}
                        </div>
                    </div>

                    {/* Image Carousel (responsive aspect ratio) */}
                    <div className="aspect-[16/10] sm:aspect-video w-full">
                        <ImageCarousel images={car.images} alt={car.name} />
                    </div>

                    {/* Specs */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Vehicle Specifications</h2>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
                            {Object.entries(car.specs).map(([key, value]) => {
                                const SpecIcon = SPEC_ICONS[key.toLowerCase()];
                                return (
                                    <div key={key} className="rounded-xl border bg-card p-3 sm:p-4">
                                        <div className="flex items-center gap-2">
                                            {SpecIcon && <SpecIcon className="h-4 w-4 text-red-500" />}
                                            <div className="text-xs font-medium uppercase text-muted-foreground">{key}</div>
                                        </div>
                                        <div className="mt-1 text-lg font-bold capitalize">{String(value)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Key Features with unique icons */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {FEATURES.map((feat) => {
                                const Icon = feat.icon;
                                return (
                                    <div key={feat.name} className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30">
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${feat.bg}`}>
                                            <Icon className={`h-5 w-5 ${feat.color}`} />
                                        </div>
                                        <span className="font-medium">{feat.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="rounded-2xl border bg-card p-6 shadow-lg">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <MessageCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Direct Booking</div>
                                <div className="font-bold">Contact via WhatsApp</div>
                            </div>
                        </div>

                        <a
                            href={`https://wa.me/212671920545?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-[#20bd5a]"
                        >
                            <MessageCircle className="h-5 w-5" /> Chat to Book
                        </a>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">Or</span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        <ClientBookingWrapper
                            carId={car.id}
                            carName={car.name}
                            pricePerDay={car.price_per_day}
                        />

                        <p className="mt-4 text-center text-xs text-muted-foreground">
                            Instant response time. No hidden fees.
                        </p>
                    </div>

                    <AvailabilityCalendar carId={car.id} />

                    <div className="rounded-xl bg-secondary/50 p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                                <span className="font-bold text-foreground">Verified Listing.</span> This car is managed directly by our agency.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
