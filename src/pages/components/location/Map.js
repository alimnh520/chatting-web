"use client";

import { useEffect, useRef } from "react";

export default function Map({ location }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (!window.google) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.MAP_SECTET}`;
            script.async = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }

        function initMap() {
            if (!mapRef.current) return;

            const map = new window.google.maps.Map(mapRef.current, {
                center: location || { lat: 23.8103, lng: 90.4125 },
                zoom: 12,
            });

            const marker = new window.google.maps.Marker({
                position: location || { lat: 23.8103, lng: 90.4125 },
                map,
                title: "You",
            });

            markerRef.current = marker;

            if (location) {
                map.setCenter(location);
                marker.setPosition(location);
            }
        }
    }, [location]);

    useEffect(() => {
        if (markerRef.current && location) {
            markerRef.current.setPosition(location);
        }
    }, [location]);

    return <div ref={mapRef} style={{ width: "100%", height: "400px" }} />;
}
