"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { Copy, ExternalLink, Scissors } from "lucide-react";

export default function Home() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortened, setShortened] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const res = await api.post("/url", { originalUrl: url });
      if (res.data?.data) {
        setShortened(res.data.data);
        toast.success("URL shortened successfully!");
        setUrl("");
      }
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortened);
    toast.success("Copied to clipboard!");
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="text-center max-w-2xl w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Scissors className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Make every link count
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          Shorten, manage, and track your URLs easily with our fast and reliable shortener.
        </p>

        {!user ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Ready to start?</h2>
            <p className="text-gray-600 mb-6">You need an account to create and manage short links.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Log In</Link>
              <Link href="/signup" className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-200">Sign Up</Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 text-left">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Shorten a new URL</h2>
            <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-3">
              <input type="url" required placeholder="https://example.com/very-long-url-to-shorten" value={url} onChange={(e) => setUrl(e.target.value)} className="grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              <button type="submit" disabled={loading || !url} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap">
                {loading ? "Shortening..." : "Shorten"}
              </button>
            </form>
            {shortened && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <a href={shortened} target="_blank" rel="noopener noreferrer" className="text-green-800 font-medium truncate max-w-xs md:max-w-md hover:underline flex items-center gap-2">
                  {shortened}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 border border-green-300 rounded-md hover:bg-green-100 transition shadow-sm text-sm font-semibold">
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
