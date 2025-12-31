'use client';
import { useState } from "react";
import { FaUserShield } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function page() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const router = useRouter();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("✅ লগইন সফল!", { position: "bottom-right" });
                window.location.href = '/';
            } else {
                toast.error(data.message || "❌ লগইন ব্যর্থ!");
            }

        } catch (error) {
            toast.error("⚠️ সার্ভার এরর!", { position: "bottom-right" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 sm:-mt-16 -mt-14">
            {/* 🔹 Card */}
            <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8 border border-white/40 dark:border-gray-700 transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]">

                {/* 🔹 Top Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full shadow-md">
                        <FaUserShield className="text-white text-3xl" />
                    </div>
                </div>

                {/* 🔹 Title */}
                <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-1">
                    Login Account 
                </h2>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    নিরাপদে আপনার মেসেজে প্রবেশ করুন
                </p>

                {/* 🔹 Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ইমেইল
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-gray-700/60 text-gray-800 shadow-inner focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                            placeholder="admin@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            পাসওয়ার্ড
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-gray-700/60 text-gray-800 shadow-inner focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 rounded-lg text-white font-semibold flex justify-center items-center gap-2 transition-all duration-300 
                            ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                                    ></path>
                                </svg>
                                লোড হচ্ছে...
                            </>
                        ) : (
                            "🔐 লগইন"
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-6">
                    একাউন্ট নেই?{" "}
                    <span
                        onClick={() => router.push("/components/signup")}
                        className="text-green-600 font-medium cursor-pointer hover:underline"
                    >
                        রেজিস্ট্রেশন করুন
                    </span>
                </p>

                {/* 🔹 Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    © {new Date().getFullYear()} — Admin Portal by <span className="text-green-600 font-medium">Nahid Hasan</span>
                </p>
            </div>

            <ToastContainer position="bottom-right" />
        </div>
    );
}
