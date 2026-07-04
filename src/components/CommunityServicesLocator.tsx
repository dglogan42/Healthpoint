import { useQuery } from "@tanstack/react-query";
import type { CommunityServiceType } from "../types/provider";

interface Props {
  selectedServiceType?: string;
  onServiceTypeChange: (type: string | undefined) => void;
}

async function fetchServiceTypes(): Promise<CommunityServiceType[]> {
  const res = await fetch("/api/providers/community-service-types");
  if (!res.ok) throw new Error("Failed to load service types");
  const data = (await res.json()) as { serviceTypes: CommunityServiceType[] };
  return data.serviceTypes;
}

export function CommunityServicesLocator({
  selectedServiceType,
  onServiceTypeChange,
}: Props) {
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["community-service-types"],
    queryFn: fetchServiceTypes,
    staleTime: Infinity,
  });

  return (
    <section className="community-locator" aria-label="Community services locator">
      <div className="community-locator-header">
        <div>
          <h2>Community Services Locator</h2>
          <p>
            Find social and community support near you — food, housing, disability, family
            services and more
          </p>
        </div>
        <div className="community-locator-links">
          <a
            href="https://www.healthpoint.co.nz/community-health-and-social-services/"
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            Healthpoint ↗
          </a>
          <a
            href="https://www.familyservices.govt.nz/directory/"
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            Family Services Directory ↗
          </a>
        </div>
      </div>

      <div className="service-type-filter">
        <button
          type="button"
          className={`service-type-chip ${!selectedServiceType ? "active" : ""}`}
          aria-pressed={!selectedServiceType}
          onClick={() => onServiceTypeChange(undefined)}
        >
          All community services
        </button>
        {serviceTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`service-type-chip ${selectedServiceType === type.id ? "active" : ""}`}
            aria-pressed={selectedServiceType === type.id}
            aria-label={`Filter by ${type.label}`}
            onClick={() =>
              onServiceTypeChange(selectedServiceType === type.id ? undefined : type.id)
            }
          >
            <span className="chip-icon" aria-hidden="true">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>
    </section>
  );
}