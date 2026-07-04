import { CATEGORIES, CATEGORY_GROUPS, getCategoryConfig } from "../data/categories.js";
import { DEMO_PROVIDERS } from "../data/demoProviders.js";
import { searchDemoProviders } from "../data/demoProviders.js";
import type {
  GeocodeResult,
  Provider,
  ProviderCategory,
  SearchParams,
  SearchResponse,
} from "../types.js";

const HEALTHPOINT_BASE_URL =
  process.env.HEALTHPOINT_BASE_URL ?? "https://uat.healthpointapi.com/baseR4/";
const HEALTHPOINT_API_KEY = process.env.HEALTHPOINT_API_KEY ?? "";
const GOOGLE_GEOCODING_API_KEY =
  process.env.GOOGLE_GEOCODING_API_KEY ??
  process.env.VITE_GOOGLE_MAPS_API_KEY ??
  "";

interface FhirBundle {
  resourceType: string;
  entry?: Array<{ resource: FhirResource }>;
  total?: number;
}

interface FhirResource {
  resourceType: string;
  id?: string;
  name?: string;
  telecom?: Array<{ system?: string; value?: string; use?: string }>;
  address?: Array<{
    line?: string[];
    city?: string;
    district?: string;
    postalCode?: string;
  }>;
  position?: { latitude?: number; longitude?: number };
  type?: Array<{ coding?: Array<{ code?: string; display?: string }> }>;
  category?: Array<{ coding?: Array<{ code?: string; display?: string }> }>;
  specialty?: Array<{ coding?: Array<{ code?: string; display?: string }> }>;
  extension?: Array<{ url?: string; valueString?: string }>;
  location?: Array<{ reference?: string }>;
}

function isLiveMode(): boolean {
  return Boolean(HEALTHPOINT_API_KEY);
}

function inferCategory(resource: FhirResource): ProviderCategory {
  const text = [
    ...(resource.type?.flatMap((t) => t.coding?.map((c) => c.display ?? c.code) ?? []) ?? []),
    ...(resource.category?.flatMap((c) => c.coding?.map((x) => x.display ?? x.code) ?? []) ?? []),
    ...(resource.specialty?.flatMap((s) => s.coding?.map((x) => x.display ?? x.code) ?? []) ?? []),
    resource.name ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (
    text.includes("after hours") ||
    text.includes("after-hours") ||
    text.includes("evening clinic")
  )
    return "after-hours";
  if (
    text.includes("urgent") ||
    text.includes("emergency department") ||
    text.includes("accident") ||
    text.includes("24 hour") ||
    text.includes("24h")
  )
    return "urgent-care";
  if (text.includes("work and income") || text.includes("winz") || text.includes("msd"))
    return "winz";
  if (text.includes("acc") || text.includes("accident compensation") || text.includes("injury cover"))
    return "acc";
  if (text.includes("private hospital") || text.includes("private specialist")) return "private-health";
  if (
    text.includes("community health") ||
    text.includes("social service") ||
    text.includes("community service")
  )
    return "community-services";
  if (text.includes("ngo") || text.includes("charity")) return "ngo";
  if (text.includes("pharm") || text.includes("chemist")) return "pharmacy";
  if (text.includes("physio")) return "physio";
  if (text.includes("chiropr")) return "chiropractor";
  if (text.includes("dent")) return "dentist";
  if (text.includes("optom") || text.includes("eye")) return "optometrist";
  if (text.includes("mental") || text.includes("counsel")) return "mental-health";
  if (text.includes("gp") || text.includes("general practice") || text.includes("doctor"))
    return "gp";
  return "allied-health";
}

function mapFhirToProvider(resource: FhirResource): Provider | null {
  const lat = resource.position?.latitude;
  const lng = resource.position?.longitude;
  if (lat == null || lng == null) return null;

  const category = inferCategory(resource);
  const categoryConfig = getCategoryConfig(category);
  const address = resource.address?.[0];
  const phone = resource.telecom?.find((t) => t.system === "phone")?.value;

  const id = resource.id ?? `hp-${lat}-${lng}`;
  const suburb = address?.district ?? "";
  const city = address?.city ?? "";

  return {
    id,
    name: resource.name ?? "Healthcare Provider",
    category,
    categoryLabel: categoryConfig.label,
    address: address?.line?.join(", ") ?? "",
    suburb,
    city,
    phone,
    lat,
    lng,
    healthpointUrl: `https://www.healthpoint.co.nz/healthcare-service/${id}/`,
    source: "healthpoint",
  };
}

async function fetchFhirBundle(path: string): Promise<FhirBundle | null> {
  const url = new URL(path, HEALTHPOINT_BASE_URL);
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/fhir+json",
      "x-api-key": HEALTHPOINT_API_KEY,
    },
  });

  if (!response.ok) {
    console.warn(`Healthpoint API error ${response.status}: ${url.pathname}`);
    return null;
  }

  return (await response.json()) as FhirBundle;
}

