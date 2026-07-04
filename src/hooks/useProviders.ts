import { useQuery } from "@tanstack/react-query";
import type {
  ApiStatus,
  CategoryConfig,
  CategoryGroup,
  GeocodeResult,
  LocatorMode,
  ProviderCategory,
  SearchResponse,
} from "../types/provider";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      fetchJson<{ categories: CategoryConfig[]; groups: Array<{ id: CategoryGroup; label: string }> }>(
        "/api/providers/categories",
      ),
    staleTime: Infinity,
  });
}

export function useApiStatus() {
  return useQuery({
    queryKey: ["api-status"],
    queryFn: () => fetchJson<ApiStatus>("/api/providers/status"),
    staleTime: 60_000,
  });
}

export function useProviderSearch(
  lat: number | null,
  lng: number | null,
  radiusKm: number,
  category?: ProviderCategory,
  query?: string,
  mode?: LocatorMode,
  serviceType?: string,
) {
  const params = new URLSearchParams();
  if (lat != null) params.set("lat", String(lat));
  if (lng != null) params.set("lng", String(lng));
  params.set("radius", String(radiusKm));
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  if (mode) params.set("mode", mode);
  if (serviceType) params.set("serviceType", serviceType);

  return useQuery({
    queryKey: ["providers", lat, lng, radiusKm, category, query, mode, serviceType],
    queryFn: () => fetchJson<SearchResponse>(`/api/providers/search?${params}`),
    enabled: lat != null && lng != null,
  });
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const params = new URLSearchParams({ address });
  return fetchJson<GeocodeResult>(`/api/providers/geocode?${params}`);
}