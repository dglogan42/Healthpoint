import cors from "cors";
import express from "express";
import { providersRouter } from "./routes/providers.js";
import { voiceRouter } from "./routes/voice.js";

const PORT = Number(process.env.PORT) || 3002;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "healthpoint-finder-api" });
});

app.use("/api/providers", providersRouter);
app.use("/api/voice", voiceRouter);

app.listen(PORT, () => {
  console.log(`Healthpoint Finder API running at http://localhost:${PORT}`);
});