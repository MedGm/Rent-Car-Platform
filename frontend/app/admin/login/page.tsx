"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) throw new Error("Invalid credentials");

            const data = await res.json();
            localStorage.setItem("admin_token", data.token);
            document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
            router.push("/admin/dashboard");
        } catch (err) {
            setError("Login failed. Check your credentials.");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
            <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg">
                <div className="mb-6 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold">Admin Portal</h1>
                    <p className="text-sm text-muted-foreground">Sign in to manage fleet</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-xs font-medium text-destructive text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-primary py-2 font-bold text-white transition-colors hover:bg-primary/90"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
