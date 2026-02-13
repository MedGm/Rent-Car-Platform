import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="bg-black text-white pt-16 pb-8" id="contact">
            <div className="container mx-auto">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
                    {/* Brand */}
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
                            Premium car rental service designed for those who demand excellence.
                            Experience the difference with our curated fleet and 24/7 support.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-gray-400 hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></Link>
                            <Link href="#" className="text-gray-400 hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></Link>
                            <Link href="#" className="text-gray-400 hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/cars" className="hover:text-white transition-colors">Fleet</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Services</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Services</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Airport Transfer</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Chauffeur Service</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Wedding Cars</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Corporate Rental</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span>123 Premium Blvd, Beverly Hills, CA 90210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span>contact@mistersdrivers.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Misters Drivers. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
