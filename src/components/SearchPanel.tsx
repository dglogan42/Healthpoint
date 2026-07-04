import { useId, useState } from "react";
import type { VoiceSearchResult } from "../hooks/useVoiceSearch";
import type { CategoryConfig, CategoryGroup, LocatorMode, ProviderCategory } from "../types/provider";
import { CategoryFilter } from "./CategoryFilter";
import { CommunityServicesLocator } from "./CommunityServicesLocator";
import { LocatorModeTabs } from "./LocatorModeTabs";
import { VoiceSearchButton } from "./VoiceSearchButton";

interface Props {
  locatorMode: LocatorMode;
  onLocatorModeChange: (mode: LocatorMode) => void;
  serviceType?: string;
  onServiceTypeChange: (type: string | undefined) => void;
  categories: CategoryConfig[];
  categoryGroups: Array<{ id: CategoryGroup; label: string }>;
  selectedCategory?: ProviderCategory;
  onCategoryChange: (cat: ProviderCategory | undefined) => void;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  onSearch: (address: string) => void;
  onLocate: () => void;
  onVoiceResult: (result: VoiceSearchResult) => void;
  locating: boolean;
  searching: boolean;
  currentLocation?: string;
}

export function SearchPanel({
  locatorMode,
  onLocatorModeChange,
  serviceType,
  onServiceTypeChange,
  categories,
  categoryGroups,
  selectedCategory,
  onCategoryChange,
  radiusKm,
  onRadiusChange,
  onSearch,
  onLocate,
  onVoiceResult,
  locating,
  searching,
  currentLocation,
}: Props) {
  const [address, setAddress] = useState("");
  const searchInputId = useId();
  const showHealthcareFilters = locatorMode === "healthcare";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) onSearch(address.trim());
  };

  const handleVoiceResult = (result: VoiceSearchResult) => {
    if (result.location && result.location !== "__CURRENT_LOCATION__") {
      setAddress(result.location);
    }
    onVoiceResult(result);
  };

  return (
    <section className="search-panel" aria-label="Search for healthcare and community services">
      <LocatorModeTabs mode={locatorMode} onModeChange={onLocatorModeChange} />

      <form className="search-form" role="search" onSubmit={handleSubmit}>
        <label htmlFor={searchInputId} className="sr-only">
          {locatorMode === "community"
            ? "Search for community services by suburb or address"
            : "Search for healthcare providers by suburb or address"}
        </label>
        <div className="search-input-group">
          <input
            id={searchInputId}
            type="search"
            className="search-input"
            placeholder={
              locatorMode === "community"
                ? "Enter suburb to find community services nearby"
                : "Enter suburb or address (e.g. Ponsonby, Auckland)"
            }
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="street-address"
            enterKeyHint="search"
          />
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </button>
        </div>

        <VoiceSearchButton onVoiceResult={handleVoiceResult} disabled={searching || locating} />

        <button
          type="button"
          className="btn btn-ghost locate-btn"
          onClick={onLocate}
          disabled={locating}
          aria-label={locating ? "Getting your location" : "Use my current location"}
        >
          {locating ? "Locating…" : "Use my location"}
        </button>
      </form>

      {currentLocation && (
        <p className="current-location" aria-live="polite">
          Showing results near <strong>{currentLocation}</strong>
        </p>
      )}

      <div
        role="tabpanel"
        id={showHealthcareFilters ? "healthcare-filters" : "community-filters"}
        aria-label={showHealthcareFilters ? "Healthcare filters" : "Community service filters"}
      >
        {showHealthcareFilters ? (
          <CategoryFilter
            categories={categories}
            groups={categoryGroups.filter((g) => g.id !== "community")}
            selected={selectedCategory}
            onSelect={onCategoryChange}
          />
        ) : (
          <CommunityServicesLocator
            selectedServiceType={serviceType}
            onServiceTypeChange={onServiceTypeChange}
          />
        )}
      </div>

      <div className="radius-control">
        <label htmlFor="radius-slider">
          Search radius: <strong aria-hidden="true">{radiusKm} km</strong>
          <span className="sr-only">{radiusKm} kilometres</span>
        </label>
        <input
          id="radius-slider"
          type="range"
          min={1}
          max={30}
          value={radiusKm}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          aria-valuemin={1}
          aria-valuemax={30}
          aria-valuenow={radiusKm}
          aria-valuetext={`${radiusKm} kilometres`}
        />
      </div>
    </section>
  );
}