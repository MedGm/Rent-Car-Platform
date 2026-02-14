"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ICON_OPTIONS = [
    "Shield", "Clock", "HeartHandshake", "Car", "Plane", "MapPin",
    "Phone", "Star", "Award", "Sparkles", "Users", "Wrench",
    "Fuel", "Key", "Navigation", "BadgeCheck", "Headphones", "Globe",
];

interface ServiceItem {
    id: number;
    title: string;
    description: string;
    icon: string;
    is_active: boolean;
    sort_order: number;
}

function IconPreview({ name, className }: { name: string; className?: string }) {
    const Icon = (LucideIcons as any)[name];
    if (!Icon) return <span className="text-xs text-gray-400">?</span>;
    return <Icon className={className || "h-5 w-5"} />;
}

export default function ServicesAdmin() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<ServiceItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: "", description: "", icon: "Shield", is_active: true, sort_order: 0
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    const fetchServices = async () => {
        const res = await fetch(`${API}/services/all`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setServices(await res.json());
    };

    useEffect(() => { fetchServices(); }, []);

    const resetForm = () => {
        setForm({ title: "", description: "", icon: "Shield", is_active: true, sort_order: 0 });
        setEditing(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const url = editing ? `${API}/services/${editing.id}` : `${API}/services`;
        const method = editing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                fetchServices();
                resetForm();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: ServiceItem) => {
        setForm({
            title: service.title,
            description: service.description || "",
            icon: service.icon || "Shield",
            is_active: service.is_active,
            sort_order: service.sort_order,
        });
        setEditing(service);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this service?")) return;
        await fetch(`${API}/services/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchServices();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Services</h1>
                    <p className="text-muted-foreground mt-1">Manage the services displayed on the homepage</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-neutral-800 hover:scale-105 active:scale-95"
                >
                    <Plus className="h-4 w-4" /> New Service
                </button>
            </div>

            {/* Form Modal - CarForm Style */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">{editing ? "Edit Service" : "New Service"}</h2>
                                <p className="text-sm text-muted-foreground">{editing ? "Update service details." : "Add a new service to your homepage."}</p>
                            </div>
                            <button onClick={resetForm} className="rounded-full p-2 hover:bg-neutral-100 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Service Details Card */}
                            <div className="rounded-xl border bg-white shadow-sm">
                                <div className="border-b px-4 py-3">
                                    <h3 className="font-semibold text-sm">Service Details</h3>
                                    <p className="text-xs text-muted-foreground">Basic information about the service.</p>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Title *</label>
                                        <input
                                            required
                                            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. Airport Transfer"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Description</label>
                                        <textarea
                                            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            rows={3}
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            placeholder="Describe the service..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Sort Order</label>
                                            <input
                                                type="number"
                                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                value={form.sort_order}
                                                onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Status</label>
                                            <div className="flex h-10 items-center justify-between rounded-lg border px-3 py-2">
                                                <span className="text-sm text-muted-foreground">Active</span>
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={form.is_active}
                                                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.is_active ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                                                >
                                                    <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Icon Picker Card */}
                            <div className="rounded-xl border bg-white shadow-sm">
                                <div className="border-b px-4 py-3">
                                    <h3 className="font-semibold text-sm">Icon</h3>
                                    <p className="text-xs text-muted-foreground">Choose an icon to represent this service.</p>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-6 gap-2">
                                        {ICON_OPTIONS.map(iconName => (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setForm({ ...form, icon: iconName })}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                                                    form.icon === iconName
                                                        ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-neutral-50"
                                                }`}
                                            >
                                                <IconPreview name={iconName} className={`h-5 w-5 ${form.icon === iconName ? "text-white" : ""}`} />
                                                <span className="truncate w-full text-center leading-none" style={{ fontSize: "9px" }}>{iconName}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div className="flex gap-3 justify-end pt-2 border-t">
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

            {/* Services List */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium w-10">#</th>
                            <th className="text-left px-4 py-3 font-medium w-12">Icon</th>
                            <th className="text-left px-4 py-3 font-medium">Title</th>
                            <th className="text-left px-4 py-3 font-medium">Description</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                            <th className="text-right px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {services.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No services yet</td></tr>
                        )}
                        {services.map(service => (
                            <tr key={service.id} className="hover:bg-neutral-50">
                                <td className="px-4 py-3 text-muted-foreground">{service.sort_order}</td>
                                <td className="px-4 py-3">
                                    <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
                                        <IconPreview name={service.icon} />
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium">{service.title}</td>
                                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{service.description || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${service.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {service.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1 justify-end">
                                        <button onClick={() => handleEdit(service)} className="p-1.5 rounded hover:bg-neutral-100">
                                            <Pencil className="h-4 w-4 text-blue-600" />
                                        </button>
                                        <button onClick={() => handleDelete(service.id)} className="p-1.5 rounded hover:bg-red-50">
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
