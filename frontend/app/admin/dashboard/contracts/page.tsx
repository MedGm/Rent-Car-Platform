"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Plus, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmedBooking {
    id: number;
    car_name: string;
    car_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    start_date: string;
    end_date: string;
    created_at: string;
    has_contract: boolean;
    contract_id: number | null;
}

interface ContractRecord {
    id: number;
    booking_id: number;
    car_name: string;
    customer_name: string;
    start_date: string;
    end_date: string;
    status: string;
    has_contract_pdf: boolean;
    has_invoice_pdf: boolean;
    created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ContractsPage() {
    const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBooking[]>([]);
    const [contracts, setContracts] = useState<ContractRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [generatingId, setGeneratingId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"generate" | "contracts">("generate");

    const getToken = () => localStorage.getItem("admin_token");

    async function fetchData() {
        const token = getToken();
        setLoading(true);
        try {
            const [bookingsRes, contractsRes] = await Promise.all([
                fetch(`${API_URL}/contracts/confirmed-bookings`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_URL}/contracts`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (bookingsRes.ok) {
                setConfirmedBookings(await bookingsRes.json());
            }
            if (contractsRes.ok) {
                setContracts(await contractsRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch contract data", error);
        } finally {
            setLoading(false);
        }
    }

    async function generateContract(bookingId: number) {
        const token = getToken();
        setGeneratingId(bookingId);
        try {
            const res = await fetch(`${API_URL}/contracts/generate/${bookingId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                await fetchData();
            } else {
                const err = await res.json();
                alert(err.message || "Failed to generate contract");
            }
        } catch (error) {
            console.error("Error generating contract", error);
            alert("Failed to generate contract");
        } finally {
            setGeneratingId(null);
        }
    }

    function downloadDocument(contractId: number, docType: "contract" | "invoice") {
        const token = getToken();
        const url = `${API_URL}/contracts/download/${contractId}/${docType}`;
        
        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Download failed");
                return res.blob();
            })
            .then((blob) => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = docType === "contract" 
                    ? `Contrat_${contractId}.pdf` 
                    : `Facture_${contractId}.pdf`;
                link.click();
                URL.revokeObjectURL(link.href);
            })
            .catch((err) => {
                console.error("Download error:", err);
                alert("Failed to download document");
            });
    }

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Contracts & Invoices</h1>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
                <button
                    onClick={() => setActiveTab("generate")}
                    className={cn(
                        "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
                        activeTab === "generate"
                            ? "bg-white shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Confirmed Bookings ({confirmedBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab("contracts")}
                    className={cn(
                        "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
                        activeTab === "contracts"
                            ? "bg-white shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Generated Documents ({contracts.length})
                </button>
            </div>

            {/* Tab: Confirmed Bookings - Generate Contracts */}
            {activeTab === "generate" && (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-4 font-medium text-muted-foreground">Booking</th>
                                <th className="p-4 font-medium text-muted-foreground">Car</th>
                                <th className="p-4 font-medium text-muted-foreground">Client</th>
                                <th className="p-4 font-medium text-muted-foreground">Dates</th>
                                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {confirmedBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-muted/5">
                                    <td className="p-4 font-bold">#{booking.id}</td>
                                    <td className="p-4 font-medium">{booking.car_name}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{booking.customer_name}</div>
                                        {booking.customer_phone && (
                                            <div className="text-xs text-muted-foreground">{booking.customer_phone}</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {new Date(booking.start_date).toLocaleDateString()} -{" "}
                                        {new Date(booking.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {booking.has_contract ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    Generated
                                                </span>
                                                <button
                                                    onClick={() => downloadDocument(booking.contract_id!, "contract")}
                                                    className="rounded p-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="Download Contract"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => downloadDocument(booking.contract_id!, "invoice")}
                                                    className="rounded p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Download Invoice"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => generateContract(booking.id)}
                                                    disabled={generatingId === booking.id}
                                                    className="rounded p-1.5 text-orange-600 hover:bg-orange-100 transition-colors"
                                                    title="Regenerate"
                                                >
                                                    <RefreshCw className={cn("h-4 w-4", generatingId === booking.id && "animate-spin")} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => generateContract(booking.id)}
                                                disabled={generatingId === booking.id}
                                                className={cn(
                                                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all",
                                                    generatingId === booking.id
                                                        ? "bg-neutral-400 cursor-not-allowed"
                                                        : "bg-neutral-900 hover:bg-neutral-800 hover:scale-105"
                                                )}
                                            >
                                                {generatingId === booking.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Plus className="h-4 w-4" />
                                                )}
                                                Generate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {confirmedBookings.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No confirmed bookings. Confirm a booking first to generate contracts.
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Generated Documents */}
            {activeTab === "contracts" && (
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-4 font-medium text-muted-foreground">Contract</th>
                                <th className="p-4 font-medium text-muted-foreground">Car</th>
                                <th className="p-4 font-medium text-muted-foreground">Client</th>
                                <th className="p-4 font-medium text-muted-foreground">Dates</th>
                                <th className="p-4 font-medium text-muted-foreground">Generated</th>
                                <th className="p-4 font-medium text-muted-foreground text-right">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {contracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-muted/5">
                                    <td className="p-4 font-bold">#{contract.id}</td>
                                    <td className="p-4 font-medium">{contract.car_name}</td>
                                    <td className="p-4">{contract.customer_name}</td>
                                    <td className="p-4 text-muted-foreground">
                                        {contract.start_date && new Date(contract.start_date).toLocaleDateString()} -{" "}
                                        {contract.end_date && new Date(contract.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {new Date(contract.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {contract.has_contract_pdf && (
                                                <button
                                                    onClick={() => downloadDocument(contract.id, "contract")}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
                                                    title="Download Contract PDF"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Contrat
                                                </button>
                                            )}
                                            {contract.has_invoice_pdf && (
                                                <button
                                                    onClick={() => downloadDocument(contract.id, "invoice")}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                                                    title="Download Invoice PDF"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    Facture
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {contracts.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No contracts generated yet. Go to &quot;Confirmed Bookings&quot; tab to generate.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
