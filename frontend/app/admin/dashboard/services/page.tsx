"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
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

function IconPreview({ name }: { name: string }) {
    const Icon = (LucideIcons as any)[name];
    if (!Icon) return <span className="text-xs text-gray-400">?</span>;
    return <Icon className="h-5 w-5" />;
}

export default function ServicesAdmin() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<ServiceItem | null>(null);
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
        const url = editing ? `${API}/services/${editing.id}` : `${API}/services`;
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
            fetchServices();
            resetForm();
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
                    <h1 className="text-2xl font-bold">Services</h1>
                    <p className="text-muted-foreground">Manage the services displayed on the homepage</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" /> New Service
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-6">{editing ? "Edit Service" : "New Service"}</h2>
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
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Icon</label>
                                <div className="grid grid-cols-6 gap-2 mt-1">
                                    {ICON_OPTIONS.map(iconName => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setForm({ ...form, icon: iconName })}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${
                                                form.icon === iconName
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <IconPreview name={iconName} />
                                            <span className="truncate w-full text-center" style={{ fontSize: "9px" }}>{iconName}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Sort Order</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                        value={form.sort_order}
                                        onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex items-end gap-2 pb-1">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={form.is_active}
                                        onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                    />
                                    <label htmlFor="active" className="text-sm">Active</label>
                                </div>
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
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
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
