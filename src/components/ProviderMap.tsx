import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import type { Provider } from "../types/provider";

const CATEGORY_COLORS: Record<string, string> = {
  pharmacy: "#2563eb",
  gp: "#059669",
  physio: "#d97706",
  chiropractor: "#7c3aed",
  dentist: "#0891b2",
  optometrist: "#db2777",
  "mental-health": "#6366f1",
  "allied-health": "#64748b",
  "community-services": "#ea580c",
  ngo: "#f97316",
  "private-health": "#9333ea",
  acc: "#dc2626",
  winz: "#0284c7",
  "urgent-care": "#b91c1c",
  "after-hours": "#4f46e5",
};

interface Props {
  apiKey: string;
  center: { lat: number; lng: number };
  providers: Provider[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  radiusKm: number;
}

function MapController({
  center,
  selectedProvider,
}: {
  center: { lat: number; lng: number };
  selectedProvider: Provider | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedProvider) {
      map.panTo({ lat: selectedProvider.lat, lng: selectedProvider.lng });
      map.setZoom(15);
    } else {
      map.panTo(center);
      map.setZoom(13);
    }
  }, [map, center, selectedProvider]);

  return null;
}

export function ProviderMap({
  apiKey,
  center,
  providers,
  selectedId,
  onSelect,
}: Props) {
  const selectedProvider = providers.find((p) => p.id === selectedId) ?? null;

  if (!apiKey) {
    return (
      <div className="map-placeholder">
        <div className="map-placeholder-content">
          <h3>Google Maps API key required</h3>
          <p>
            Add your key to <code>.env</code> as <code>VITE_GOOGLE_MAPS_API_KEY</code>
          </p>
          <p className="hint">
            Provider list still works — {providers.length} results shown
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={13}
        mapId="healthpoint-finder-map"
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="provider-map"
      >
        <MapController center={center} selectedProvider={selectedProvider} />

        {providers.map((provider) => {
          const color = CATEGORY_COLORS[provider.category] ?? "#64748b";
          const isSelected = provider.id === selectedId;

          return (
            <AdvancedMarker
              key={provider.id}
              position={{ lat: provider.lat, lng: provider.lng }}
              onClick={() => onSelect(provider.id)}
            >
              <Pin
                background={color}
                borderColor={isSelected ? "#fff" : color}
                glyphColor="#fff"
                scale={isSelected ? 1.3 : 1}
              />
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
}