"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useInView } from "framer-motion";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const hqMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Philippines-wide framing before flying to HQ (Puerto Princesa). */
const OVERVIEW_CENTER: [number, number] = [11.35, 121.8];
const OVERVIEW_ZOOM = 5;
const TARGET_ZOOM = 15;
const FLY_DURATION_SEC = 3.35;

function FlyToHeadquarters({
  lat,
  lon,
  active,
}: {
  lat: number;
  lon: number;
  active: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!active) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const destination = L.latLng(lat, lon);

    if (prefersReduced) {
      map.setView(destination, TARGET_ZOOM, { animate: false });
      return;
    }

    map.setView(OVERVIEW_CENTER, OVERVIEW_ZOOM, { animate: false });

    const timer = window.setTimeout(() => {
      map.flyTo(destination, TARGET_ZOOM, {
        duration: FLY_DURATION_SEC,
        easeLinearity: 0.2,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [active, lat, lon, map]);

  return null;
}

export function AboutHeadquartersMap({ lat, lon }: { lat: number; lon: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapRef, { once: true, margin: "-10% 0px", amount: 0.28 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-0">
      {mounted ? (
        <MapContainer
          center={OVERVIEW_CENTER}
          zoom={OVERVIEW_ZOOM}
          scrollWheelZoom={false}
          className="absolute inset-0 z-0 h-full w-full [&_.leaflet-control-attribution]:max-w-[min(100%,28rem)] [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:leading-snug"
          attributionControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <Marker position={[lat, lon]} icon={hqMarkerIcon} />
          <FlyToHeadquarters lat={lat} lon={lon} active={isInView} />
        </MapContainer>
      ) : null}
    </div>
  );
}
