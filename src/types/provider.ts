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

export interface CommunityServiceType {
  id: string;
  label: string;
  icon: string;
  healthpointPath: string;
  keywords: string[];
}

export interface EssentialHelpline {
  id: string;
  name: string;
  number: string;
  description: string;
  category: "emergency" | "mental-health" | "health" | "crisis";
  available: string;
}

export interface CategoryConfig {
  id: ProviderCategory;
  label: string;
  icon: string;
  group: CategoryGroup;
  searchTerms: string[];
  healthpointPath: string;
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

export interface ApiStatus {
  healthpointLive: boolean;
  geocodingAvailable: boolean;
  demoDataCount: number;
}