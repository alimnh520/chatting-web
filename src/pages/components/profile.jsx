'use client'

import { useContext, useState } from "react";
import { UserContext } from "../Provider";
import { FiCamera } from "react-icons/fi";

export default function ProfilePage() {
    const { user } = useContext(UserContext);
    const [editMode, setEditMode] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [form, setForm] = useState({
        username: user?.username || "",
        email: user?.email || "",
        password: "",
        image: user?.image || "",
        imageId: user?.imageId || ""
    });
    const deleteId = user?.imageId;


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setForm({ ...form, image: file });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let imageUrl = form.imageId || null;
            let imageId = form.imageId || null;

            if (form.image instanceof File) {
                const formData = new FormData();
                formData.append("file", form.image);
                formData.append("upload_preset", "form-submit");
                formData.append("folder", "user");

                const resCloud = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/auto/upload`,
                    { method: "POST", body: formData }
                );

                const uploadResult = await resCloud.json();

                if (!uploadResult.secure_url) {
                    alert("⚠️ ছবি আপলোড ব্যর্থ! Cloudinary চেক কর।");
                    setIsUploading(false);
                    return;
                }

                imageUrl = uploadResult.secure_url;
                imageId = uploadResult.public_id;
            }

            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?._id,
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    imageUrl,
                    imageId,
                    deleteId
                }),
            });

            const dataRes = await res.json();

            if (res.ok && dataRes.success) {
                alert("✅ প্রোফাইল আপডেট সফল!");
                window.location.reload();
            } else {
                alert("❌ আপডেট ব্যর্থ! " + (dataRes.message || ""));
            }

        } catch (err) {
            console.error("Save error:", err);
            alert("⚠️ কিছু ভুল হয়েছে! কনসোল চেক কর।");
        } finally {
            setIsUploading(false);
        }
    };





    if (!user) return <p className="text-black">Loading....</p>

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 to-emerald-400 px-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8">

                {/* Header */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img
                            src={
                                form.image
                                    ? form.image instanceof File
                                        ? URL.createObjectURL(form.image)
                                        : form.image
                                    : user?.image || "/placeholder.png"
                            }
                            alt="Profile"
                            className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
                        />

                        {editMode && (
                            <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg">
                                <FiCamera size={18} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>


                    {isUploading && (
                        <p className="mt-2 text-sm text-blue-600 font-medium">
                            Uploading image...
                        </p>
                    )}

                    {/* Username */}
                    <div className="mt-4 text-center w-full max-w-sm">
                        {editMode ? (
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Username"
                                className="w-full text-center text-2xl font-semibold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <h1 className="text-3xl font-bold text-gray-900">
                                {user.username}
                            </h1>
                        )}

                        <p className={`text-sm mt-1 ${user.online ? "text-green-500" : "text-gray-400"}`}>
                            {user.online ? "● Online" : "● Offline"}
                        </p>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Email
                        </label>
                        {editMode ? (
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email address"
                                className="w-full bg-gray-100 text-gray-900 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">
                                {user.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    {editMode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="w-full bg-gray-100 text-gray-900 px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Joined */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Joined
                        </label>
                        <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                            {new Date(user.createdAt).toLocaleString()}
                        </p>
                    </div>

                    {/* Last Active */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Last Active
                        </label>
                        <p className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                            {new Date(user.lastActiveAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-4 mt-10">
                    {editMode ? (
                        <>
                            <button
                                onClick={(e) => handleSave(e)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full font-semibold transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-2 rounded-full font-semibold transition"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-2 rounded-full font-semibold transition"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

            </div>
        </div>

    )
}