async function searchHealthpointLive(params: SearchParams): Promise<Provider[]> {
  const { lat, lng, radiusKm, category, query } = params;
  const searchParams = new URLSearchParams();
  searchParams.set("_count", "50");

  if (query) {
    searchParams.set("name:contains", query);
  }

  const categoryConfig = category ? getCategoryConfig(category) : null;
  if (categoryConfig?.snomedCodes?.[0]) {
    searchParams.set("service-type", categoryConfig.snomedCodes[0]);
  } else if (categoryConfig) {
    searchParams.set("name:contains", categoryConfig.searchTerms[0]);
  }

  searchParams.set("near", `${lat}|${lng}|${radiusKm}|km`);

  const bundle = await fetchFhirBundle(`HealthcareService?${searchParams.toString()}`);
  if (!bundle?.entry) return [];

  const providers: Provider[] = [];
  for (const entry of bundle.entry) {
    const mapped = mapFhirToProvider(entry.resource);
    if (mapped) {
      if (!category || mapped.category === category) {
        providers.push(mapped);
      }
    }
  }

  return providers;
}

export async function searchProviders(params: SearchParams): Promise<SearchResponse> {
  const { lat, lng, radiusKm, category, query, mode, serviceType } = params;

  let providers: Provider[];
  let source: "healthpoint" | "demo";

  const demoSearch = () =>
    searchDemoProviders(lat, lng, radiusKm, category, query, mode, serviceType);

  if (isLiveMode()) {
    try {
      providers = await searchHealthpointLive(params);
      source = "healthpoint";
      if (providers.length === 0) {
        providers = demoSearch();
        source = "demo";
      }
    } catch (err) {
      console.warn("Healthpoint API failed, falling back to demo data:", err);
      providers = demoSearch();
      source = "demo";
    }
  } else {
    providers = demoSearch();
    source = "demo";
  }

  if (mode === "community" || serviceType) {
    providers = providers.filter((p) =>
      serviceType
        ? p.communityServiceType === serviceType ||
          (p.category === "community-services" || p.category === "ngo")
        : p.category === "community-services" || p.category === "ngo",
    );
  }

  return {
    providers,
    center: { lat, lng },
    radiusKm,
    source,
    total: providers.length,
  };
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!GOOGLE_GEOCODING_API_KEY) {
    const fallback = NZ_LOCATIONS[address.toLowerCase().trim()];
    return fallback ?? null;
  }

  const params = new URLSearchParams({
    address: `${address}, New Zealand`,
    key: GOOGLE_GEOCODING_API_KEY,
    region: "nz",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
  );
  const data = (await response.json()) as {
    status: string;
    results: Array<{
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
    }>;
  };

  if (data.status !== "OK" || !data.results[0]) return null;

  const result = data.results[0];
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  };
}

const NZ_LOCATIONS: Record<string, GeocodeResult> = {
  auckland: {
    lat: -36.8485,
    lng: 174.7633,
    formattedAddress: "Auckland CBD, Auckland, New Zealand",
  },
  wellington: {
    lat: -41.2865,
    lng: 174.7762,
    formattedAddress: "Wellington CBD, Wellington, New Zealand",
  },
  christchurch: {
    lat: -43.5321,
    lng: 172.6362,
    formattedAddress: "Christchurch Central, Christchurch, New Zealand",
  },
  hamilton: {
    lat: -37.787,
    lng: 175.2793,
    formattedAddress: "Hamilton Central, Hamilton, New Zealand",
  },
  dunedin: {
    lat: -45.8742,
    lng: 170.5036,
    formattedAddress: "Dunedin Central, Dunedin, New Zealand",
  },
  tauranga: {
    lat: -37.6878,
    lng: 176.1651,
    formattedAddress: "Tauranga, Bay of Plenty, New Zealand",
  },
  "queen street": {
    lat: -36.8485,
    lng: 174.7633,
    formattedAddress: "Queen Street, Auckland CBD, New Zealand",
  },
  ponsonby: {
    lat: -36.8552,
    lng: 174.7441,
    formattedAddress: "Ponsonby, Auckland, New Zealand",
  },
};

export function getCategories() {
  return { categories: CATEGORIES, groups: CATEGORY_GROUPS };
}

export function getApiStatus() {
  return {
    healthpointLive: isLiveMode(),
    geocodingAvailable: Boolean(GOOGLE_GEOCODING_API_KEY),
    demoDataCount: DEMO_PROVIDERS.length,
  };
}