"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

// Colors (Netflix red palette aware)
const COLORS = ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#a855f7'];

export function BookingTrendsChart({ data }: { data: { name: string, bookings: number }[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

    return (
        <Card className="col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Number of bookings per month</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px' }}
                            cursor={{ fill: 'var(--muted)' }}
                        />
                        <Bar dataKey="bookings" fill="#ef4444" radius={[4, 4, 0, 0]} name="Bookings" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function RevenueChart({ data }: { data: { name: string, revenue: number }[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

    return (
        <Card className="col-span-2 lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>Revenue Growth</CardTitle>
                    <CardDescription>Monthly revenue from confirmed bookings</CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-600 dark:bg-green-900/20">
                    <TrendingUp className="h-3 w-3" />
                    +12.5%
                </div>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} DH`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            name="Revenue"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function StatusDistributionChart({ data }: { data: { name: string, value: number }[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

    // Map status to colors
    const STATUS_COLORS: Record<string, string> = {
        'confirmed': '#22c55e', // Green
        'pending': '#eab308',   // Yellow
        'cancelled': '#ef4444', // Red
        'completed': '#3b82f6', // Blue
    };

    return (
        <Card className="col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Booking Status</CardTitle>
                <CardDescription>Distribution of current bookings</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px' }} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function PopularCarsChart({ data }: { data: { name: string, bookings: number, revenue: number }[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

    return (
        <Card className="col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Fleet Performance</CardTitle>
                <CardDescription>Top 5 vehicles by bookings and revenue</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px' }}
                            cursor={{ fill: 'var(--muted)' }}
                        />
                        <Legend />
                        <Bar dataKey="bookings" fill="#ef4444" radius={[0, 4, 4, 0]} name="Bookings" barSize={20} />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Revenue" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

