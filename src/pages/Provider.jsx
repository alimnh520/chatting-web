"use client";

import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export default function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                console.log("Notification permission:", permission);
            });
        }
    }, []);


    useEffect(() => {
        fetch("/api/socket");
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/mydata', { method: 'GET' });
                if (res.ok) {
                    const data = await res.json();
                    if (!data.user) {
                        router.replace('/components/login');
                        return;
                    }
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

    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    );
}
