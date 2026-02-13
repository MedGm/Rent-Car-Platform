"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {keptExisting.map((url, i) => (
                        <div key={`existing-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                            <Image src={url} alt="Existing" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeExisting(i)}
                                className="absolute right-2 top-2 h-8 w-8 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-[10px] text-white">
                                Existing
                            </span>
                        </div>
                    ))}

                    {previews.map((url, i) => (
                        <div key={`new-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                            <Image src={url} alt="Preview" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeFile(i)}
                                className="absolute right-2 top-2 h-8 w-8 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <span className="absolute bottom-2 left-2 rounded bg-green-500/80 px-2 py-1 text-[10px] text-white">
                                New
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
