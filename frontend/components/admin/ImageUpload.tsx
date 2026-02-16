"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    existingImages: string[];
    onImagesChange: (files: File[], existing: string[]) => void;
}

export function ImageUpload({ existingImages, onImagesChange }: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [keptExisting, setKeptExisting] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Initialize with props, but only once because this component structure 
    // relies on managing state locally then notifying upwards
    useEffect(() => {
        setKeptExisting(existingImages.filter(Boolean));
    }, [existingImages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
        }
    };

    const processFiles = (files: File[]) => {
        // Filter out non-image files if needed
        const validFiles = files.filter(file => file.type.startsWith('image/'));

        const newPreviews = validFiles.map(file => URL.createObjectURL(file));

        const updatedFiles = [...selectedFiles, ...validFiles];
        // Note: we're using function update form to ensure we don't have stale state, 
        // but for the parent callback we need the specific new lists.

        setSelectedFiles(updatedFiles);
        setPreviews(prev => [...prev, ...newPreviews]);

        onImagesChange(updatedFiles, keptExisting);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
        onImagesChange(newFiles, keptExisting);
    };

    const removeExisting = (index: number) => {
        const newExisting = keptExisting.filter((_, i) => i !== index);
        setKeptExisting(newExisting);
        onImagesChange(selectedFiles, newExisting);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        SVG, PNG, JPG or WEBP (max. 5MB)
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                />
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*"
            />

            {(keptExisting.length > 0 || previews.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                    {keptExisting.map((url, i) => (
                        <div key={`existing-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                            <img src={url} alt="Existing" className="h-full w-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeExisting(i)}
                                className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold hover:bg-red-600 shadow-md"
                            >
                                ×
                            </button>
                            <span className="absolute bottom-2 left-2 z-10 rounded bg-black/50 px-2 py-1 text-[10px] text-white">
                                Existing
                            </span>
                        </div>
                    ))}

                    {previews.map((url, i) => (
                        <div key={`new-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
                            <img src={url} alt="Preview" className="h-full w-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold hover:bg-red-600 shadow-md"
                            >
                                ×
                            </button>
                            <span className="absolute bottom-2 left-2 z-10 rounded bg-green-500/80 px-2 py-1 text-[10px] text-white">
                                New
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
