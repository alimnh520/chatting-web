'use client';
import { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        image: null,
    });
    const [preview, setPreview] = useState(null); // প্রিভিউ এর জন্য

    const router = useRouter();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            const file = files[0];
            setForm({ ...form, image: file });
            setPreview(file ? URL.createObjectURL(file) : null); // প্রিভিউ সেট
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = null;
            let imageId = null;

            if (form.image) {
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

                const uploadResult = await response.json();

                if (!uploadResult.secure_url) {
                    toast.error("⚠️ ছবি আপলোড ব্যর্থ!");
                    return;
                }

                imageUrl = uploadResult.secure_url;
                imageId = uploadResult.public_id;
            }

            console.log(imageUrl);



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
                toast.success("🎉 একাউন্ট তৈরি সফল!", { position: "bottom-right" });
                setTimeout(() => window.location.href = '/', 500);
            } else {
                toast.error(dataRes.message || "❌ সাইনআপ ব্যর্থ!");
            }

        } catch (err) {
            toast.error("⚠️ সার্ভার এরর!", { position: "bottom-right" });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 sm:-mt-16 -mt-14">
            <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8 border border-white/40 transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full shadow-md">
                        <FaUserPlus className="text-white text-3xl" />
                    </div>
                </div>

                <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-1">
                    Create Account
                </h2>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    নতুন একাউন্ট তৈরি করুন
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ইউজারনেম
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white/70 text-gray-800 shadow-inner focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                            placeholder="Your name"
                        />
                    </div>

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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white/70 text-gray-800 shadow-inner focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                            placeholder="user@example.com"
                        />
                    </div>

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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white/70 text-gray-800 shadow-inner focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            প্রোফাইল ছবি (ঐচ্ছিক)
                        </label>

                        {/* Custom Upload Button */}
                        <label className="cursor-pointer bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-md flex items-center gap-2 transition-all duration-300">
                            Upload Image
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                className="hidden"
                            />
                        </label>

                        {/* Preview */}
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-28 h-28 object-cover rounded-full mt-3 border-2 border-gray-300 shadow-sm"
                            />
                        )}
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 rounded-lg text-white font-semibold flex justify-center items-center gap-2 transition-all duration-300 
                            ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {loading ? "একাউন্ট তৈরি হচ্ছে..." : "🚀 সাইনআপ"}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-6">
                    ইতিমধ্যে একাউন্ট আছে?{" "}
                    <span
                        onClick={() => router.push("/components/login")}
                        className="text-green-600 font-medium cursor-pointer hover:underline"
                    >
                        লগইন করুন
                    </span>
                </p>
            </div>

            <ToastContainer position="bottom-right" />
        </div>
    );
}
