export interface CommunityServiceType {
  id: string;
  label: string;
  icon: string;
  healthpointPath: string;
  keywords: string[];
}

export const COMMUNITY_SERVICE_TYPES: CommunityServiceType[] = [
  {
    id: "food-support",
    label: "Food Support",
    icon: "🍎",
    healthpointPath: "/community-health-and-social-services/food-support/",
    keywords: ["food", "foodbank", "meals", "parcels"],
  },
  {
    id: "housing",
    label: "Housing & Accommodation",
    icon: "🏠",
    healthpointPath: "/community-health-and-social-services/accommodation-and-housing-support/",
    keywords: ["housing", "accommodation", "shelter", "homeless"],
  },
  {
    id: "disability",
    label: "Disability Support",
    icon: "♿",
    healthpointPath: "/community-health-and-social-services/disability-support-services/",
    keywords: ["disability", "accessibility", "carer"],
  },
  {
    id: "counselling",
    label: "Counselling",
    icon: "💬",
    healthpointPath: "/community-health-and-social-services/counselling/",
    keywords: ["counselling", "counseling", "therapy"],
  },
  {
    id: "family-support",
    label: "Family / Whānau Support",
    icon: "👨‍👩‍👧",
    healthpointPath: "/community-health-and-social-services/family-whanau-support-2/",
    keywords: ["family", "whānau", "whanau", "parenting"],
  },
  {
    id: "violence-support",
    label: "Abuse & Violence Support",
    icon: "🛡️",
    healthpointPath: "/community-health-and-social-services/abuse-and-violence-support-services/",
    keywords: ["violence", "abuse", "refuge", "safety"],
  },
  {
    id: "budgeting",
    label: "Budgeting & Debt Help",
    icon: "💰",
    healthpointPath: "/community-health-and-social-services/budgeting-and-help-with-debt/",
    keywords: ["budget", "debt", "financial"],
  },
  {
    id: "youth",
    label: "Youth Services",
    icon: "🧒",
    healthpointPath: "/community-health-and-social-services/youth-mentoring-development/",
    keywords: ["youth", "rangatahi", "mentoring"],
  },
  {
    id: "refugee-migrant",
    label: "Refugee & Migrant Support",
    icon: "🌍",
    healthpointPath: "/community-health-and-social-services/refugee-migrant-support/",
    keywords: ["refugee", "migrant", "immigrant", "settlement"],
  },
  {
    id: "kaupapa-maori",
    label: "Kaupapa Māori",
    icon: "🌿",
    healthpointPath: "/community-health-and-social-services/kaupapa-maori-community-health-social/",
    keywords: ["kaupapa", "māori", "maori", "whānau ora"],
  },
  {
    id: "pacific",
    label: "Pacific People",
    icon: "🌺",
    healthpointPath: "/community-health-and-social-services/pasifika-community-health-social/",
    keywords: ["pacific", "pasifika", "island"],
  },
  {
    id: "social-work",
    label: "Social Work",
    icon: "📋",
    healthpointPath: "/community-health-and-social-services/social-work-1/",
    keywords: ["social work", "case management"],
  },
  {
    id: "service-navigator",
    label: "Service Navigator",
    icon: "🧭",
    healthpointPath: "/community-health-and-social-services/service-navigator/",
    keywords: ["navigator", "navigation", "referral"],
  },
  {
    id: "home-support",
    label: "Home Support",
    icon: "🏡",
    healthpointPath: "/community-health-and-social-services/home-support/",
    keywords: ["home care", "home support", "domestic"],
  },
  {
    id: "employment",
    label: "Employment Support",
    icon: "💼",
    healthpointPath: "/community-health-and-social-services/employment-support/",
    keywords: ["employment", "job", "work"],
  },
  {
    id: "legal",
    label: "Legal / Civil Services",
    icon: "⚖️",
    healthpointPath: "/community-health-and-social-services/legal-civil-services/",
    keywords: ["legal", "law", "civil"],
  },
  {
    id: "pregnancy-parenting",
    label: "Pregnancy & Parenting",
    icon: "🤰",
    healthpointPath: "/community-health-and-social-services/pregnancy-and-parenting-1/",
    keywords: ["pregnancy", "parenting", "plunket", "tamariki"],
  },
  {
    id: "wellchild",
    label: "Well Child Tamariki Ora",
    icon: "👶",
    healthpointPath: "/community-health-and-social-services/well-child-tamariki-ora/",
    keywords: ["well child", "tamariki ora", "plunket"],
  },
  {
    id: "lgbtqia",
    label: "LGBTQIA+ Support",
    icon: "🏳️‍🌈",
    healthpointPath: "/community-health-and-social-services/lgbtqia-support/",
    keywords: ["lgbtqia", "rainbow", "queer"],
  },
  {
    id: "crisis-assessment",
    label: "Social Crisis Assessment",
    icon: "🚨",
    healthpointPath: "/community-health-and-social-services/social-services-crisis-assessment/",
    keywords: ["crisis", "emergency social"],
  },
];

export function getCommunityServiceType(id: string): CommunityServiceType | undefined {
  return COMMUNITY_SERVICE_TYPES.find((t) => t.id === id);
}

export const COMMUNITY_CATEGORIES = new Set(["community-services", "ngo"]);