"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Link2 } from "lucide-react";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.error("Logout API failed", e);
        } finally {
            logout();
            router.push("/login");
        }
    };

    return (
        <nav className="border-b shadow-sm w-full top-0 bg-white z-50 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    <Link2 />
                    URL Shortener
                </Link>
                <div className="flex gap-4 items-center">
                    {mounted ? (
                        user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link href="/admin" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Admin</Link>
                                )}
                                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Dashboard</Link>
                                <Link href="/profile" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Profile</Link>
                                <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Login</Link>
                                <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Sign Up</Link>
                            </>
                        )
                    ) : null}
                </div>
            </div>
        </nav>
    );
}
