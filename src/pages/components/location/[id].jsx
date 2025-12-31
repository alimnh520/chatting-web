'use client'
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Map from "./Map";

export default function LocationPage() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const res = await fetch(`/api/message/location`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id })
                });
                if (res.ok) {
                    const data = await res.json();
                    setLocation(data.location);
                } else {
                    setLocation(null);
                }
            } catch (error) {
                console.error("Failed to fetch location:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchLocation();
        }
    }, [id]);

    console.log("Fetched location:", location);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-medium">Loading location...</p>
            </div>
        )
    }

    if (!location) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-medium">Location not found 😢</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-96 flex items-center justify-center">
                <Map location={location} />
            </div>
        </div>
    )
}
