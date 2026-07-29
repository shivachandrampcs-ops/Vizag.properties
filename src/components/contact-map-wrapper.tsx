"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const icon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    background: linear-gradient(135deg, #1d33b8 0%, #2542e0 100%);
    width: 40px;
    height: 40px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 4px solid white;
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  ">
    <div style="
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      transform: rotate(45deg);
      margin: 10px auto 0;
    "></div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export function ContactMapWrapper() {
  // Visakhapatnam center
  return (
    <MapContainer
      center={[17.6868, 83.2185]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[17.6868, 83.2185]} icon={icon}>
        <Popup>
          <strong>Vizag Properties</strong>
          <br />
          Visakhapatnam, Andhra Pradesh
        </Popup>
      </Marker>
    </MapContainer>
  );
}
