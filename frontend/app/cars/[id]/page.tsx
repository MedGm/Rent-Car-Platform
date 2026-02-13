import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import ClientBookingWrapper from "@/components/ClientBookingWrapper";
import { ArrowLeft, Check, MessageCircle, Shield } from "lucide-react";

async function getCar(id: string) {
    try {
        // Use internal backend URL for server-side fetching
        const apiUrl = 'http://backend:5000/api';
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
            <Navbar />

            <div className="relative h-[50vh] w-full bg-muted">
                {car.images[0] && (
                    <Image
                        src={car.images[0]}
                        alt={car.name}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 md:p-12 container mx-auto">
                    <Link href="/cars" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Fleet
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{car.name}</h1>
                        <div className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                            {car.category}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-8 grid gap-12 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Specs */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Vehicle Specifications</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {Object.entries(car.specs).map(([key, value]) => (
                                <div key={key} className="rounded-xl border bg-card p-4">
                                    <div className="text-xs font-medium uppercase text-muted-foreground">{key}</div>
                                    <div className="mt-1 text-lg font-bold capitalize">{String(value)}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Description / Features */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {["Bluetooth Audio", "Navigation System", "Leather Seats", "Parking Sensors", "Cruise Control", "Apple CarPlay"].map((feat) => (
                                <li key={feat} className="flex items-center gap-2">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                                        <Check className="h-3 w-3 text-primary" />
                                    </div>
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="rounded-2xl border bg-white p-6 shadow-lg">
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
                            href={`https://wa.me/1234567890?text=${whatsappMessage}`}
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

                        <ClientBookingWrapper carId={car.id} carName={car.name} />

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
