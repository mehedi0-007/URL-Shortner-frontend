"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Profile() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        if (user?.name) setName(user.name);
    }, [user]);

    useEffect(() => {
        if (!mounted) return;
        if (!user) {
            router.push("/login");
        }
    }, [user, mounted, router]);

    if (!mounted || !user) {
        return null; // Avoid hydration visual errors
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/user/${user.id}`, { name });
            toast.success("Profile updated successfully! Please re-login to see changes.");
        } catch (err) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you ABSOLUTELY sure you want to delete your account? This action cannot be undone.")) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/user/${user.id}`);
            toast.success("Account deleted");
            logout();
            router.push("/");
        } catch (err) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete account");
            setDeleteLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Profile</h2>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    {loading ? "Updating..." : "Update Profile"}
                </button>
            </form>

            <div className="mt-12 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="w-full bg-red-50 text-red-600 border border-red-200 font-medium py-2 rounded-lg hover:bg-red-100 transition"
                >
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                </button>
            </div>
        </div>
    );
}