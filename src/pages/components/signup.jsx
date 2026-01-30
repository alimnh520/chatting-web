'use client';
import { useState, useEffect } from "react";
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaCamera, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        image: null,
    });
    const [preview, setPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const router = useRouter();

    // Theme detection
    useEffect(() => {
        const savedTheme = localStorage.getItem('signup-theme');
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('signup-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Theme classes
    const themeClasses = darkMode ? {
        bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        card: 'bg-gray-800/90 backdrop-blur-xl border-gray-700',
        text: 'text-white',
        secondaryText: 'text-gray-300',
        input: 'bg-gray-700/60 border-gray-600 text-white placeholder-gray-400',
        button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
        icon: 'bg-gradient-to-r from-purple-500 to-pink-500',
        link: 'text-pink-400 hover:text-pink-300',
        footer: 'text-gray-400',
        upload: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
    } : {
        bg: 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50',
        card: 'bg-white/90 backdrop-blur-xl border-white/40',
        text: 'text-gray-800',
        secondaryText: 'text-gray-600',
        input: 'bg-white/70 border-gray-300 text-gray-800 placeholder-gray-500',
        button: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
        icon: 'bg-gradient-to-r from-purple-500 to-pink-500',
        link: 'text-pink-600 hover:text-pink-700',
        footer: 'text-gray-500',
        upload: 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200'
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            const file = files[0];
            if (file) {
                // File validation
                const maxSize = 5 * 1024 * 1024; // 5MB
                const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                
                if (!validTypes.includes(file.type)) {
                    toast.error("❌ Invalid file type. Please upload JPEG, PNG, WebP, or GIF.");
                    return;
                }
                
                if (file.size > maxSize) {
                    toast.error("❌ File too large. Maximum size is 5MB.");
                    return;
                }
                
                setForm({ ...form, image: file });
                setPreview(URL.createObjectURL(file));
            }
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploadProgress(0);

        try {
            let imageUrl = null;
            let imageId = null;

            if (form.image) {
                // Simulate upload progress
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => {
                        if (prev >= 90) {
                            clearInterval(progressInterval);
                            return 90;
                        }
                        return prev + 10;
                    });
                }, 200);

                const formData = new FormData();
                formData.append("file", form.image);
                formData.append("upload_preset", "form-submit");
                formData.append("folder", "user");
                
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: formData
                    }
                );

                clearInterval(progressInterval);
                setUploadProgress(100);

                const uploadResult = await response.json();

                if (!uploadResult.secure_url) {
                    toast.error("⚠️ Image upload failed!");
                    return;
                }

                imageUrl = uploadResult.secure_url;
                imageId = uploadResult.public_id;
            }

            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    imageUrl,
                    imageId
                }),
            });

            const dataRes = await res.json();

            if (res.ok) {
                toast.success("🎉 Account created successfully!", { 
                    theme: darkMode ? "dark" : "light" 
                });
                setTimeout(() => window.location.href = '/', 1500);
            } else {
                toast.error(dataRes.message || "❌ Signup failed!", {
                    theme: darkMode ? "dark" : "light"
                });
            }

        } catch (err) {
            toast.error("⚠️ Server error!", {
                theme: darkMode ? "dark" : "light"
            });
            console.error(err);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className={`min-h-screen w-full flex items-center justify-center ${themeClasses.bg} transition-colors duration-300`}>
            {/* Background Particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(25)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10"
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
                {/* Back and Theme Toggle */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => router.push("/components/login")}
                        className={`p-3 rounded-full transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white/50 hover:bg-white text-gray-700'}`}
                    >
                        <FaArrowLeft />
                    </button>
                    
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
                    <motion.div
                        animate={{ y: isHovered ? -5 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Top Icon */}
                        <div className="flex justify-center mb-6">
                            <div className={`${themeClasses.icon} p-5 rounded-full shadow-lg relative`}>
                                <FaUserPlus className="text-white text-4xl" />
                                <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className={`text-3xl font-bold ${themeClasses.text} mb-1`}>
                                Create Account
                            </h1>
                            <p className={`text-sm ${themeClasses.secondaryText}`}>
                                Join our community today
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Input */}
                            <div className="space-y-2">
                                <label className={`flex items-center gap-2 text-sm font-medium ${themeClasses.text}`}>
                                    <FaUser className="text-purple-500" />
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        required
                                        className={`w-full pl-12 pr-4 py-3 border rounded-xl ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
                                        placeholder="Enter your name"
                                    />
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                        <FaUser className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className={`flex items-center gap-2 text-sm font-medium ${themeClasses.text}`}>
                                    <FaEnvelope className="text-purple-500" />
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        className={`w-full pl-12 pr-4 py-3 border rounded-xl ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
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
                                    <FaLock className="text-purple-500" />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        className={`w-full pl-12 pr-12 py-3 border rounded-xl ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200`}
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

                            {/* Profile Picture Upload */}
                            <div className="space-y-3">
                                <label className={`flex items-center gap-2 text-sm font-medium ${themeClasses.text}`}>
                                    <FaCamera className="text-purple-500" />
                                    Profile Picture (Optional)
                                </label>
                                
                                {/* Upload Area */}
                                <label className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-solid ${themeClasses.upload} hover:scale-[1.02]`}>
                                    <div className={`p-4 rounded-full ${themeClasses.icon}`}>
                                        <FaCamera className="text-white text-xl" />
                                    </div>
                                    <div className="text-center">
                                        <p className={`font-medium ${themeClasses.text}`}>
                                            {form.image ? form.image.name : "Click to upload image"}
                                        </p>
                                        <p className={`text-xs mt-1 ${themeClasses.secondaryText}`}>
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                </label>

                                {/* Upload Progress */}
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className={themeClasses.secondaryText}>Uploading...</span>
                                            <span className={themeClasses.secondaryText}>{uploadProgress}%</span>
                                        </div>
                                        <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                                            <motion.div
                                                initial={{ width: "0%" }}
                                                animate={{ width: `${uploadProgress}%` }}
                                                transition={{ duration: 0.3 }}
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Preview */}
                                {preview && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="relative">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreview(null);
                                                    setForm({ ...form, image: null });
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className={`text-xs ${themeClasses.secondaryText}`}>
                                            Click X to remove
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Terms Checkbox */}
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    required 
                                    className="mt-1 rounded border-gray-300 focus:ring-purple-500" 
                                />
                                <span className={`text-sm ${themeClasses.secondaryText}`}>
                                    I agree to the <span className="font-medium text-purple-500">Terms of Service</span> and <span className="font-medium text-purple-500">Privacy Policy</span>
                                </span>
                            </label>

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
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus className="text-lg" />
                                        Create Account
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-8">
                            <div className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                            <span className={`px-4 text-sm ${themeClasses.secondaryText}`}>Already have an account?</span>
                            <div className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        </div>

                        {/* Login Link */}
                        <div className={`text-center ${themeClasses.secondaryText} text-sm`}>
                            <button
                                onClick={() => router.push("/components/login")}
                                className={`font-semibold ${themeClasses.link} hover:underline inline-flex items-center gap-2`}
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className={`text-sm ${themeClasses.footer}`}>
                        © {new Date().getFullYear()} Messenger Pro • Secure Signup
                    </p>
                    <p className={`text-xs mt-1 ${themeClasses.footer}`}>
                        By <span className="font-medium text-purple-400">Nahid Hasan</span>
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