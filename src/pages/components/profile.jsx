'use client'

import { useContext, useState } from "react";
import { UserContext } from "../Provider";
import { FiCamera, FiEdit2, FiSave, FiX, FiLogOut, FiMail, FiCalendar, FiClock, FiKey } from "react-icons/fi";
import { IoCheckmarkCircle } from "react-icons/io5";

export default function ProfilePage() {
    const { user } = useContext(UserContext);
    const [editMode, setEditMode] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [form, setForm] = useState({
        username: user?.username || "",
        email: user?.email || "",
        password: "",
        image: user?.image || "",
        imageId: user?.imageId || ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate image size and type
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert("Image size should be less than 5MB");
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert("Please upload a valid image (JPEG, PNG, WebP, GIF)");
            return;
        }

        setForm({ ...form, image: file });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!isFormChanged()) {
            setEditMode(false);
            return;
        }

        setIsUploading(true);
        setSaveSuccess(false);

        try {
            let imageUrl = user.image || null;
            let imageId = user.imageId || null;

            if (form.image instanceof File) {
                const formData = new FormData();
                formData.append("file", form.image);
                formData.append("upload_preset", "form-submit");
                formData.append("folder", "user");

                const resCloud = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
                    { method: "POST", body: formData }
                );

                const uploadResult = await resCloud.json();
                if (!uploadResult.secure_url) throw new Error("Image upload failed");

                imageUrl = uploadResult.secure_url;
                imageId = uploadResult.public_id;
            }

            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user._id,
                    username: form.username,
                    email: form.email,
                    password: form.password || undefined,
                    imageUrl,
                    imageId,
                    deleteId: user.imageId
                }),
            });

            const dataRes = await res.json();
            if (!res.ok) throw new Error(dataRes.message);

            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                setEditMode(false);
            }, 2000);

            // Reset password field
            setForm(prev => ({ ...prev, password: "" }));

        } catch (err) {
            console.error(err);
            alert("❌ Update failed: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const isFormChanged = () => {
        if (!user) return false;

        return (
            form.username !== user.username ||
            form.email !== user.email ||
            form.password.trim() !== "" ||
            form.image instanceof File
        );
    };

    const handleLogout = async () => {
       const res = await fetch('/api/logout',{method: 'POST'});
       const data = await res.json();
       if (data.success) window.location.href = '/components/login'
    };

    if (!user) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white text-lg font-medium mt-4">Loading profile...</p>
                </div>
            </div>
        );
    }

    const defaultImage = "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header with Logout */}
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Profile Settings</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm"
                    >
                        <FiLogOut className="text-lg" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>

                {/* Main Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-6 md:p-8">
                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                            {/* Profile Image */}
                            <div className="relative group">
                                <div className="relative w-32 h-32 md:w-40 md:h-40">
                                    <img
                                        src={
                                            form.image
                                                ? form.image instanceof File
                                                    ? URL.createObjectURL(form.image)
                                                    : form.image
                                                : user?.image || defaultImage
                                        }
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
                                    />
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-pink-500/20"></div>
                                </div>

                                {editMode && (
                                    <label className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group-hover:opacity-100">
                                        <FiCamera size={20} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}

                                {/* Online Status */}
                                <div className="absolute top-2 right-2">
                                    <div className={`w-4 h-4 rounded-full border-2 border-white ${user.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                </div>
                            </div>

                            {/* Username and Edit Button */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="mb-4">
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="username"
                                            value={form.username}
                                            onChange={handleChange}
                                            placeholder="Username"
                                            className="w-full text-xl md:text-4xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 px-2 py-1 outline-none focus:border-purple-500"
                                            maxLength={30}
                                        />
                                    ) : (
                                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                            {user.username}
                                        </h1>
                                    )}
                                    <p className="text-gray-600 mt-2">
                                        {user.email}
                                    </p>
                                </div>

                                {/* Edit/Save Button */}
                                <div className="flex justify-center md:justify-start gap-3">
                                    {editMode ? (
                                        <button
                                            onClick={handleSave}
                                            disabled={!isFormChanged() || isUploading}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${!isFormChanged() || isUploading
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                                                }`}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiSave size={18} />
                                                    <span>Save</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                                        >
                                            <FiEdit2 size={18} />
                                            <span>Edit Profile</span>
                                        </button>
                                    )}

                                    {editMode && (
                                        <button
                                            onClick={() => {
                                                setEditMode(false);
                                                setForm({
                                                    username: user.username,
                                                    email: user.email,
                                                    password: "",
                                                    image: user.image,
                                                    imageId: user.imageId
                                                });
                                            }}
                                            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-full font-semibold transition-all duration-300"
                                        >
                                            <FiX size={18} />
                                            <span>Cancel</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        {saveSuccess && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                                <IoCheckmarkCircle className="text-green-600 text-2xl" />
                                <div>
                                    <p className="font-medium text-green-800">Profile updated successfully!</p>
                                    <p className="text-sm text-green-600">Changes saved to your account.</p>
                                </div>
                            </div>
                        )}

                        {/* Profile Information */}
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FiMail className="text-blue-600 text-xl" />
                                    </div>
                                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                </div>
                                {editMode ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="your@email.com"
                                        className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
                                    />
                                ) : (
                                    <p className="text-gray-800 px-4 py-3 bg-gray-50 rounded-lg">
                                        {user.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            {editMode && (
                                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <FiKey className="text-yellow-600 text-xl" />
                                        </div>
                                        <label className="text-sm font-semibold text-gray-700">New Password</label>
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Leave empty to keep current"
                                        className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-200"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Enter new password to change</p>
                                </div>
                            )}

                            {/* Joined Date */}
                            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <FiCalendar className="text-purple-600 text-xl" />
                                    </div>
                                    <label className="text-sm font-semibold text-gray-700">Joined Date</label>
                                </div>
                                <p className="text-gray-800 px-4 py-3 bg-gray-50 rounded-lg">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            {/* Last Active */}
                            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-pink-100 rounded-lg">
                                        <FiClock className="text-pink-600 text-xl" />
                                    </div>
                                    <label className="text-sm font-semibold text-gray-700">Last Active</label>
                                </div>
                                <p className="text-gray-800 px-4 py-3 bg-gray-50 rounded-lg">
                                    {new Date(user.lastActiveAt).toLocaleString('en-US', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                    <p className="text-white/70 text-sm">
                        Member since {new Date(user.createdAt).getFullYear()} • All your data is securely stored
                    </p>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}