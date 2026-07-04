import { Router } from "express";
import { getVoiceSearchStatus, parseVoiceTranscript } from "../services/voiceSearch.js";

export const voiceRouter = Router();

voiceRouter.get("/status", (_req, res) => {
  res.json(getVoiceSearchStatus());
});

voiceRouter.post("/parse", async (req, res) => {
  const transcript = String(req.body?.transcript ?? "").trim();
  if (!transcript) {
    res.status(400).json({ error: "transcript is required" });
    return;
  }

  try {
    const result = await parseVoiceTranscript(transcript);
    res.json(result);
  } catch (err) {
    console.error("Voice parse error:", err);
    res.status(500).json({ error: "Voice parsing failed" });
  }
});