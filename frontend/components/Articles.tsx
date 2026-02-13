import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Articles() {
    const articles = [
        {
            title: "Top 5 Road Trips to Take in 2026",
            excerpt: "Discover the most scenic routes and hidden gems for your next adventure.",
            date: "Feb 10, 2026",
            category: "Travel Guide"
        },
        {
            title: "Why Renting a Luxury Car is Worth It",
            excerpt: "Upgrade your travel experience with comfort, style, and performance.",
            date: "Jan 28, 2026",
            category: "Tips & Tricks"
        },
        {
            title: "Understanding Car Rental Insurance",
            excerpt: "A comprehensive guide to staying protected on the road.",
            date: "Jan 15, 2026",
            category: "Education"
        }
    ];

    return (
        <section className="py-24 bg-gray-50">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Latest Articles</h2>
                        <p className="mt-2 text-muted-foreground">Travel tips, guides, and industry insights.</p>
                    </div>
                    <Link href="#" className="hidden md:flex items-center text-primary font-bold hover:underline">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article, index) => (
                        <article key={index} className="group relative bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-48 bg-gray-200 w-full animate-pulse" /> {/* Placeholder for article image */}
                            <div className="p-6">
                                <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">{article.category}</div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                                <div className="text-xs text-gray-400">{article.date}</div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
