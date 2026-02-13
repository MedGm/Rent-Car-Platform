"use client";

import Link from "next/link";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

function LeafletMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (mapInstanceRef.current || !mapRef.current) return;

        const loadMap = async () => {
            const L = (await import("leaflet")).default;

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
    return (
        <footer className="bg-black text-white pt-16 pb-8" id="contact">
            <div className="container mx-auto">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
                    {/* Brand & About */}
                    <div className="space-y-4">
                        <div className="relative h-8 w-32">
                            <Image
                                src="/logo.png"
                                alt="Misters Drivers Logo"
                                fill
                                className="object-contain brightness-0 invert"
                            />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Agence de location de voitures à Agadir. Service premium, flotte variée et assistance 24h/24.
                            Votre partenaire de mobilité au Maroc.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://www.facebook.com/profile.php?id=61561026257498" target="_blank" className="text-gray-400 hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="https://www.instagram.com/misters.drivers" target="_blank" className="text-gray-400 hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Liens Rapides</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
                            <li><Link href="/cars" className="hover:text-white transition-colors">Notre Flotte</Link></li>
                            <li><Link href="/#services" className="hover:text-white transition-colors">Services</Link></li>
                            <li><Link href="/#articles" className="hover:text-white transition-colors">Articles</Link></li>
                            <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Contact</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <span>Mag N° AH 545, Cité El Qods, Agadir, Maroc</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <div className="flex flex-col">
                                    <Link href="tel:+212528210909" className="hover:text-white transition-colors">05 28 21 09 09</Link>
                                    <Link href="tel:+212671920545" className="hover:text-white transition-colors">06 71 92 05 45</Link>
                                </div>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <Link href="mailto:driversmisters@gmail.com" className="hover:text-white transition-colors">
                                    driversmisters@gmail.com
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Map */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Nous Trouver</h4>
                        <LeafletMap />
                        <p className="text-gray-500 text-xs mt-2">Cité El Qods, Agadir</p>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Misters Drivers. Tous droits réservés.
                </div>
            </div>
        </footer>
    );
}
