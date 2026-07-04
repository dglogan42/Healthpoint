import type { LocatorMode, Provider } from "../types/provider";
import { ProviderCard } from "./ProviderCard";

interface Props {
  providers: Provider[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  error: string | null;
  locatorMode?: LocatorMode;
}

export function ProviderList({ providers, selectedId, onSelect, loading, error, locatorMode }: Props) {
  if (loading) {
    return (
      <div className="provider-list-empty">
        <div className="spinner" />
        <p>Searching nearby providers…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-list-empty error">
        <p>{error}</p>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="provider-list-empty">
        <p>No {locatorMode === "community" ? "community services" : "providers"} found in this area.</p>
        <p className="hint">
          Try increasing the search radius
          {locatorMode === "community" ? " or selecting a different service type." : " or changing the category."}
        </p>
      </div>
    );
  }

  return (
    <ol className="provider-list" aria-label="Nearby providers">
      {providers.map((p, index) => (
        <li key={p.id}>
          <ProviderCard
            provider={p}
            selected={selectedId === p.id}
            onSelect={() => onSelect(p.id)}
          />
          <span className="sr-only">Result {index + 1} of {providers.length}</span>
        </li>
      ))}
    </ol>
  );
}