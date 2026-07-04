import { useCallback, useEffect, useState } from "react";
import { EssentialHelplines } from "./components/EssentialHelplines";
import { Header } from "./components/Header";
import { LiveAnnouncer } from "./components/LiveAnnouncer";
import { ProviderList } from "./components/ProviderList";
import { ProviderMap } from "./components/ProviderMap";
import { SearchPanel } from "./components/SearchPanel";
import { SkipLink } from "./components/SkipLink";
import { useGeolocation } from "./hooks/useGeolocation";
import {
  geocodeAddress,
  useApiStatus,
  useCategories,
  useProviderSearch,
} from "./hooks/useProviders";
import type { VoiceSearchResult } from "./hooks/useVoiceSearch";
import type { LocatorMode, ProviderCategory } from "./types/provider";

const DEFAULT_CENTER = { lat: -36.8485, lng: 174.7633 };
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

export default function App() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [locationLabel, setLocationLabel] = useState("Auckland CBD");
  const [radiusKm, setRadiusKm] = useState(10);
  const [locatorMode, setLocatorMode] = useState<LocatorMode>("healthcare");
  const [serviceType, setServiceType] = useState<string | undefined>();
  const [category, setCategory] = useState<ProviderCategory | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const { position, loading: locating, locate } = useGeolocation();
  const { data: categoriesData } = useCategories();
  const { data: apiStatus } = useApiStatus();

  const {
    data: searchData,
    isLoading: providersLoading,
    error: providersError,
  } = useProviderSearch(
    center.lat,
    center.lng,
    radiusKm,
    locatorMode === "healthcare" ? category : undefined,
    undefined,
    locatorMode,
    serviceType,
  );

  const handleAddressSearch = useCallback(async (address: string) => {
    setSearching(true);
    setSearchError(null);
    try {
      const result = await geocodeAddress(address);
      setCenter({ lat: result.lat, lng: result.lng });
      setLocationLabel(result.formattedAddress);
      setSelectedId(null);
      setAnnouncement(`Showing results near ${result.formattedAddress}`);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
      setAnnouncement("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }, []);

  const handleVoiceResult = useCallback(
    async (result: VoiceSearchResult) => {
      if (result.mode) setLocatorMode(result.mode);
      if (result.category) setCategory(result.category as ProviderCategory);
      if (result.serviceType) setServiceType(result.serviceType);
      setSelectedId(null);

      const parts: string[] = [`Voice search: ${result.transcript}`];

      if (result.location === "__CURRENT_LOCATION__") {
        parts.push("Using your current location");
        setAnnouncement(parts.join(". "));
        locate();
        return;
      }

      if (result.location) {
        parts.push(`Searching near ${result.location}`);
        setAnnouncement(parts.join(". "));
        await handleAddressSearch(result.location);
        return;
      }

      setAnnouncement(parts.join(". "));
    },
    [handleAddressSearch, locate],
  );

  useEffect(() => {
    if (position) {
      setCenter(position);
      setLocationLabel("Your current location");
      setSelectedId(null);
    }
  }, [position]);

  useEffect(() => {
    if (!providersLoading && searchData) {
      setAnnouncement(
        `${searchData.total} ${locatorMode === "community" ? "community services" : "providers"} found within ${radiusKm} kilometres`,
      );
    }
  }, [searchData?.total, providersLoading, radiusKm, locatorMode]);

  const providers = searchData?.providers ?? [];
  const categories = categoriesData?.categories ?? [];
  const categoryGroups = categoriesData?.groups ?? [];

  return (
    <div className="app">
      <SkipLink />
      <LiveAnnouncer message={announcement} />

      <Header source={searchData?.source ?? null} total={searchData?.total ?? 0} />

      {!apiStatus?.healthpointLive && (
        <div className="demo-banner" role="status">
          Running in demo mode — add <code>HEALTHPOINT_API_KEY</code> to connect live
          Healthpoint data.{" "}
          <a
            href="https://www.healthpointapi.com/get-started"
            target="_blank"
            rel="noopener noreferrer"
          >
            Register for API access
          </a>
        </div>
      )}

      <SearchPanel
        locatorMode={locatorMode}
        onLocatorModeChange={(mode) => {
          setLocatorMode(mode);
          setCategory(undefined);
          setServiceType(undefined);
          setSelectedId(null);
          setAnnouncement(`Switched to ${mode === "community" ? "community services" : "healthcare"} finder`);
        }}
        serviceType={serviceType}
        onServiceTypeChange={(type) => {
          setServiceType(type);
          setSelectedId(null);
        }}
        categories={categories}
        categoryGroups={categoryGroups}
        selectedCategory={category}
        onCategoryChange={(cat) => {
          setCategory(cat);
          setSelectedId(null);
        }}
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        onSearch={handleAddressSearch}
        onLocate={locate}
        onVoiceResult={handleVoiceResult}
        locating={locating}
        searching={searching}
        currentLocation={locationLabel}
      />

      {searchError && (
        <div className="search-error" role="alert" aria-live="assertive">
          {searchError}
        </div>
      )}

      <EssentialHelplines />

      <main id="main-content" className="main-content" tabIndex={-1}>
        <aside className="sidebar" aria-label="Search results list">
          <ProviderList
            providers={providers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={providersLoading}
            error={providersError?.message ?? null}
            locatorMode={locatorMode}
          />
        </aside>
        <section className="map-section" aria-label="Map showing provider locations">
          <ProviderMap
            apiKey={GOOGLE_MAPS_API_KEY}
            center={center}
            providers={providers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            radiusKm={radiusKm}
          />
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Data sourced from{" "}
          <a href="https://www.healthpoint.co.nz/" target="_blank" rel="noopener noreferrer">
            Healthpoint
          </a>{" "}
          and the{" "}
          <a
            href="https://www.familyservices.govt.nz/directory/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Family Services Directory
          </a>
          . Not for clinical decision-making.
        </p>
      </footer>
    </div>
  );
}