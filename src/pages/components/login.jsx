'use client';
import { useState, useEffect } from "react";
import { FaUserShield, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    // Theme detection
    useEffect(() => {
        const savedTheme = localStorage.getItem('login-theme');
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('login-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Theme classes
    const themeClasses = darkMode ? {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        card: 'bg-gray-800/90 backdrop-blur-xl border-gray-700',
        text: 'text-white',
        secondaryText: 'text-gray-300',
        input: 'bg-gray-700/60 border-gray-600 text-white placeholder-gray-400',
        button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
        icon: 'bg-gradient-to-r from-blue-500 to-purple-500',
        link: 'text-blue-400 hover:text-blue-300',
        footer: 'text-gray-400'
    } : {
        bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
        card: 'bg-white/90 backdrop-blur-xl border-white/40',
        text: 'text-gray-800',
        secondaryText: 'text-gray-600',
        input: 'bg-white/70 border-gray-300 text-gray-800 placeholder-gray-500',
        button: 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600',
        icon: 'bg-gradient-to-r from-green-500 to-blue-500',
        link: 'text-green-600 hover:text-green-700',
        footer: 'text-gray-500'
    };

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
                credentials: "include",
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("✅ Login successful!", { 
                    position: "bottom-right",
                    theme: darkMode ? "dark" : "light"
                });
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                toast.error(data.message || "❌ Login failed!", {
                    theme: darkMode ? "dark" : "light"
                });
            }

        } catch (error) {
            toast.error("⚠️ Server error!", { 
                position: "bottom-right",
                theme: darkMode ? "dark" : "light"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen w-full flex items-center justify-center ${themeClasses.bg} transition-colors duration-300`}>
            {/* Background Particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                        style={{
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}
            </div>

            {/* Main Container */}
            <div className="w-full max-w-md mx-4">
                {/* Theme Toggle */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-3 rounded-full transition-all ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-white/50 text-gray-700 hover:bg-white'}`}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                </div>

                {/* Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`relative ${themeClasses.card} rounded-3xl shadow-2xl p-8 border transition-all duration-300 hover:shadow-3xl`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Floating Animation */}
                    <motion.div
                        animate={{ y: isHovered ? -5 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Top Icon */}
                        <div className="flex justify-center mb-6">
                            <div className={`${themeClasses.icon} p-5 rounded-full shadow-lg relative`}>
                                <FaUserShield className="text-white text-4xl" />
                                <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-2">
                            <h1 className={`text-3xl font-bold ${themeClasses.text} mb-1`}>
                                Welcome Back
                            </h1>
                            <p className={`text-sm ${themeClasses.secondaryText}`}>
                                Sign in to continue to your account
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className={`flex items-center gap-2 text-sm font-medium ${themeClasses.text}`}>
                                    <FaEnvelope className="text-blue-500" />
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        className={`w-full pl-12 pr-4 py-3 border rounded-xl ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                        placeholder="you@example.com"
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                        <FaEnvelope className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className={`flex items-center gap-2 text-sm font-medium ${themeClasses.text}`}>
                                    <FaLock className="text-blue-500" />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        className={`w-full pl-12 pr-12 py-3 border rounded-xl ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200`}
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                        <FaLock className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className={`text-lg ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} />
                                        ) : (
                                            <FaEye className={`text-lg ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                    <span className={`text-sm ${themeClasses.secondaryText}`}>Remember me</span>
                                </label>
                                <button type="button" className={`text-sm font-medium ${themeClasses.link} hover:underline`}>
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileTap={{ scale: 0.95 }}
                                className={`w-full py-3.5 rounded-xl text-white font-semibold flex justify-center items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl 
                                    ${loading 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : themeClasses.button
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <FaSignInAlt className="text-lg" />
                                        Sign In
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Sign Up Link */}
                        <div className={`text-center ${themeClasses.secondaryText} text-sm`}>
                            Don't have an account?{' '}
                            <button
                                onClick={() => router.push("/components/signup")}
                                className={`font-semibold ${themeClasses.link} hover:underline inline-flex items-center gap-1`}
                            >
                                <FaUserPlus className="text-sm" />
                                Create account
                            </button>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className={`text-sm ${themeClasses.footer}`}>
                        © {new Date().getFullYear()} Messenger Pro • Secure Login System
                    </p>
                    <p className={`text-xs mt-1 ${themeClasses.footer}`}>
                        By <span className="font-medium text-blue-400">Nahid Hasan</span>
                    </p>
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer 
                position="bottom-right"
                theme={darkMode ? "dark" : "light"}
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}