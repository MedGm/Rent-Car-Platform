"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

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

    useEffect(() => {
        fetch(`${API}/articles`)
            .then(r => r.ok ? r.json() : [])
            .then(setArticles)
            .catch(() => {});
    }, []);

    if (articles.length === 0) return null;

    return (
        <section className="py-24 bg-gray-50" id="articles">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest Articles</h2>
                        <p className="mt-2 text-muted-foreground">Travel tips, guides, and industry insights.</p>
                    </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.slice(0, 6).map((article) => (
                        <article key={article.id} className="group relative bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                            {article.image_url ? (
                                <div className="h-48 w-full overflow-hidden">
                                    <img
                                        src={article.image_url}
                                        alt={article.title}
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 w-full flex items-center justify-center">
                                    <span className="text-4xl font-bold text-primary/20">{article.title[0]}</span>
                                </div>
                            )}
                            <div className="p-6">
                                {article.category && (
                                    <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">{article.category}</div>
                                )}
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                                <div className="text-xs text-gray-400">{article.created_at}</div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
