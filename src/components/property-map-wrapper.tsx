"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default icon
const icon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    background: linear-gradient(135deg, #1d33b8 0%, #2542e0 100%);
    width: 36px;
    height: 36px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

export function PropertyMapWrapper({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl text-slate-500 text-sm">
        Map unavailable
      </div>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={icon}>
        <Popup>
          <strong>{title}</strong>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
