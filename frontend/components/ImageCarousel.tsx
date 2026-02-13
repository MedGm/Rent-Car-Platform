"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
    images: string[];
    alt: string;
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
    const [current, setCurrent] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square w-full rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                No images available
            </div>
        );
    }

    function prev() {
        setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    }

    function next() {
        setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    }

    return (
        <div className="space-y-3 max-w-md">
            {/* Main image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted group">
                <Image
                    src={images[current]}
                    alt={`${alt} - ${current + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition-all duration-300"
                    priority
                />

                {/* Navigation arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Image counter */}
                        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {current + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={cn(
                                "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                                i === current
                                    ? "border-primary ring-2 ring-primary/30"
                                    : "border-transparent opacity-60 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${alt} thumbnail ${i + 1}`}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
