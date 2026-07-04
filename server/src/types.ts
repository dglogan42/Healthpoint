export type ProviderCategory =
  | "pharmacy"
  | "gp"
  | "physio"
  | "chiropractor"
  | "dentist"
  | "optometrist"
  | "mental-health"
  | "allied-health"
  | "ngo"
  | "private-health"
  | "acc"
  | "winz"
  | "urgent-care"
  | "after-hours"
  | "community-services";

export type LocatorMode = "healthcare" | "community";

export type CategoryGroup = "clinical" | "community" | "assistance" | "urgent";

export type AvailabilityType = "24h" | "urgent" | "after-hours";

export interface ProviderPhone {
  label: string;
  number: string;
}

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  categoryLabel: string;
  address: string;
  suburb: string;
  city: string;
  phone?: string;
  phones?: ProviderPhone[];
  lat: number;
  lng: number;
  distanceKm?: number;
  services?: string[];
  assistancePrograms?: string[];
  availability?: AvailabilityType[];
  isEssential?: boolean;
  hours?: string;
  communityServiceType?: string;
  communityServiceLabel?: string;
  healthpointUrl: string;
  source: "healthpoint" | "demo";
}

export interface EssentialHelpline {
  id: string;
  name: string;
  number: string;
  description: string;
  category: "emergency" | "mental-health" | "health" | "crisis";
  available: string;
}

export interface SearchParams {
  lat: number;
  lng: number;
  radiusKm: number;
  category?: ProviderCategory;
  query?: string;
  mode?: LocatorMode;
  serviceType?: string;
}

export interface SearchResponse {
  providers: Provider[];
  center: { lat: number; lng: number };
  radiusKm: number;
  source: "healthpoint" | "demo";
  total: number;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}