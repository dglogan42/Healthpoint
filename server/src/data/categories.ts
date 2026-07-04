import type { CategoryGroup, ProviderCategory } from "../types.js";

export interface CategoryConfig {
  id: ProviderCategory;
  label: string;
  icon: string;
  group: CategoryGroup;
  searchTerms: string[];
  snomedCodes?: string[];
  healthpointPath: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "pharmacy",
    label: "Chemist / Pharmacy",
    icon: "💊",
    group: "clinical",
    searchTerms: ["pharmacy", "chemist"],
    snomedCodes: ["394607009"],
    healthpointPath: "/pharmacy/",
  },
  {
    id: "gp",
    label: "Doctor / GP",
    icon: "🩺",
    group: "clinical",
    searchTerms: ["general practice", "gp", "doctor"],
    snomedCodes: ["394802001"],
    healthpointPath: "/gps-accident-urgent-medical-care/",
  },
  {
    id: "physio",
    label: "Physiotherapist",
    icon: "🏃",
    group: "clinical",
    searchTerms: ["physiotherapy", "physio"],
    snomedCodes: ["722138006"],
    healthpointPath: "/allied-health/",
  },
  {
    id: "chiropractor",
    label: "Chiropractor",
    icon: "🦴",
    group: "clinical",
    searchTerms: ["chiropractic", "chiropractor"],
    snomedCodes: ["722162001"],
    healthpointPath: "/allied-health/",
  },
  {
    id: "dentist",
    label: "Dentist",
    icon: "🦷",
    group: "clinical",
    searchTerms: ["dentistry", "dental"],
    snomedCodes: ["394603008"],
    healthpointPath: "/dentistry/",
  },
  {
    id: "optometrist",
    label: "Optometrist / Eye Care",
    icon: "👁️",
    group: "clinical",
    searchTerms: ["optometry", "eye care"],
    snomedCodes: ["394594003"],
    healthpointPath: "/eye-care/",
  },
  {
    id: "mental-health",
    label: "Mental Health",
    icon: "🧠",
    group: "clinical",
    searchTerms: ["mental health", "counselling"],
    healthpointPath: "/mental-health-addictions/",
  },
  {
    id: "allied-health",
    label: "Allied Health",
    icon: "⚕️",
    group: "clinical",
    searchTerms: ["allied health"],
    healthpointPath: "/allied-health/",
  },
  {
    id: "community-services",
    label: "Community Services",
    icon: "🤝",
    group: "community",
    searchTerms: ["community health", "social services", "community services"],
    healthpointPath: "/community-health-and-social-services/",
  },
  {
    id: "ngo",
    label: "NGO / Charity",
    icon: "❤️",
    group: "community",
    searchTerms: ["ngo", "charity", "non-profit"],
    healthpointPath: "/community-health-and-social-services/",
  },
  {
    id: "private-health",
    label: "Private Healthcare",
    icon: "🏨",
    group: "community",
    searchTerms: ["private hospital", "specialist", "private healthcare"],
    healthpointPath: "/private/",
  },
  {
    id: "acc",
    label: "ACC Healthcare",
    icon: "🛡️",
    group: "assistance",
    searchTerms: ["acc", "accident compensation", "injury cover", "acc provider"],
    healthpointPath: "/gps-accident-urgent-medical-care/",
  },
  {
    id: "winz",
    label: "WINZ / MSD Assistance",
    icon: "📋",
    group: "assistance",
    searchTerms: [
      "work and income",
      "winz",
      "msd",
      "ministry of social development",
      "community services card",
    ],
    healthpointPath: "/useful-information/government-organisations/",
  },
  {
    id: "urgent-care",
    label: "24h / Urgent Care",
    icon: "🚨",
    group: "urgent",
    searchTerms: ["urgent care", "accident", "emergency department", "24 hour", "24h"],
    healthpointPath: "/gps-accident-urgent-medical-care/",
  },
  {
    id: "after-hours",
    label: "After Hours",
    icon: "🌙",
    group: "urgent",
    searchTerms: ["after hours", "after-hours", "evening", "weekend gp"],
    healthpointPath: "/gps-accident-urgent-medical-care/",
  },
];

export const CATEGORY_GROUPS: Array<{ id: CategoryGroup; label: string }> = [
  { id: "urgent", label: "24h / Urgent & After Hours" },
  { id: "clinical", label: "Clinical Services" },
  { id: "community", label: "Community Services & Private" },
  { id: "assistance", label: "ACC / WINZ Assistance" },
];

export const VALID_CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

export function getCategoryConfig(id: ProviderCategory): CategoryConfig {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}