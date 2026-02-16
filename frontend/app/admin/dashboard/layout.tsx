"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Car, Calendar, FileText, LogOut, Newspaper, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Force light mode in admin dashboard
    useEffect(() => {
        const html = document.documentElement;
        const wasDark = html.classList.contains("dark");
        html.classList.remove("dark");
        return () => {
            if (wasDark) html.classList.add("dark");
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin/login");
        }
    }, [router]);

    if (!mounted) return null;

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Fleet", href: "/admin/dashboard/fleet", icon: Car },
        { name: "Bookings", href: "/admin/dashboard/bookings", icon: Calendar },
        { name: "Contracts", href: "/admin/dashboard/contracts", icon: FileText },
        { name: "Articles", href: "/admin/dashboard/articles", icon: Newspaper },
        { name: "Services", href: "/admin/dashboard/services", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-neutral-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white text-neutral-900 shadow-md">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="text-xl font-extrabold tracking-tighter">
                        <span className="text-primary">MISTERS</span> DRIVERS
                    </Link>
                </div>

                <nav className="space-y-1 p-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-neutral-100",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-4 left-0 w-full px-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem("admin_token");
                            document.cookie = "admin_token=; path=/; max-age=0";
                            router.push("/admin/login");
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 w-full p-8 bg-neutral-50 min-h-screen">
                {children}
            </main>
        </div>
    );
}
