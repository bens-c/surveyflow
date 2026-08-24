import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error("MONGODB_URI fehlt.");

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://bens-c.github.io")
  .split(",").map(x => x.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.some(x => origin.startsWith(x))) return cb(null, true);
    return cb(new Error("Origin nicht erlaubt"));
  }
}));
app.use(express.json({ limit: "256kb" }));

const client = new MongoClient(mongoUri);
let dbPromise;
function db() {
  if (!dbPromise) dbPromise = client.connect().then(() => client.db("surveyflow"));
  return dbPromise;
}

const adminUser = process.env.ADMIN_USER || "Admin";
const adminPassword = process.env.ADMIN_PASSWORD || "Dumm";
function requireAdmin(req, res, next) {
  if (req.get("x-admin-user") === adminUser && req.get("x-admin-password") === adminPassword) return next();
  res.status(401).json({ error: "Admin-Login erforderlich" });
}

app.get("/api/health", async (_req, res) => {
  await (await db()).command({ ping: 1 });
  res.json({ ok: true });
});

app.get("/api/surveys", async (_req, res) => {
  const docs = await (await db()).collection("surveys").find({}, { projection: { _id: 0 } }).toArray();
  res.json(docs);
});

app.post("/api/surveys", requireAdmin, async (req, res) => {
  const survey = { ...req.body, updatedAt: new Date() };
  if (!survey.id || !survey.title || !Array.isArray(survey.questions)) return res.status(400).json({ error: "Ungültige Umfrage" });
  await (await db()).collection("surveys").updateOne({ id: survey.id }, { $set: survey }, { upsert: true });
  res.json({ ok: true });
});

app.put("/api/surveys/:id", requireAdmin, async (req, res) => {
  const survey = { ...req.body, id: req.params.id, updatedAt: new Date() };
  await (await db()).collection("surveys").updateOne({ id: req.params.id }, { $set: survey }, { upsert: true });
  res.json({ ok: true });
});

app.post("/api/responses", async (req, res) => {
  const response = { ...req.body, time: req.body.time ? new Date(req.body.time) : new Date() };
  if (!response.id || !response.surveyId || !response.answers) return res.status(400).json({ error: "Ungültige Antwort" });
  await (await db()).collection("responses").insertOne(response);
  res.status(201).json({ ok: true });
});

app.get("/api/responses", requireAdmin, async (_req, res) => {
  const docs = await (await db()).collection("responses").find({}, { projection: { _id: 0 } }).sort({ time: -1 }).toArray();
  res.json(docs);
});

app.delete("/api/responses/:id", requireAdmin, async (req, res) => {
  await (await db()).collection("responses").deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

app.delete("/api/responses", requireAdmin, async (_req, res) => {
  await (await db()).collection("responses").deleteMany({});
  res.json({ ok: true });
});

app.delete("/api/surveys/:id/responses", requireAdmin, async (req, res) => {
  const result = await (await db()).collection("responses").deleteMany({ surveyId: req.params.id });
  res.json({ ok: true, deleted: result.deletedCount });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Serverfehler" });
});

app.listen(port, () => console.log(`SurveyFlow API läuft auf Port ${port}`));
