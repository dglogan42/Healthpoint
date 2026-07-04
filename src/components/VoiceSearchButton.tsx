import { useEffect, useRef, useState } from "react";
import { parseVoiceQuery, useVoiceSearch, type VoiceSearchResult } from "../hooks/useVoiceSearch";

interface Props {
  onVoiceResult: (result: VoiceSearchResult) => void;
  disabled?: boolean;
}

export function VoiceSearchButton({ onVoiceResult, disabled }: Props) {
  const {
    isListening,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearError,
  } = useVoiceSearch();
  const [processing, setProcessing] = useState(false);
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const lastProcessed = useRef("");

  useEffect(() => {
    fetch("/api/voice/status")
      .then((r) => r.json())
      .then((d: { geminiEnabled?: boolean }) => setGeminiEnabled(Boolean(d.geminiEnabled)))
      .catch(() => undefined);
  }, []);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      return;
    }
    clearError();
    lastProcessed.current = "";
    startListening();
  };

  useEffect(() => {
    if (
      isListening ||
      processing ||
      !interimTranscript ||
      interimTranscript === lastProcessed.current
    ) {
      return;
    }

    lastProcessed.current = interimTranscript;
    const run = async () => {
      setProcessing(true);
      try {
        const result = await parseVoiceQuery(interimTranscript);
        onVoiceResult(result);
      } finally {
        setProcessing(false);
      }
    };
    void run();
  }, [isListening, interimTranscript, processing, onVoiceResult]);

  const statusId = "voice-search-status";

  return (
    <div className="voice-search">
      <button
        type="button"
        className={`voice-search-btn ${isListening ? "listening" : ""}`}
        onClick={handleToggle}
        disabled={disabled || processing || !isSupported}
        aria-pressed={isListening}
        aria-describedby={statusId}
        aria-label={
          isListening
            ? "Stop voice search"
            : geminiEnabled
              ? "Start voice search with Gemini understanding"
              : "Start voice search"
        }
      >
        <span className="voice-icon" aria-hidden="true">
          {isListening ? "Stop" : "Mic"}
        </span>
        <span className="voice-label">
          {processing
            ? "Processing…"
            : isListening
              ? "Listening… tap to stop"
              : "Voice search"}
        </span>
      </button>

      <p id={statusId} className="voice-hint" role="note">
        {isSupported ? (
          <>
            Say e.g. &ldquo;find a chemist near Ponsonby&rdquo; or &ldquo;food bank in Auckland&rdquo;.
            {geminiEnabled ? " Powered by Gemini." : " Uses browser speech recognition."}
            {" "}On iPhone: ask Siri to open this page in Chrome, then use voice search.
          </>
        ) : (
          <>Voice search requires Chrome or Edge. Type your search or use Siri to dictate in the search field.</>
        )}
      </p>

      {isListening && interimTranscript && (
        <p className="voice-interim" aria-live="polite" aria-atomic="true">
          Heard: {interimTranscript}
        </p>
      )}

      {error && (
        <p className="voice-error" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
}