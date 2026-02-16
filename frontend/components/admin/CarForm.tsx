"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CarFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export function CarForm({ initialData, isEdit = false }: CarFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: "Sedan",
        specs: {
            seats: 5,
            fuel: "Petrol",
            transmission: "Automatic"
        },
        images: [""],
        is_active: true,
        price_per_day: 0
    });

    const [files, setFiles] = useState<File[]>([]);
    const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
    const [brandLogoPreview, setBrandLogoPreview] = useState<string>("");

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                category: initialData.category || "Sedan",
                specs: {
                    seats: initialData.specs?.seats || 5,
                    fuel: initialData.specs?.fuel || "Petrol",
                    transmission: initialData.specs?.transmission || "Automatic"
                },
                images: initialData.images || [],
                is_active: initialData.is_active ?? true,
                price_per_day: initialData.price_per_day || 0
            });
            if (initialData.brand_logo) {
                setBrandLogoPreview(initialData.brand_logo);
            }
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith("specs.")) {
            const specName = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                specs: { ...prev.specs, [specName]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImagesUpdate = (newFiles: File[], currentExisting: string[]) => {
        setFiles(newFiles);
        setFormData(prev => ({ ...prev, images: currentExisting }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem("admin_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const url = `${apiUrl}/cars${isEdit ? `/${initialData.id}` : ''}`;
        const method = isEdit ? 'PUT' : 'POST';

        const data = new FormData();
        data.append("name", formData.name);
        data.append("category", formData.category);
        data.append("specs", JSON.stringify(formData.specs));
        data.append("is_active", String(formData.is_active));
        data.append("price_per_day", String(formData.price_per_day));

        // Append existing images JSON
        data.append("existing_images", JSON.stringify(formData.images));

        // Append new files
        files.forEach(file => {
            data.append("images", file);
        });

        // Append brand logo
        if (brandLogoFile) {
            data.append("brand_logo", brandLogoFile);
        } else if (!brandLogoPreview && isEdit) {
            data.append("remove_brand_logo", "true");
        }

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type must NOT be set for FormData, browser sets it with boundary
                },
                body: data
            });

            if (!res.ok) throw new Error("Failed to save car");

            router.push("/admin/dashboard/fleet");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to save car. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEdit ? `Edit ${formData.name}` : "Add New Vehicle"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isEdit ? "Update vehicle details and specifications." : "Add a new vehicle to your premium fleet."}
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Discard
                    </Button>
                    <Button type="submit" disabled={loading} className="min-w-[120px]">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEdit ? "Update" : "Create"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Details</CardTitle>
                            <CardDescription>Basic information about the car.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Car Model Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. BMW X5 M Competition"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="Sedan">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Luxury">Luxury</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Van">Van</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price_per_day">Price per Day (DH)</Label>
                                    <Input
                                        id="price_per_day"
                                        name="price_per_day"
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 500"
                                        value={formData.price_per_day}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="isActive">Status</Label>
                                <div className="flex h-10 items-center justify-between rounded-lg border px-3 py-2">
                                    <span className="text-sm text-muted-foreground">Available for Rent</span>
                                    <Switch
                                        id="isActive"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Specifications</CardTitle>
                            <CardDescription>Technical details for the customer.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground">Seats</Label>
                                    <Input
                                        type="number"
                                        name="specs.seats"
                                        value={formData.specs.seats}
                                        onChange={handleChange}
                                        placeholder="5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground">Fuel Type</Label>
                                    <Input
                                        name="specs.fuel"
                                        value={formData.specs.fuel}
                                        onChange={handleChange}
                                        placeholder="Petrol"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground">Transmission</Label>
                                    <Input
                                        name="specs.transmission"
                                        value={formData.specs.transmission}
                                        onChange={handleChange}
                                        placeholder="Automatic"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Brand Logo</CardTitle>
                            <CardDescription>Upload the car manufacturer logo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {brandLogoPreview ? (
                                <div className="relative flex items-center justify-center rounded-xl border-2 border-dashed p-6 bg-gray-50">
                                    <img
                                        src={brandLogoPreview}
                                        alt="Brand logo"
                                        className="h-20 w-20 object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBrandLogoFile(null);
                                            setBrandLogoPreview("");
                                        }}
                                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Click to upload logo</p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, SVG, or JPG</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setBrandLogoFile(file);
                                                setBrandLogoPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Media Gallery</CardTitle>
                            <CardDescription>Upload high-quality images of the vehicle.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ImageUpload
                                existingImages={formData.images}
                                onImagesChange={handleImagesUpdate}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
