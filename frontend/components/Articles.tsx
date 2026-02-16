"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface ArticleData {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    image_url: string;
    is_published: boolean;
    created_at: string;
}

export function Articles() {
    const [articles, setArticles] = useState<ArticleData[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        async function fetchArticles() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/articles`
                );
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setArticles(data.slice(0, 6));
            } catch (error) {
                console.error("Error fetching articles:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchArticles();
    }, []);

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
    }, [articles]);

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.querySelector<HTMLElement>(":scope > a")?.offsetWidth || 380;
        el.scrollBy({ left: direction === "left" ? -cardWidth - 24 : cardWidth + 24, behavior: "smooth" });
    };

    return (
        <section id="articles" className="py-20 sm:py-28 bg-background">
            <div className="container mx-auto px-6 sm:px-4">
                {/* Section Header */}
                <div className="mb-12 flex flex-col items-center text-center md:flex-row md:items-end md:justify-between md:text-left gap-8">
                    <div className="max-w-2xl">
                        <span className="inline-block rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                            Blog & Conseils
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground leading-tight">
                            Latest <span className="text-primary">Articles</span>
                        </h2>
                        <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto md:mx-0">
                            Travel tips, road trip guides, and everything you need to know about driving in Morocco.
                        </p>
                    </div>

                    {/* Carousel Controls */}
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-all hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-all hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                {loading ? (
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-[380px] min-w-[340px] animate-pulse rounded-2xl bg-muted"
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth pb-8 -mb-4 snap-x snap-mandatory scrollbar-hide no-scrollbar"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={`/articles/${article.id}`}
                                className="group flex flex-col min-w-[calc(100vw-4.5rem)] xs:min-w-[320px] sm:min-w-[360px] max-w-[400px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-red-900/20 hover:-translate-y-1"
                            >
                                {/* Image */}
                                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                                    {article.image_url ? (
                                        <Image
                                            src={article.image_url}
                                            alt={article.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                    <span className="absolute top-3 left-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                        {article.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col p-5">
                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(article.created_at).toLocaleDateString("fr-FR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </div>

                                    <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {article.excerpt}
                                    </p>

                                    <div className="mt-auto pt-4">
                                        <span className="inline-flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                                            Read More <ArrowRight className="ml-1 h-4 w-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
