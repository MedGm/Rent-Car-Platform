"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function Hero() {
    const { t } = useLanguage();
    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">
            {/* Background GIF */}
            <div className="absolute inset-0 opacity-60">
                <Image
                    src="/car.gif"
                    alt="Luxury Car Background"
                    fill
                    unoptimized
                    className="object-cover"
                    priority
                />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Content */}
            <div className="container mx-auto relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-7xl md:text-8xl drop-shadow-lg uppercase leading-[1.1]">
                    <span className="text-primary">MISTERS</span> DRIVERS
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-gray-200 md:text-2xl drop-shadow-md px-2">
                    {t.hero_subtitle}
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6 sm:px-0">
                    <Link
                        href="/cars"
                        className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-white transition-transform hover:scale-105 hover:bg-red-600 shadow-lg shadow-red-600/20 w-full sm:w-auto"
                    >
                        {t.hero_browse} <ArrowRight className="ms-2 h-5 w-5" />
                    </Link>
                    <Link
                        href="#contact"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 text-base font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 w-full sm:w-auto"
                    >
                        {t.hero_contact}
                    </Link>
                </div>
            </div>
        </section>
    );
}
