import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Paper } from "@mui/material";

const LeafletMap = ({
  latitude = 50.74381546925308, 
  longitude = 10.26220878830262, 
  markers,
  width = "100%",
  height = 400,
}) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);

  const getIcon = (status) => {
    const baseSvg = `
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2.16125C7.8 2.16125 4 5.38125 4 10.3612C4 13.5413 6.45 17.2813 11.34 21.5913C11.72 21.9213 12.29 21.9213 12.67 21.5913C17.55 17.2813 20 13.5413 20 10.3612C20 5.38125 16.2 2.16125 12 2.16125ZM12 12.1613C10.9 12.1613 10 11.2613 10 10.1613C10 9.06125 10.9 8.16125 12 8.16125C13.1 8.16125 14 9.06125 14 10.1613C14 11.2613 13.1 12.1613 12 12.1613Z" />
      </svg>
    `;

    const getColor = () => {
      switch (status) {
        case "Active":
          return "blue";
        case "Inactive":
          return "red";
        default:
          return "grey";
      }
    };

    const finalSvg = baseSvg.replace('fill="none"', `fill="${getColor()}"`);

    return L.icon({
      iconUrl: `data:image/svg+xml,${encodeURIComponent(finalSvg)}`,
      iconSize: [20, 32], // size of the icon
    });
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        attributionControl: false,
      }).setView([latitude, longitude], 5);

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {}
      ).addTo(mapRef.current);
    } else if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (mapRef.current) {
      // To Clear existing markers
      markersRef.current.forEach((marker) => {
        if (mapRef.current) {
          mapRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];

      markers.forEach((markerProps) => {
        const marker = L.marker([markerProps.lat, markerProps.lng], {
          icon: getIcon(markerProps.status || "default"),
        });

        if (markerProps.popupData) {
          const popupContent = Object.entries(markerProps.popupData)
            .map(([key, value]) => `<b>${key}:</b> ${value}`)
            .join("<br/>");
          marker.bindPopup(popupContent);
        }

        if (mapRef.current) {
          marker.addTo(mapRef.current);
        }
        markersRef.current.push(marker);
      });
    }
  }, [markers]);

    return (
        <Paper
        ref={mapContainerRef}
        style={{
            height,
            width,
            borderRadius: '10px',
            position: 'relative',
            overflow: 'hidden',
        }}
        elevation={12}
        />
    );
};

export default LeafletMap;