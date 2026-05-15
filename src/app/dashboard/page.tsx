"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Overview {
    totalUrls: number;
    totalStats: number;
}

interface URLStat {
    id: string;
    originalUrl: string;
    shortUrl?: string;
    shortcode?: string;
    clicks: number;
    createdAt: string;
    expiresAt: string;
}

export default function Dashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [urls, setUrls] = useState<URLStat[]>([]);
    const [overview, setOverview] = useState<Overview | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [createdShort, setCreatedShort] = useState("");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [urlsRes, overviewRes] = await Promise.all([
                api.get("/dashboard/user/urls").catch(() => ({ data: [] })),
                api.get("/dashboard/user/overview").catch(() => ({ data: null }))
            ]);
            const urlPayload = urlsRes.data as { data?: URLStat[] } | URLStat[];
            const urlList = Array.isArray(urlPayload) ? urlPayload : (urlPayload.data ?? []);
            setUrls(urlList);
            if (overviewRes.data) {
                const raw = overviewRes.data as { totalUrls?: number; totalStats?: number; totalClicks?: number };
                setOverview({
                    totalUrls: raw.totalUrls ?? urlList.length,
                    totalStats: raw.totalStats ?? raw.totalClicks ?? 0,
                });
            }
        } catch {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!mounted) return;
        if (!localStorage.getItem('token')) {
            router.push("/login");
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDashboardData();
    }, [router, mounted]);

    const handleCreateUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl) return;
        setCreateLoading(true);
        try {
            const res = await api.post("/url", { originalUrl: newUrl });
            const shortUrl = res.data?.data as string | undefined;
            if (shortUrl) {
                setCreatedShort(shortUrl);
                setNewUrl("");
                toast.success("URL shortened successfully!");
                fetchDashboardData();
            } else {
                toast.error("Failed to shorten URL");
            }
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to shorten URL");
        } finally {
            setCreateLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!createdShort) return;
        navigator.clipboard.writeText(createdShort);
        toast.success("Copied to clipboard!");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this URL?")) return;
        try {
            await api.delete(`/url/${id}`);
            toast.success("URL deleted");

            fetchDashboardData();
        } catch {
            toast.error("Failed to delete URL");
        }
    };

    const handleExtend = async (id: string) => {
        try {
            await api.patch(`/url/extend/${id}`);
            toast.success("URL expiry extended by 24 hours!");

            fetchDashboardData();
        } catch {
            toast.error("Failed to extend URL");
        }
    };

    const handleRegenerate = async (id: string) => {
        try {
            await api.patch(`/url/regenerate/${id}`);
            toast.success("URL regenerated!");

            fetchDashboardData();
        } catch {
            toast.error("Failed to regenerate URL");
        }
    };

    if (!mounted || !user) return null;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-2">Welcome back, {user?.name || 'User'}!</p>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Shorten a new URL</h2>
                <form onSubmit={handleCreateUrl} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="url"
                        required
                        placeholder="https://example.com/very-long-url-to-shorten"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                        type="submit"
                        disabled={createLoading || !newUrl}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
                    >
                        {createLoading ? "Shortening..." : "Shorten"}
                    </button>
                </form>
                {createdShort && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <a href={createdShort} target="_blank" rel="noopener noreferrer" className="text-green-800 font-medium truncate max-w-xs md:max-w-md hover:underline">
                            {createdShort}
                        </a>
                        <button onClick={copyToClipboard} className="px-4 py-2 bg-white text-green-700 border border-green-300 rounded-md hover:bg-green-100 transition shadow-sm text-sm font-semibold">
                            Copy
                        </button>
                    </div>
                )}
            </div>

            {(overview || urls.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total URLs</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.totalUrls ?? urls.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total Clicks/Visits</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.totalStats ?? urls.reduce((acc, curr) => acc + curr.clicks, 0)}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Your Shortened URLs</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : urls.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">You haven&apos;t shortened any URLs yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm">
                                    <th className="px-6 py-3 font-medium">Short Code (Link)</th>
                                    <th className="px-6 py-3 font-medium">Original URL</th>
                                    <th className="px-6 py-3 font-medium">Clicks</th>
                                    <th className="px-6 py-3 font-medium">Expires At</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {urls.map((url) => (
                                    <tr key={url.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-blue-600">
                                            <a
                                                href={url.shortUrl?.startsWith("http")
                                                    ? url.shortUrl
                                                    : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/url/${url.shortcode ?? url.shortUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {url.shortcode ?? url.shortUrl}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-xs">{url.originalUrl}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-gray-700">{url.clicks}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {url.expiresAt ? new Date(url.expiresAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => handleExtend(url.id)} className="text-blue-600 hover:text-blue-800 font-medium">Extend</button>
                                            <button onClick={() => handleRegenerate(url.id)} className="text-orange-500 hover:text-orange-700 font-medium">Regen</button>
                                            <button onClick={() => handleDelete(url.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}