"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

// Colors (Netflix red palette aware)
const COLORS = ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#a855f7'];

export function BookingTrendsChart({ data }: { data: { name: string, bookings: number }[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

    return (
        <Card className="col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Number of bookings per month</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <defs>
                            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#e5e7eb"} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number | string) => `${value}`} dx={-10} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '8px',
                                border: isDark ? '1px solid #333' : '1px solid #e5e7eb',
                                color: isDark ? '#fff' : '#000',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            cursor={{ fill: isDark ? '#222' : '#f3f4f6' }}
                        />
                        <Bar dataKey="bookings" fill="url(#colorBookings)" radius={[6, 6, 0, 0]} name="Bookings" barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function RevenueChart({ data }: { data: { name: string, revenue: number }[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

    return (
        <Card className="col-span-2 lg:col-span-4 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl">Revenue Growth</CardTitle>
                    <CardDescription>Monthly revenue from confirmed bookings</CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    +12.5%
                </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#e5e7eb"} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number | string) => `${value} DH`} dx={-10} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '8px',
                                border: isDark ? '1px solid #333' : '1px solid #e5e7eb',
                                color: isDark ? '#fff' : '#000',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name="Revenue"
                            activeDot={{ r: 6, strokeWidth: 0, fill: "#22c55e" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function StatusDistributionChart({ data }: { data: { name: string, value: number }[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

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
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '8px',
                                border: isDark ? '1px solid #333' : '1px solid #e5e7eb',
                                color: isDark ? '#fff' : '#000'
                            }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function PopularCarsChart({ data }: { data: { name: string, bookings: number, revenue: number }[] }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;

    return (
        <Card className="col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Fleet Performance</CardTitle>
                <CardDescription>Top 5 vehicles by bookings and revenue</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <defs>
                            <linearGradient id="colorFleetBookings" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="colorFleetRevenue" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#333" : "#e5e7eb"} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={110} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '8px',
                                border: isDark ? '1px solid #333' : '1px solid #e5e7eb',
                                color: isDark ? '#fff' : '#000',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            cursor={{ fill: isDark ? '#222' : '#f3f4f6' }}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="bookings" fill="url(#colorFleetBookings)" radius={[0, 4, 4, 0]} name="Bookings" barSize={12} />
                        <Bar dataKey="revenue" fill="url(#colorFleetRevenue)" radius={[0, 4, 4, 0]} name="Revenue" barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

