import { useQuery } from "@tanstack/react-query";
import type { EssentialHelpline } from "../types/provider";

async function fetchHelplines(): Promise<EssentialHelpline[]> {
  const res = await fetch("/api/providers/helplines");
  if (!res.ok) throw new Error("Failed to load helplines");
  const data = (await res.json()) as { helplines: EssentialHelpline[] };
  return data.helplines;
}

function formatPhoneDisplay(number: string): string {
  if (number === "111" || number === "1737") return number;
  if (number.startsWith("0800") && number.length === 10) {
    return `${number.slice(0, 4)} ${number.slice(4, 7)} ${number.slice(7)}`;
  }
  return number;
}

const CATEGORY_LABELS: Record<EssentialHelpline["category"], string> = {
  emergency: "Emergency",
  "mental-health": "Mental Health",
  health: "Health Advice",
  crisis: "Crisis Support",
};

export function EssentialHelplines() {
  const { data: helplines = [], isLoading } = useQuery({
    queryKey: ["helplines"],
    queryFn: fetchHelplines,
    staleTime: Infinity,
  });

  if (isLoading) return null;

  return (
    <section className="essential-helplines" aria-label="Essential helplines">
      <div className="helplines-header">
        <h2>Essential helplines</h2>
        <p>Free NZ crisis &amp; health support — tap to call</p>
      </div>
      <div className="helplines-scroll">
        {helplines.map((line) => (
          <a
            key={line.id}
            href={`tel:${line.number}`}
            className={`helpline-card helpline-${line.category}`}
          >
            <span className="helpline-category">{CATEGORY_LABELS[line.category]}</span>
            <span className="helpline-name">{line.name}</span>
            <span className="helpline-number">{formatPhoneDisplay(line.number)}</span>
            <span className="helpline-desc">{line.description}</span>
            <span className="helpline-available">{line.available}</span>
          </a>
        ))}
      </div>
    </section>
  );
}