import type { LocatorMode } from "../types/provider";

interface Props {
  mode: LocatorMode;
  onModeChange: (mode: LocatorMode) => void;
}

export function LocatorModeTabs({ mode, onModeChange }: Props) {
  return (
    <div className="locator-mode-tabs" role="tablist" aria-label="Locator mode">
      <button
        type="button"
        role="tab"
        id="tab-healthcare"
        aria-selected={mode === "healthcare"}
        aria-controls="healthcare-filters"
        className={`mode-tab ${mode === "healthcare" ? "active" : ""}`}
        onClick={() => onModeChange("healthcare")}
      >
        Healthcare Finder
      </button>
      <button
        type="button"
        role="tab"
        id="tab-community"
        aria-selected={mode === "community"}
        aria-controls="community-filters"
        className={`mode-tab ${mode === "community" ? "active" : ""}`}
        onClick={() => onModeChange("community")}
      >
        Community Services
      </button>
    </div>
  );
}