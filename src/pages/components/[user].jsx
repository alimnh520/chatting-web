'use client'

import { useState, useEffect } from 'react'
import { FiCalendar, FiClock, FiMail, FiUser, FiX, FiCamera } from 'react-icons/fi'
import { IoIosCheckmarkCircle, IoIosGlobe } from 'react-icons/io'
import { MdDateRange } from 'react-icons/md'
import { FaRegUserCircle } from 'react-icons/fa'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'

// লোডিং কম্পোনেন্ট
function ProfileLoadingSkeleton() {
    const [dots, setDots] = useState('')

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.')
        }, 500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
            {/* Animated Logo */}
            <div className="relative mb-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-4 border-purple-500 border-t-transparent"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <FaRegUserCircle className="text-3xl text-purple-400" />
                </div>
            </div>

            {/* Loading Text */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                    Loading Profile{dots}
                </h2>
                <p className="text-purple-300 text-sm">
                    Fetching user information
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mb-8">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                </div>
            </div>

            {/* Skeleton Profile Card */}
            <div className="w-full max-w-sm bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                {/* Skeleton Header */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                    </div>

                    <div className="w-3/4 h-6 bg-white/10 rounded-lg animate-pulse mb-2" />
                    <div className="w-1/2 h-4 bg-white/10 rounded-lg animate-pulse" />
                </div>

                {/* Skeleton Stats */}
                <div className="grid grid-cols-2 gap-3 my-6">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
                                <div className="flex-1">
                                    <div className="w-3/4 h-3 bg-white/10 rounded animate-pulse mb-1" />
                                    <div className="w-1/2 h-4 bg-white/10 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skeleton Info Cards */}
                <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
                                <div className="w-20 h-3 bg-white/10 rounded animate-pulse" />
                            </div>
                            <div className="w-full h-8 bg-white/10 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading Tips */}
            <div className="mt-8 text-center">
                <p className="text-white/50 text-xs mb-2">Tip</p>
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block px-4 py-2 bg-white/5 rounded-lg"
                >
                    <p className="text-white/70 text-sm">
                        Profiles with images load faster
                    </p>
                </motion.div>
            </div>

            {/* Background Bubbles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5"
                        style={{
                            width: Math.random() * 80 + 40,
                            height: Math.random() * 80 + 40,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                        }}
                        transition={{
                            duration: Math.random() * 4 + 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

// মেইন কম্পোনেন্ট
export default function PublicProfilePage() {
    const params = useParams();
    const userId = params?.user;
    const [showFullImage, setShowFullImage] = useState(false)
    const [timeAgo, setTimeAgo] = useState('')
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchAllUsers = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/message/users');
                const data = await res.json();
                const findUser = data.users.find(u => u._id === userId);

                // Simulate loading for better UX
                setTimeout(() => {
                    setUser(findUser);
                    setLoading(false);
                }, 1500);

            } catch (error) {
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        }
        fetchAllUsers();
    }, [userId]);

    useEffect(() => {
        if (!user?.lastActiveAt) return;

        const calculateTimeAgo = () => {
            const lastActive = new Date(user.lastActiveAt)
            const now = new Date()
            const diffMs = now - lastActive
            const diffMins = Math.floor(diffMs / (1000 * 60))
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

            if (diffMins < 1) {
                return 'Just now'
            } else if (diffMins < 60) {
                return `${diffMins}m ago`
            } else if (diffHours < 24) {
                return `${diffHours}h ago`
            } else {
                return `${diffDays}d ago`
            }
        }

        setTimeAgo(calculateTimeAgo())
        const interval = setInterval(() => {
            setTimeAgo(calculateTimeAgo())
        }, 60000)

        return () => clearInterval(interval)
    }, [user?.lastActiveAt])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getMemberDuration = () => {
        if (!user?.createdAt) return '0d'

        const joinDate = new Date(user.createdAt)
        const now = new Date()
        const diffMs = now - joinDate
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays < 30) {
            return `${diffDays}d`
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30)
            return `${months}m`
        } else {
            const years = Math.floor(diffDays / 365)
            return `${years}y`
        }
    }

    // Show loading skeleton
    if (loading) {
        return <ProfileLoadingSkeleton />
    }

    // Show error state if user not found
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <FiUser className="text-red-400 text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
                    <p className="text-white/70 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition"
                    >
                        Go Back
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <>
            {/* Full Screen Image Modal */}
            {showFullImage && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
                    <button
                        onClick={() => setShowFullImage(false)}
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition"
                    >
                        <FiX size={24} />
                    </button>

                    <div className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center">
                        <img
                            src={user.image}
                            alt="Profile preview"
                            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                        />
                        <p className="text-white/70 text-sm mt-4 text-center">
                            Click outside or press X to close
                        </p>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
                {/* Back Button - Mobile Optimized */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4"
                >
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                </motion.div>

                {/* Main Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20"
                >
                    {/* Mobile Optimized Header */}
                    <div className="relative">
                        {/* Cover Image */}
                        <div className="h-32 bg-gradient-to-r from-purple-600/30 to-pink-600/30 relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>

                        {/* Profile Image & Basic Info - Mobile Layout */}
                        <div className="px-4 pb-6 pt-2">
                            <div className="flex flex-col items-center -mt-12">
                                {/* Clickable Profile Image */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.4 }}
                                    className="relative group"
                                >
                                    <div
                                        onClick={() => setShowFullImage(true)}
                                        className="relative w-28 h-28 rounded-full border-4 border-white/80 shadow-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
                                    >
                                        <img
                                            src={user.image}
                                            alt={user.username}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Click hint overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-full p-2">
                                                <FiCamera className="text-white" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Online Status */}
                                    <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 ${user.online ? 'border-green-400 bg-green-500' : 'border-gray-300 bg-gray-400'} shadow-lg`}>
                                        {user.online && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white m-auto mt-1"></div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* User Info - Mobile Optimized */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-center mt-4 w-full"
                                >
                                    <h1 className="text-2xl font-bold text-white mb-1 px-4 break-words">
                                        {user.username}
                                    </h1>
                                    <div className="flex flex-col items-center gap-2 text-white/80">
                                        <span className="flex items-center gap-1 text-sm">
                                            <FiMail className="text-xs" />
                                            <span className="text-xs truncate max-w-[200px]">{user.email}</span>
                                        </span>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="flex items-center gap-1">
                                                <FiClock className="text-xs" />
                                                <span className="text-xs">Active {timeAgo}</span>
                                            </span>
                                            <span className={`flex items-center gap-1 ${user.online ? 'text-green-400' : 'text-gray-400'}`}>
                                                <IoIosCheckmarkCircle className="text-xs" />
                                                <span className="text-xs">{user.online ? 'Online' : 'Offline'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content - Mobile Optimized */}
                    <div className="px-4 pb-6">
                        {/* Stats Cards - Mobile Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-2 gap-3 mb-6"
                        >
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-purple-500/20 rounded-lg">
                                        <FiCalendar className="text-purple-300 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/60">Member</p>
                                        <p className="text-lg font-bold text-white">{getMemberDuration()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                        <MdDateRange className="text-blue-300 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/60">Joined</p>
                                        <p className="text-lg font-bold text-white">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-pink-500/20 rounded-lg">
                                        <FiCamera className="text-pink-300 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/60">Image</p>
                                        <p className="text-lg font-bold text-white">1</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-green-500/20 rounded-lg">
                                        <IoIosGlobe className="text-green-300 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/60">Status</p>
                                        <p className={`text-lg font-bold ${user.online ? 'text-green-400' : 'text-gray-400'}`}>
                                            {user.online ? 'On' : 'Off'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* User Details Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-4"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <FaRegUserCircle className="text-purple-400" />
                                Profile Info
                            </h2>

                            <div className="space-y-4">
                                {/* Username */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <FiUser className="text-xs" />
                                        <span className="text-xs font-medium">Username</span>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/5">
                                        <p className="text-base font-medium text-white break-words">{user.username}</p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <FiMail className="text-xs" />
                                        <span className="text-xs font-medium">Email</span>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/5">
                                        <p className="text-base font-medium text-white break-all">{user.email}</p>
                                    </div>
                                </div>

                                {/* Account Created */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <FiCalendar className="text-xs" />
                                        <span className="text-xs font-medium">Created</span>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/5">
                                        <p className="text-white text-sm">{formatDate(user.createdAt)}</p>
                                        <p className="text-xs text-white/60 mt-1">
                                            {getMemberDuration()} on platform
                                        </p>
                                    </div>
                                </div>

                                {/* Last Active */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <FiClock className="text-xs" />
                                        <span className="text-xs font-medium">Last Active</span>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/5">
                                        <p className="text-white text-sm">{formatDate(user.lastActiveAt)}</p>
                                        <p className="text-xs text-white/60 mt-1">
                                            {timeAgo}
                                        </p>
                                    </div>
                                </div>

                                {/* User ID - Mobile Optimized */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                        <span className="text-xs font-medium">User ID</span>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/5">
                                        <p className="text-white font-mono text-xs break-all">{user._id}</p>
                                        <p className="text-xs text-white/60 mt-1">Unique identifier</p>
                                    </div>
                                </div>

                                {/* Profile Picture Info with Click Hint */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <FiCamera className="text-xs" />
                                        <span className="text-xs font-medium">Profile Image</span>
                                    </div>
                                    <div
                                        onClick={() => setShowFullImage(true)}
                                        className="bg-white/10 rounded-lg p-3 border border-white/5 active:bg-white/15 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20">
                                                <img
                                                    src={user.image}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-white text-sm">Click to view full size</p>
                                                    <FiCamera className="text-white/50 text-sm" />
                                                </div>
                                                <p className="text-xs text-white/60 break-all mt-1 line-clamp-1">
                                                    {user.imageId}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Account Timeline - Mobile Optimized */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">Account Timeline</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Account Created</p>
                                        <p className="text-white/60 text-xs">{formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Last Updated</p>
                                        <p className="text-white/60 text-xs">{formatDate(user.updatedAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Last Active</p>
                                        <p className="text-white/60 text-xs">{formatDate(user.lastActiveAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Footer - Mobile Optimized */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="mt-6 pt-4 border-t border-white/10"
                        >
                            <p className="text-white/50 text-xs text-center">
                                This is a public profile view. Tap on profile image to view full size.
                            </p>
                            <p className="text-white/30 text-xs mt-2 text-center">
                                User ID: {user._id.slice(0, 8)}... • {getMemberDuration()} on platform
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Tap to View Image Hint for Mobile */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4 p-3 bg-purple-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiCamera className="text-purple-300" />
                            <p className="text-white text-sm">Tap on profile image to view full size</p>
                        </div>
                        <div className="w-6 h-6 rounded-full border border-purple-300 flex items-center justify-center">
                            <span className="text-purple-300 text-xs">👆</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    )
}