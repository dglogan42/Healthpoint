import type { AvailabilityType, Provider, ProviderPhone } from "../types/provider";

interface Props {
  provider: Provider;
  selected: boolean;
  onSelect: () => void;
}

const AVAILABILITY_LABELS: Record<AvailabilityType, { label: string; className: string }> = {
  "24h": { label: "24 Hours", className: "avail-24h" },
  urgent: { label: "Urgent Care", className: "avail-urgent" },
  "after-hours": { label: "After Hours", className: "avail-after-hours" },
};

function googleMapsDirectionsUrl(provider: Provider): string {
  const dest = encodeURIComponent(
    `${provider.address}, ${provider.suburb}, ${provider.city}, New Zealand`,
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

function formatPhoneDisplay(number: string): string {
  if (number === "111" || number === "1737") return number;
  if (number.startsWith("0800") && number.length === 10) {
    return `${number.slice(0, 4)} ${number.slice(4, 7)} ${number.slice(7)}`;
  }
  return number;
}

function getPhoneList(provider: Provider): ProviderPhone[] {
  if (provider.phones && provider.phones.length > 0) return provider.phones;
  if (provider.phone) return [{ label: "Phone", number: provider.phone }];
  return [];
}

export function ProviderCard({ provider, selected, onSelect }: Props) {
  const phones = getPhoneList(provider);
  const primaryPhone = phones[0];
  const extraPhones = phones.slice(1);
  const showProminentPhone =
    provider.isEssential || (provider.availability && provider.availability.length > 0);

  return (
    <article
      className={`provider-card ${selected ? "selected" : ""} ${provider.isEssential ? "essential" : ""}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-selected={selected}
      aria-label={`${provider.name}, ${provider.categoryLabel}${provider.distanceKm != null ? `, ${provider.distanceKm.toFixed(1)} kilometres away` : ""}`}
    >
      <div className="provider-card-header">
        <div className="provider-badges">
          <span className="provider-category-badge">{provider.categoryLabel}</span>
          {provider.communityServiceLabel && (
            <span className="community-service-badge">{provider.communityServiceLabel}</span>
          )}
          {provider.isEssential && <span className="essential-badge">Essential</span>}
          {provider.availability?.map((avail) => (
            <span
              key={avail}
              className={`availability-badge ${AVAILABILITY_LABELS[avail].className}`}
            >
              {AVAILABILITY_LABELS[avail].label}
            </span>
          ))}
        </div>
        {provider.distanceKm != null && (
          <span className="provider-distance">{provider.distanceKm.toFixed(1)} km</span>
        )}
      </div>

      <h3 className="provider-name">{provider.name}</h3>
      <p className="provider-address">
        {provider.address}
        {provider.suburb ? `, ${provider.suburb}` : ""}
        {provider.city ? `, ${provider.city}` : ""}
      </p>

      {showProminentPhone && primaryPhone && (
        <div className="provider-phone-prominent">
          <a
            href={`tel:${primaryPhone.number.replace(/\s/g, "")}`}
            className="call-now-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="call-icon">📞</span>
            <span className="call-number">{formatPhoneDisplay(primaryPhone.number)}</span>
            <span className="call-label">{primaryPhone.label}</span>
          </a>
        </div>
      )}

      {(extraPhones.length > 0 || (!showProminentPhone && phones.length > 0)) && (
        <div className="provider-phones">
          {(showProminentPhone ? extraPhones : phones).map((ph) => (
            <a
              key={`${ph.label}-${ph.number}`}
              href={`tel:${ph.number.replace(/\s/g, "")}`}
              className="phone-line"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="phone-label">{ph.label}</span>
              <span className="phone-number">{formatPhoneDisplay(ph.number)}</span>
            </a>
          ))}
        </div>
      )}

      {provider.hours && <p className="provider-hours">{provider.hours}</p>}

      {provider.services && provider.services.length > 0 && (
        <div className="provider-services">
          {provider.services.slice(0, 3).map((s) => (
            <span key={s} className="service-tag">
              {s}
            </span>
          ))}
        </div>
      )}

      {provider.assistancePrograms && provider.assistancePrograms.length > 0 && (
        <div className="provider-assistance">
          {provider.assistancePrograms.slice(0, 4).map((program) => (
            <span key={program} className="assistance-tag">
              {program}
            </span>
          ))}
        </div>
      )}

      <div className="provider-actions">
        <a
          href={provider.healthpointUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          onClick={(e) => e.stopPropagation()}
        >
          View on Healthpoint
        </a>
        <a
          href={googleMapsDirectionsUrl(provider)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
          onClick={(e) => e.stopPropagation()}
        >
          Directions
        </a>
      </div>
    </article>
  );
}