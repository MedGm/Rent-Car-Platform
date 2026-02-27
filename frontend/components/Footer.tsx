"use client";

import Link from "next/link";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";

function LeafletMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (mapInstanceRef.current || !mapRef.current) return;

        const loadMap = async () => {
            const L = (await import("leaflet")).default;

            // Component may have unmounted during async import
            if (!mapRef.current) return;

            // Inject leaflet CSS
            if (!document.getElementById("leaflet-css")) {
                const link = document.createElement("link");
                link.id = "leaflet-css";
                link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(link);
            }

            // Agadir - Cité El Qods area
            const lat = 30.4278;
            const lng = -9.5981;

            const map = L.map(mapRef.current!, {
                scrollWheelZoom: false,
                attributionControl: false,
            }).setView([lat, lng], 15);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap',
            }).addTo(map);

            const icon = L.divIcon({
                html: `<div style="background:#c8a45a;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>`,
                className: "",
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });

            L.marker([lat, lng], { icon }).addTo(map)
                .bindPopup("<b>MISTERS DRIVERS</b><br>Mag N° AH 545, Cité El Qods, Agadir");

            mapInstanceRef.current = map;
        };

        loadMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return <div ref={mapRef} className="h-40 w-full rounded-lg overflow-hidden" />;
}

export function Footer() {
    const { t } = useLanguage();
    return (
        <footer className="bg-black dark:bg-[#0a0000] text-white pt-16 pb-8" id="contact">
            <div className="container mx-auto px-6 sm:px-4">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-16">
                    {/* Brand & About */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-start space-y-4">
                        <div className="relative bg-white rounded-lg px-3 py-2 flex items-center justify-center shadow-sm">
                            <div className="relative h-10 w-36 sm:h-12 sm:w-40">
                                <Image
                                    src="/logo.png"
                                    alt="Misters Drivers Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            {t.footer_about}
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://www.instagram.com/misters.drivers" target="_blank" className="text-gray-400 hover:text-primary transition-colors p-2 -m-2">
                                <Instagram className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-start">
                        <h4 className="font-bold text-lg mb-6">{t.footer_quick_links}</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors block py-1">{t.footer_home}</Link></li>
                            <li><Link href="/cars" className="hover:text-white transition-colors block py-1">{t.footer_fleet}</Link></li>
                            <li><Link href="/#services" className="hover:text-white transition-colors block py-1">{t.footer_services}</Link></li>
                            <li><Link href="/#articles" className="hover:text-white transition-colors block py-1">{t.footer_articles}</Link></li>
                            <li><Link href="#contact" className="hover:text-white transition-colors block py-1">{t.footer_contact}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center md:text-start">
                        <h4 className="font-bold text-lg mb-6">{t.footer_contact_heading}</h4>
                        <ul className="space-y-4 text-gray-400 text-sm" dir="ltr">
                            <li className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-2 md:gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span>{t.footer_address}</span>
                            </li>
                            <li className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-2 md:gap-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <div className="flex flex-col">
                                    <Link href="tel:+212528210909" className="hover:text-white transition-colors py-1">05 28 21 09 09</Link>
                                    <Link href="tel:+212671920545" className="hover:text-white transition-colors py-1">06 71 92 05 45</Link>
                                </div>
                            </li>
                            <li className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-2 md:gap-3">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <Link href="mailto:driversmisters@gmail.com" className="hover:text-white transition-colors py-1">
                                    driversmisters@gmail.com
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Map */}
                    <div className="text-center md:text-start">
                        <h4 className="font-bold text-lg mb-6">{t.footer_find_us}</h4>
                        <div className="h-32 sm:h-40 w-full rounded-xl overflow-hidden ring-1 ring-white/10">
                            <LeafletMap />
                        </div>
                        <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Cité El Qods, Agadir</p>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Misters Drivers. {t.footer_rights}
                </div>
            </div>
        </footer>
    );
}
