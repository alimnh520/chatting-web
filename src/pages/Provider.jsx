"use client";

import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export default function AppProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("/api/socket");
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/mydata', { method: 'GET' });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Provider error:", error);
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                try {
                    await fetch("/api/mydata", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ location: loc }),
                    });
                } catch (error) {
                    console.error("Error sending location:", error);
                }
            },
            (error) => console.error("Geolocation error:", error)
        );
    }, []);

    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    );
}
