"use client";

import { useState, useRef, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function GoogleReviews() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const { t } = useLanguage();

    const MOCK_REVIEWS = [
        { id: 1, name: "Amine El Fassi", rating: 5, date: t.review_1_date, text: t.review_1_text },
        { id: 2, name: "Sarah Johnson", rating: 5, date: t.review_2_date, text: t.review_2_text },
        { id: 3, name: "Karim Bennani", rating: 5, date: t.review_3_date, text: t.review_3_text },
        { id: 4, name: "Thomas Dubois", rating: 5, date: t.review_4_date, text: t.review_4_text },
    ];

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll, { passive: true });
        window.addEventListener("resize", checkScroll);
        return () => {
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, []);

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth || 400;
        el.scrollBy({ left: direction === "left" ? -cardWidth - 24 : cardWidth + 24, behavior: "smooth" });
    };

    const GOOGLE_MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=Misters+Drivers+Agadir";

    return (
        <section id="reviews" className="py-20 sm:py-28 bg-background relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="container mx-auto px-6 sm:px-4">
                <div className="flex flex-col items-center text-center md:flex-row md:items-end md:justify-between md:text-start gap-8 mb-16">
                    <div className="max-w-2xl">
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-6" dir="ltr">
                            <span className="inline-block rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                                {t.reviews_badge}
                            </span>
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold ring-1 ring-green-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {t.reviews_verified_google}
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground leading-tight">
                            {t.reviews_title_1} <span className="text-primary">{t.reviews_title_2}</span>
                        </h2>
                        <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto md:ms-0">
                            {t.reviews_desc}
                        </p>
                    </div>

                    <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6 sm:gap-8">
                        <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-2xl ring-1 ring-border">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="font-bold text-lg">5.0</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scroll("left")}
                                disabled={!canScrollLeft}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-accent disabled:opacity-30"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => scroll("right")}
                                disabled={!canScrollRight}
                                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all hover:bg-accent disabled:opacity-30"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth pb-8 -mb-4 snap-x snap-mandatory scrollbar-hide no-scrollbar"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {MOCK_REVIEWS.map((review) => (
                        <div
                            key={review.id}
                            className="flex flex-col min-w-[calc(100vw-4.5rem)] xs:min-w-[320px] sm:min-w-[400px] max-w-[450px] flex-shrink-0 snap-start p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm relative group transition-all hover:shadow-xl hover:-translate-y-1"
                        >
                            <Quote className="absolute top-6 end-8 h-10 w-10 text-primary/5 group-hover:text-primary/10 transition-colors" />

                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase ring-2 ring-primary/20">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground">{review.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                            {review.date}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-muted-foreground leading-relaxed italic relative z-10 text-sm sm:text-base">
                                &ldquo;{review.text}&rdquo;
                            </p>

                            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-muted-foreground/50 uppercase tracking-widest border-t border-border pt-4">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.48 10.92v3.28h4.74c-.18 1.14-.84 2.1-1.8 2.76v2.3h2.88c1.68-1.56 2.64-3.84 2.64-6.54 0-.48-.06-.96-.12-1.44H12.48zM5.16 11.64c0-.78.12-1.56.36-2.28V7.08H2.64c-.84 1.56-1.32 3.36-1.32 5.28s.48 3.72 1.32 5.28l2.88-2.28c-.24-.72-.36-1.5-.36-2.28z" />
                                    <path d="M12.48 5.76c1.44 0 2.7.48 3.72 1.44l2.76-2.76c-1.74-1.62-4.02-2.64-6.48-2.64-3.84 0-7.2 2.22-8.76 5.46l2.88 2.28c.66-1.92 2.46-3.3 4.68-3.3zM12.48 21.12c2.46 0 4.5-.84 6-2.28l-2.88-2.28c-.84.6-1.98.96-3.12.96-2.22 0-4.02-1.38-4.68-3.3L4.92 16.5c1.56 3.24 4.92 5.46 8.76 5.46z" />
                                </svg>
                                {t.reviews_verified}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to action */}
                <div className="mt-12 text-center px-4">
                    <a
                        href={GOOGLE_MAPS_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-14 items-center justify-center rounded-full bg-foreground text-background px-8 text-sm font-bold transition-all hover:scale-105 hover:shadow-xl dark:bg-white dark:text-black w-full sm:w-auto"
                    >
                        {t.reviews_cta}
                    </a>
                </div>
            </div>
        </section>
    );
}
