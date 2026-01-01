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
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "form-submit");
        formData.append("folder", "user");

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/auto/upload`,
            { method: "POST", body: formData }
        );

        const uploadResult = await response.json();
        setIsUploading(false);

        if (!uploadResult.secure_url) {
            alert("Upload failed");
            return;
        }

        setForm({ ...form, image: uploadResult.secure_url });
    }

    const handleSave = async () => {
        try {
            const res = await fetch('/api/user/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form })
            });
            if (res.ok) {
                alert('Profile updated successfully!');
                setEditMode(false);
            } else {
                alert('Update failed!');
            }
        } catch (err) {
            console.log(err);
            alert('Something went wrong!');
        }
    }

    return (
        <div className="flex justify-center py-12 h-screen" style={{ background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)' }}>
            <div className="bg-white shadow-2xl rounded-3xl w-full max-w-3xl p-8">

                {/* Profile Header */}
                <div className="flex flex-col items-center relative">
                    <div className="relative">
                        <img
                            src={form.image || "/placeholder.png"}
                            alt="Profile"
                            className="rounded-full w-40 h-40 object-cover border-4 border-white shadow-lg"
                        />

                        {/* Camera Icon Overlay */}
                        {editMode && (
                            <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-600 transition">
                                <FiCamera size={20} />
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        )}
                    </div>

                    {isUploading && <p className="mt-2 text-blue-500 text-sm">Uploading...</p>}

                    {/* Username */}
                    <div className="mt-4 text-center">
                        {editMode ? (
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                className="text-3xl font-bold border-b-2 border-gray-300 focus:outline-none text-center py-1"
                            />
                        ) : (
                            <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                        )}
                        <p className={`text-sm mt-1 ${user.online ? "text-green-500" : "text-gray-500"}`}>
                            {user.online ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                        <h2 className="text-gray-700 font-semibold mb-1">Email</h2>
                        {editMode ? (
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border-b-2 border-gray-300 focus:outline-none py-1"
                            />
                        ) : (
                            <p className="text-gray-800">{user.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    {editMode && (
                        <div>
                            <h2 className="text-gray-700 font-semibold mb-1">Password</h2>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="w-full border-b-2 border-gray-300 focus:outline-none py-1"
                            />
                        </div>
                    )}

                    {/* Location */}
                    <div>
                        <h2 className="text-gray-700 font-semibold mb-1">Location</h2>
                        {editMode ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="lat"
                                    value={form.location.lat || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, location: { ...form.location, lat: parseFloat(e.target.value) } })
                                    }
                                    className="w-1/2 border-b-2 border-gray-300 focus:outline-none py-1"
                                />
                                <input
                                    type="number"
                                    name="lng"
                                    value={form.location.lng || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, location: { ...form.location, lng: parseFloat(e.target.value) } })
                                    }
                                    className="w-1/2 border-b-2 border-gray-300 focus:outline-none py-1"
                                />
                            </div>
                        ) : (
                            <p className="text-gray-800">{`Lat: ${user.location?.lat}, Lng: ${user.location?.lng}`}</p>
                        )}
                    </div>

                    {/* Created At */}
                    <div>
                        <h2 className="text-gray-700 font-semibold mb-1">Joined</h2>
                        <p className="text-gray-500">{new Date(user.createdAt).toLocaleString()}</p>
                    </div>

                    {/* Last Active */}
                    <div>
                        <h2 className="text-gray-700 font-semibold mb-1">Last Active</h2>
                        <p className="text-gray-500">{new Date(user.lastActiveAt).toLocaleString()}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-10">
                    {editMode ? (
                        <>
                            <button onClick={handleSave} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">Save</button>
                            <button onClick={() => setEditMode(false)} className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition">Cancel</button>
                        </>
                    ) : (
                        <button onClick={() => setEditMode(true)} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">Edit Profile</button>
                    )}
                </div>
            </div>
        </div>
    )
}
