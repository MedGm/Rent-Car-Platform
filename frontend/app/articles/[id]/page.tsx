import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Calendar } from "lucide-react";

async function getArticle(id: string) {
    try {
        // Use internal backend URL for server-side fetching in Docker
        // Falls back to NEXT_PUBLIC_API_URL for Vercel / non-Docker deployments
        const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://backend:5000/api";
        const res = await fetch(`${apiUrl}/articles/${id}`, { cache: "no-store" });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const article = await getArticle(id);

    if (!article) notFound();

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            {/* Hero image (responsive height) */}
            <div className="relative w-full h-[250px] sm:h-[400px] bg-gray-900">
                <img
                    src={article.image_url || "/placeholder-article.png"}
                    alt={article.title}
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="container mx-auto px-4 py-6 sm:py-8">
                {/* Back link */}
                <Link
                    href="/#articles"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6"
                >
                    <ArrowLeft className="me-2 h-4 w-4" /> Back to Articles
                </Link>

                <article className="max-w-3xl mx-auto">
                    {/* Category + Date */}
                    <div className="flex items-center gap-4 mb-4">
                        {article.category && (
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide bg-red-50 px-3 py-1 rounded-full">
                                {article.category}
                            </span>
                        )}
                        {article.created_at && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {article.created_at}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                        {article.title}
                    </h1>

                    {/* Excerpt */}
                    {article.excerpt && (
                        <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-4 border-red-500 pl-4 italic">
                            {article.excerpt}
                        </p>
                    )}

                    {/* Content */}
                    <div className="prose prose-sm sm:prose-lg max-w-none prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed">
                        {article.content?.split("\n").map((paragraph: string, i: number) =>
                            paragraph.trim() ? (
                                <p key={i} className="mb-4 text-muted-foreground leading-relaxed text-base sm:text-lg">
                                    {paragraph}
                                </p>
                            ) : (
                                <br key={i} />
                            )
                        )}
                    </div>
                </article>
            </div>

            <Footer />
        </main>
    );
}
