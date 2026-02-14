"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Article {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    image_url: string;
    created_at: string;
}

export function Articles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        fetch(`${API}/articles`)
            .then(r => r.ok ? r.json() : [])
            .then(setArticles)
            .catch(() => {});
    }, []);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) el.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
        return () => {
            if (el) el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [articles]);

    const scroll = (dir: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.querySelector("article")?.offsetWidth || 380;
        el.scrollBy({ left: dir === "left" ? -cardWidth - 16 : cardWidth + 16, behavior: "smooth" });
    };

    if (articles.length === 0) return null;

    return (
        <section className="py-24 bg-gray-50" id="articles">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest Articles</h2>
                        <p className="mt-2 text-muted-foreground">Travel tips, guides, and industry insights.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            className="h-10 w-10 rounded-full border bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            className="h-10 w-10 rounded-full border bg-white flex items-center justify-center text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scroll-smooth pb-4 -mb-4 scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {articles.slice(0, 10).map((article) => (
                        <article
                            key={article.id}
                            className="group relative flex-shrink-0 w-[340px] sm:w-[380px] bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
                        >
                            {article.image_url ? (
                                <div className="h-48 w-full overflow-hidden">
                                    <img
                                        src={article.image_url}
                                        alt={article.title}
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 bg-gradient-to-br from-red-100 to-red-50 w-full flex items-center justify-center">
                                    <span className="text-4xl font-bold text-red-200">{article.title[0]}</span>
                                </div>
                            )}
                            <div className="p-6">
                                {article.category && (
                                    <div className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wide">{article.category}</div>
                                )}
                                <h3 className="text-xl font-bold mb-2 group-hover:text-red-600 transition-colors">{article.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-400">{article.created_at}</div>
                                    <Link
                                        href={`/articles/${article.id}`}
                                        className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        View <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
