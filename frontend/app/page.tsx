import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Calendar, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container relative z-10 flex flex-col items-center text-center">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6">
            Premium Experience, Zero Friction
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Drive the <span className="text-primary">Extraordinary</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Experience the thrill of the open road with our premium fleet.
            Availability-first booking, no hidden fees, instant WhatsApp confirmation.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/cars"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 shadow-lg shadow-primary/25"
            >
              Browse Fleet <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-lg border bg-background px-8 text-base font-medium transition-colors hover:bg-muted"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/30">
        <div className="container grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <Zap className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Instant Availability</h3>
            <p className="text-muted-foreground">Real-time calendar checking. No double bookings, ever. What you see is what you get.</p>
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Verified Quality</h3>
            <p className="text-muted-foreground">Every car is inspected before and after every trip. Premium condition guaranteed.</p>
          </div>
          <div className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
            <Calendar className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Human Validation</h3>
            <p className="text-muted-foreground">Direct WhatsApp confirmation with our team. We ensure your trip is perfectly planned.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
