import { CATEGORIES } from "../data/categories.js";
import { COMMUNITY_SERVICE_TYPES } from "../data/communityServiceTypes.js";
import type { LocatorMode, ProviderCategory } from "../types.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.VITE_GEMINI_API_KEY ?? "";

export interface VoiceParseResult {
  transcript: string;
  location?: string;
  mode?: LocatorMode;
  category?: ProviderCategory;
  serviceType?: string;
  source: "gemini" | "local" | "direct";
}

const CATEGORY_IDS = CATEGORIES.map((c) => c.id).join(", ");
const SERVICE_TYPE_IDS = COMMUNITY_SERVICE_TYPES.map((s) => s.id).join(", ");

export async function parseVoiceTranscript(transcript: string): Promise<VoiceParseResult> {
  const trimmed = transcript.trim();
  if (!trimmed) {
    return { transcript: trimmed, source: "direct" };
  }

  if (GEMINI_API_KEY) {
    try {
      const geminiResult = await parseWithGemini(trimmed);
      if (geminiResult) return geminiResult;
    } catch (err) {
      console.warn("Gemini voice parse failed, using local parser:", err);
    }
  }

  return parseLocally(trimmed);
}

async function parseWithGemini(transcript: string): Promise<VoiceParseResult | null> {
  const prompt = `You parse spoken healthcare search queries for a New Zealand app.
Return ONLY valid JSON with these optional fields:
- location: string (suburb, city, or "current" for near me)
- mode: "healthcare" or "community"
- category: one of [${CATEGORY_IDS}]
- serviceType: one of [${SERVICE_TYPE_IDS}]

Examples:
"find a chemist near Ponsonby" -> {"location":"Ponsonby","mode":"healthcare","category":"pharmacy"}
"food bank in Auckland" -> {"location":"Auckland","mode":"community","serviceType":"food-support"}
"urgent care near me" -> {"location":"current","mode":"healthcare","category":"urgent-care"}

Query: "${transcript}"`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  const parsed = JSON.parse(text) as {
    location?: string;
    mode?: LocatorMode;
    category?: string;
    serviceType?: string;
  };

  const result: VoiceParseResult = {
    transcript,
    source: "gemini",
    mode: parsed.mode === "community" ? "community" : parsed.mode === "healthcare" ? "healthcare" : undefined,
  };

  if (parsed.location) {
    result.location =
      parsed.location.toLowerCase() === "current" ? "__CURRENT_LOCATION__" : parsed.location;
  }

  if (parsed.category && CATEGORIES.some((c) => c.id === parsed.category)) {
    result.category = parsed.category as ProviderCategory;
  }

  if (parsed.serviceType && COMMUNITY_SERVICE_TYPES.some((s) => s.id === parsed.serviceType)) {
    result.serviceType = parsed.serviceType;
    result.mode = "community";
  }

  return result;
}

function parseLocally(transcript: string): VoiceParseResult {
  const lower = transcript.toLowerCase();
  const result: VoiceParseResult = { transcript, source: "local" };

  const communityHints = [
    "community",
    "food bank",
    "food support",
    "housing",
    "refuge",
    "budget",
    "youth",
    "navigator",
    "ngo",
    "social service",
  ];
  result.mode = communityHints.some((h) => lower.includes(h)) ? "community" : "healthcare";

  const rules: Array<{ keys: string[]; category?: ProviderCategory; serviceType?: string }> = [
    { keys: ["chemist", "pharmacy"], category: "pharmacy" },
    { keys: ["doctor", " gp", "general practice"], category: "gp" },
    { keys: ["physio"], category: "physio" },
    { keys: ["chiropractor"], category: "chiropractor" },
    { keys: ["dentist"], category: "dentist" },
    { keys: ["mental health"], category: "mental-health" },
    { keys: ["urgent", "emergency", "24 hour"], category: "urgent-care" },
    { keys: ["after hours"], category: "after-hours" },
    { keys: ["food"], serviceType: "food-support" },
    { keys: ["housing"], serviceType: "housing" },
    { keys: ["disability"], serviceType: "disability" },
    { keys: ["violence", "refuge"], serviceType: "violence-support" },
  ];

  for (const rule of rules) {
    if (rule.keys.some((k) => lower.includes(k))) {
      if (rule.serviceType) {
        result.serviceType = rule.serviceType;
        result.mode = "community";
      } else if (rule.category) {
        result.category = rule.category;
      }
      break;
    }
  }

  const nearMatch = transcript.match(/(?:near|around|in)\s+(.+)/i);
  if (nearMatch?.[1]) {
    result.location = nearMatch[1].replace(/\s*(please|now)\s*$/i, "").trim();
  } else if (/near me|around here|my location/i.test(lower)) {
    result.location = "__CURRENT_LOCATION__";
  }

  return result;
}

export function getVoiceSearchStatus() {
  return {
    geminiEnabled: Boolean(GEMINI_API_KEY),
    webSpeechNote:
      "Use Chrome or Edge for built-in voice. On iPhone, use Siri to open this page in Chrome, then tap the microphone.",
  };
}