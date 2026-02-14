"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Upload, Save, Loader2, ImageIcon } from "lucide-react";

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
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "", excerpt: "", content: "", category: "", is_published: true
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [existingImage, setExistingImage] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    const fetchArticles = async () => {
        const res = await fetch(`${API}/articles/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setArticles(await res.json());
    };

    useEffect(() => { fetchArticles(); }, []);

    const resetForm = () => {
        setForm({ title: "", excerpt: "", content: "", category: "", is_published: true });
        setImageFile(null);
        setImagePreview("");
        setExistingImage("");
        setEditing(null);
        setShowForm(false);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setExistingImage("");
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview("");
        setExistingImage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const url = editing ? `${API}/articles/${editing.id}` : `${API}/articles`;
        const method = editing ? "PUT" : "POST";

        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("excerpt", form.excerpt);
        fd.append("content", form.content);
        fd.append("category", form.category);
        fd.append("is_published", String(form.is_published));

        if (imageFile) {
            fd.append("image", imageFile);
        }
        if (editing && !imageFile && !existingImage) {
            fd.append("remove_image", "true");
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            if (res.ok) {
                fetchArticles();
                resetForm();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (article: Article) => {
        setForm({
            title: article.title,
            excerpt: article.excerpt || "",
            content: article.content || "",
            category: article.category || "",
            is_published: article.is_published,
        });
        setExistingImage(article.image_url || "");
        setImageFile(null);
        setImagePreview("");
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
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Articles</h1>
                    <p className="text-muted-foreground mt-1">Manage blog articles and guides</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-neutral-800 hover:scale-105 active:scale-95"
                >
                    <Plus className="h-4 w-4" /> New Article
                </button>
            </div>

            {/* Form Modal - CarForm Style */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">{editing ? "Edit Article" : "New Article"}</h2>
                                <p className="text-sm text-muted-foreground">{editing ? "Update article details and content." : "Create a new article for your blog."}</p>
                            </div>
                            <button onClick={resetForm} className="rounded-full p-2 hover:bg-neutral-100 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Left column - main fields */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="rounded-xl border bg-white shadow-sm">
                                        <div className="border-b px-4 py-3">
                                            <h3 className="font-semibold text-sm">Article Details</h3>
                                            <p className="text-xs text-muted-foreground">Basic information about the article.</p>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium">Title *</label>
                                                <input
                                                    required
                                                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    value={form.title}
                                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                                    placeholder="e.g. Top 5 Road Trips in Morocco"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium">Category</label>
                                                    <select
                                                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                        value={form.category}
                                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                                    >
                                                        <option value="">Select category</option>
                                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium">Status</label>
                                                    <div className="flex h-10 items-center justify-between rounded-lg border px-3 py-2">
                                                        <span className="text-sm text-muted-foreground">Published</span>
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={form.is_published}
                                                            onClick={() => setForm({ ...form, is_published: !form.is_published })}
                                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.is_published ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                                                        >
                                                            <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${form.is_published ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium">Excerpt</label>
                                                <textarea
                                                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                    rows={2}
                                                    value={form.excerpt}
                                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                                    placeholder="Short summary shown on cards..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border bg-white shadow-sm">
                                        <div className="border-b px-4 py-3">
                                            <h3 className="font-semibold text-sm">Content</h3>
                                            <p className="text-xs text-muted-foreground">The full article body.</p>
                                        </div>
                                        <div className="p-4">
                                            <textarea
                                                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                                                rows={10}
                                                value={form.content}
                                                onChange={e => setForm({ ...form, content: e.target.value })}
                                                placeholder="Write the full article content here..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right column - image */}
                                <div className="space-y-6">
                                    <div className="rounded-xl border bg-white shadow-sm">
                                        <div className="border-b px-4 py-3">
                                            <h3 className="font-semibold text-sm">Cover Image</h3>
                                            <p className="text-xs text-muted-foreground">Upload a cover image for this article.</p>
                                        </div>
                                        <div className="p-4">
                                            {(imagePreview || existingImage) ? (
                                                <div className="relative rounded-lg overflow-hidden border group">
                                                    <img
                                                        src={imagePreview || existingImage}
                                                        alt="Preview"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors bg-neutral-50 hover:bg-neutral-100"
                                                >
                                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                    <span className="text-sm font-medium text-gray-600">Click to upload</span>
                                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 16MB</span>
                                                </button>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageSelect}
                                            />
                                            {(imagePreview || existingImage) && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    Change image
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                                <button type="button" onClick={resetForm} className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors">
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-neutral-800 disabled:opacity-50 min-w-[120px] justify-center"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {editing ? "Update" : "Create"}
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
                            <th className="text-left px-4 py-3 font-medium w-12">Image</th>
                            <th className="text-left px-4 py-3 font-medium">Title</th>
                            <th className="text-left px-4 py-3 font-medium">Category</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                            <th className="text-left px-4 py-3 font-medium">Date</th>
                            <th className="text-right px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {articles.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No articles yet</td></tr>
                        )}
                        {articles.map(article => (
                            <tr key={article.id} className="hover:bg-neutral-50">
                                <td className="px-4 py-3">
                                    {article.image_url ? (
                                        <img src={article.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                            <ImageIcon className="h-4 w-4 text-neutral-400" />
                                        </div>
                                    )}
                                </td>
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
