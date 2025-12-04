import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
};

const DEFAULT_MAPS_KEY = "AIzaSyCL7MuTJansgIQnFvVMn5eHfGEpk39qHhw";

declare global {
  interface Window {
    google?: any;
  }
}

async function loadGoogleMaps(apiKey?: string) {
  if (window.google?.maps) return window.google;
  if (!apiKey) throw new Error("Missing Google Maps API key");

  const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps="true"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
    });
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
  script.async = true;
  script.defer = true;
  script.setAttribute("loading", "async");
  script.dataset.googleMaps = "true";

  const loadPromise = new Promise((resolve, reject) => {
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Google Maps failed to load"));
  });

  document.head.appendChild(script);
  return loadPromise;
}

export function MapPicker({ open, onClose, onSelect, initialLat = 31.963158, initialLng = 35.930359 }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !mapRef.current) return;

    let mapInstance: any;
    let clickListener: any;
    let marker: any;
    setError(null);
    setLoading(true);

    const setupMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || DEFAULT_MAPS_KEY;
        await loadGoogleMaps(apiKey);
        const googleMaps = window.google?.maps;
        if (!googleMaps) throw new Error("Google Maps unavailable");

        mapInstance = new googleMaps.Map(mapRef.current as HTMLDivElement, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 7,
          disableDefaultUI: true,
          zoomControl: true,
        });

        const AdvancedMarker = googleMaps.marker?.AdvancedMarkerElement;
        marker = AdvancedMarker
          ? new AdvancedMarker({
              position: { lat: initialLat, lng: initialLng },
              map: mapInstance,
            })
          : new googleMaps.Marker({
              position: { lat: initialLat, lng: initialLng },
              map: mapInstance,
              draggable: false,
            });

        clickListener = mapInstance.addListener("click", (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          if (marker?.position) {
            marker.position = { lat, lng };
          } else if (marker?.setPosition) {
            marker.setPosition({ lat, lng });
          }
          onSelect(lat, lng);
          onClose();
        });
      } catch (err: any) {
        setError(err?.message || "Unable to load map right now.");
      } finally {
        setLoading(false);
      }
    };

    setupMap();
    return () => {
      if (clickListener?.remove) clickListener.remove();
      if (clickListener) window.google?.maps?.event?.removeListener(clickListener);
      if (mapInstance && window.google?.maps?.event?.clearInstanceListeners) {
        window.google.maps.event.clearInstanceListeners(mapInstance);
      }
      if (marker?.setMap) marker.setMap(null);
      mapInstance = null;
    };
  }, [open, initialLat, initialLng, onSelect, onClose]);

  if (!open) return null;

  return (
    <div className="map-picker-backdrop" onClick={onClose}>
      <div className="map-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="map-picker-header">
          <div>
            <p className="eyebrow">Drop a pin</p>
            <h3>Select exact agent location</h3>
            <p className="muted">Click on the map to capture latitude & longitude instantly.</p>
          </div>
          <button className="btn ghost small" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        {error ? (
          <div className="card" role="alert">
            <p>{error}</p>
            <p className="muted">Set VITE_GOOGLE_MAPS_KEY in your env then retry.</p>
          </div>
        ) : (
          <div className="map-picker-canvas" ref={mapRef}>
            {loading && <div className="map-picker-loading">Loading Google Maps…</div>}
          </div>
        )}
      </div>
    </div>
  );
}
