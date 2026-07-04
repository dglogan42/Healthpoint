import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceEngine = "webspeech" | "gemini" | "unavailable";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface VoiceSearchResult {
  transcript: string;
  location?: string;
  mode?: "healthcare" | "community";
  category?: string;
  serviceType?: string;
  source: "gemini" | "local" | "direct";
}

export function useVoiceSearch() {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRecognition));

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-NZ";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.results.length - 1; i >= 0; i--) {
        const result = event.results[i];
        if (result.isFinal) {
          final = result[0].transcript;
          break;
        }
        interim = result[0].transcript;
      }
      if (final) {
        setInterimTranscript(final);
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      setError(
        event.error === "not-allowed"
          ? "Microphone permission denied. Allow microphone access to use voice search."
          : `Voice recognition error: ${event.error}`,
      );
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError("Voice search is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    setError(null);
    setInterimTranscript("");
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setError("Could not start voice recognition. Please try again.");
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return {
    isListening,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearError: () => setError(null),
  };
}

export async function parseVoiceQuery(transcript: string): Promise<VoiceSearchResult> {
  const trimmed = transcript.trim();
  if (!trimmed) {
    return { transcript: trimmed, source: "direct" };
  }

  try {
    const res = await fetch("/api/voice/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: trimmed }),
    });
    if (res.ok) {
      return (await res.json()) as VoiceSearchResult;
    }
  } catch {
    // fall through to local parsing
  }

  return parseVoiceQueryLocal(trimmed);
}

function parseVoiceQueryLocal(transcript: string): VoiceSearchResult {
  const lower = transcript.toLowerCase();
  const result: VoiceSearchResult = { transcript, source: "local" };

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
  if (communityHints.some((h) => lower.includes(h))) {
    result.mode = "community";
  } else {
    result.mode = "healthcare";
  }

  const categoryMap: Array<{ keys: string[]; category: string; serviceType?: string }> = [
    { keys: ["chemist", "pharmacy"], category: "pharmacy" },
    { keys: ["doctor", "gp", "general practice"], category: "gp" },
    { keys: ["physio", "physiotherapist"], category: "physio" },
    { keys: ["chiropractor"], category: "chiropractor" },
    { keys: ["dentist", "dental"], category: "dentist" },
    { keys: ["optometrist", "eye care"], category: "optometrist" },
    { keys: ["mental health", "counselling", "counseling"], category: "mental-health" },
    { keys: ["urgent", "emergency", "accident", "24 hour", "24h"], category: "urgent-care" },
    { keys: ["after hours", "after-hours"], category: "after-hours" },
    { keys: ["food", "foodbank"], category: "community-services", serviceType: "food-support" },
    { keys: ["housing", "accommodation", "shelter"], category: "community-services", serviceType: "housing" },
    { keys: ["disability"], category: "community-services", serviceType: "disability" },
    { keys: ["violence", "refuge", "abuse"], category: "community-services", serviceType: "violence-support" },
  ];

  for (const entry of categoryMap) {
    if (entry.keys.some((k) => lower.includes(k))) {
      if (entry.serviceType) {
        result.mode = "community";
        result.serviceType = entry.serviceType;
      } else {
        result.category = entry.category;
      }
      break;
    }
  }

  const locationPatterns = [
    /(?:near|around|close to|in)\s+(.+)/i,
    /(?:find|search|locate|show)(?:\s+(?:me|a|an))?\s+(?:\w+\s+){0,4}(?:near|in)\s+(.+)/i,
  ];

  for (const pattern of locationPatterns) {
    const match = transcript.match(pattern);
    if (match?.[1]) {
      result.location = match[1].replace(/\s*(please|now|near me)\s*$/i, "").trim();
      break;
    }
  }

  if (!result.location && /near me|around here|my location|current location/i.test(lower)) {
    result.location = "__CURRENT_LOCATION__";
  }

  if (!result.location) {
    const nzPlaces = [
      "auckland",
      "wellington",
      "christchurch",
      "hamilton",
      "dunedin",
      "tauranga",
      "ponsonby",
      "newmarket",
      "takapuna",
    ];
    for (const place of nzPlaces) {
      if (lower.includes(place)) {
        result.location = place;
        break;
      }
    }
  }

  return result;
}