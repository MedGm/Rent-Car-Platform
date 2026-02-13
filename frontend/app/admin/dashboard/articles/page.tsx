"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Article {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    image_url: string;
    is_published: boolean;
    created_at: string;
}

export default function ArticlesAdmin() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Article | null>(null);
    const [form, setForm] = useState({
        title: "", excerpt: "", content: "", category: "", image_url: "", is_published: true
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    const fetchArticles = async () => {
        const res = await fetch(`${API}/articles/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setArticles(await res.json());
    };

    useEffect(() => { fetchArticles(); }, []);

    const resetForm = () => {
        setForm({ title: "", excerpt: "", content: "", category: "", image_url: "", is_published: true });
        setEditing(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editing ? `${API}/articles/${editing.id}` : `${API}/articles`;
        const method = editing ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            fetchArticles();
            resetForm();
        }
    };

    const handleEdit = (article: Article) => {
        setForm({
            title: article.title,
            excerpt: article.excerpt || "",
            content: article.content || "",
            category: article.category || "",
            image_url: article.image_url || "",
            is_published: article.is_published,
        });
        setEditing(article);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this article?")) return;
        await fetch(`${API}/articles/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchArticles();
    };

    const togglePublish = async (article: Article) => {
        await fetch(`${API}/articles/${article.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ is_published: !article.is_published }),
        });
        fetchArticles();
    };

    const categories = ["Travel Guide", "Tips & Tricks", "Education", "News", "Promotions"];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Articles</h1>
                    <p className="text-muted-foreground">Manage blog articles and guides</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" /> New Article
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-6">{editing ? "Edit Article" : "New Article"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <input
                                    required
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                >
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Excerpt</label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    rows={2}
                                    value={form.excerpt}
                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                    placeholder="Short summary..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Content</label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    rows={8}
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    placeholder="Full article content..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    value={form.image_url}
                                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="published"
                                    checked={form.is_published}
                                    onChange={e => setForm({ ...form, is_published: e.target.checked })}
                                />
                                <label htmlFor="published" className="text-sm">Published</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
                                    {editing ? "Update" : "Create"}
                                </button>
                                <button type="button" onClick={resetForm} className="border px-4 py-2 rounded-lg text-sm">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Articles Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium">Title</th>
                            <th className="text-left px-4 py-3 font-medium">Category</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                            <th className="text-left px-4 py-3 font-medium">Date</th>
                            <th className="text-right px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {articles.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No articles yet</td></tr>
                        )}
                        {articles.map(article => (
                            <tr key={article.id} className="hover:bg-neutral-50">
                                <td className="px-4 py-3 font-medium max-w-xs truncate">{article.title}</td>
                                <td className="px-4 py-3 text-muted-foreground">{article.category || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${article.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {article.is_published ? "Published" : "Draft"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{article.created_at}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1 justify-end">
                                        <button onClick={() => togglePublish(article)} className="p-1.5 rounded hover:bg-neutral-100" title={article.is_published ? "Unpublish" : "Publish"}>
                                            {article.is_published ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-green-600" />}
                                        </button>
                                        <button onClick={() => handleEdit(article)} className="p-1.5 rounded hover:bg-neutral-100">
                                            <Pencil className="h-4 w-4 text-blue-600" />
                                        </button>
                                        <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded hover:bg-red-50">
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
