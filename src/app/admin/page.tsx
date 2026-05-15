"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AdminOverview {
    totalUsers: number;
    totalUrls: number;
    totalClicks: number;
}

interface UserStat {
    id: string;
    name: string;
    email: string;
    urlsCount: number;
    createdAt: string;
}

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [users, setUsers] = useState<UserStat[]>([]);
    const [overview, setOverview] = useState<AdminOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (!localStorage.getItem('token') || user?.role !== 'admin') {
            router.push("/");
            return;
        }

        const fetchAdminData = async () => {
            try {
                const [overviewRes, usersRes] = await Promise.all([
                    api.get("/dashboard/admin/overview").catch(() => ({ data: null })),
                    api.get("/dashboard/admin/users").catch(() => ({ data: [] }))
                ]);
                if (overviewRes.data) setOverview(overviewRes.data);
                setUsers(usersRes.data);
            } catch {
                toast.error("Failed to load admin data");
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, [router, user, mounted]);

    if (!mounted || user?.role !== 'admin') return null;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total System Users</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalUsers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total URLs Generated</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalUrls}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500">Total System Clicks</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalClicks}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">All Registered Users</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading admin data...</div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No users found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm">
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">Email</th>
                                    <th className="px-6 py-3 font-medium text-center">URLs Count</th>
                                    <th className="px-6 py-3 font-medium">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{u.name}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-gray-700">{u.urlsCount ?? '...'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString()}
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