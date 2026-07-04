import { Router } from "express";
import { VALID_CATEGORY_IDS } from "../data/categories.js";
import { COMMUNITY_SERVICE_TYPES } from "../data/communityServiceTypes.js";
import { ESSENTIAL_HELPLINES } from "../data/essentialHelplines.js";
import {
  geocodeAddress,
  getApiStatus,
  getCategories,
  searchProviders,
} from "../services/healthpoint.js";
import type { LocatorMode, ProviderCategory } from "../types.js";

export const providersRouter = Router();

providersRouter.get("/categories", (_req, res) => {
  res.json(getCategories());
});

providersRouter.get("/status", (_req, res) => {
  res.json(getApiStatus());
});

providersRouter.get("/helplines", (_req, res) => {
  res.json({ helplines: ESSENTIAL_HELPLINES });
});

providersRouter.get("/community-service-types", (_req, res) => {
  res.json({ serviceTypes: COMMUNITY_SERVICE_TYPES });
});

providersRouter.get("/search", async (req, res) => {
  const lat = parseFloat(String(req.query.lat ?? ""));
  const lng = parseFloat(String(req.query.lng ?? ""));
  const radiusKm = parseFloat(String(req.query.radius ?? "10"));
  const category = req.query.category
    ? (String(req.query.category) as ProviderCategory)
    : undefined;
  const query = req.query.q ? String(req.query.q) : undefined;
  const mode = req.query.mode ? (String(req.query.mode) as LocatorMode) : undefined;
  const serviceType = req.query.serviceType ? String(req.query.serviceType) : undefined;

  if (mode && mode !== "healthcare" && mode !== "community") {
    res.status(400).json({ error: "Invalid mode" });
    return;
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    res.status(400).json({ error: "lat and lng are required" });
    return;
  }

  if (category && !VALID_CATEGORY_IDS.has(category)) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }

  try {
    const result = await searchProviders({
      lat,
      lng,
      radiusKm: Number.isNaN(radiusKm) ? 10 : Math.min(radiusKm, 50),
      category,
      query,
      mode,
      serviceType,
    });
    res.json(result);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

providersRouter.get("/geocode", async (req, res) => {
  const address = String(req.query.address ?? "").trim();
  if (!address) {
    res.status(400).json({ error: "address is required" });
    return;
  }

  try {
    const result = await geocodeAddress(address);
    if (!result) {
      res.status(404).json({ error: "Location not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    console.error("Geocode error:", err);
    res.status(500).json({ error: "Geocoding failed" });
  }
});