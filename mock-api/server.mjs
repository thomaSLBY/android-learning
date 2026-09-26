// API simulée "mini football-view-aggregator".
// Zéro dépendance : `node mock-api/server.mjs` (Node >= 20).
//
// Variables d'environnement utiles pour les exercices :
//   PORT=4000          port d'écoute
//   LATENCY_MS=0       latence ajoutée à chaque réponse (tester les états "loading")
//   FAIL_RATE=0        probabilité (0..1) de renvoyer une 503 (tester retry / outbox)
//
// Auth : POST /auth/login {"username":"...","password":"..."} -> {"accessToken":"..."}
//        puis header `Authorization: Bearer <token>` sur toutes les routes /fixtures et /me.

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { networkInterfaces } from "node:os";

const PORT = Number(process.env.PORT ?? 4000);
const LATENCY_MS = Number(process.env.LATENCY_MS ?? 0);
const FAIL_RATE = Number(process.env.FAIL_RATE ?? 0);

/* ------------------------------------------------------------------ données */

const competitions = {
  61: { id: 61, name: "Ligue 1", country: "France", season: 2026 },
  39: { id: 39, name: "Premier League", country: "England", season: 2026 },
  140: { id: 140, name: "La Liga", country: "Spain", season: 2026 },
};

const teams = {
  85: { id: 85, name: "Paris Saint-Germain" },
  81: { id: 81, name: "Marseille" },
  80: { id: 80, name: "Lyon" },
  91: { id: 91, name: "Monaco" },
  40: { id: 40, name: "Liverpool" },
  50: { id: 50, name: "Manchester City" },
  42: { id: 42, name: "Arsenal" },
  541: { id: 541, name: "Real Madrid" },
  529: { id: 529, name: "Barcelona" },
};

const isoDate = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * 86_400_000);

// Calendrier généré autour d'aujourd'hui (J-2 .. J+7), comme le vrai backend.
const pairs = [
  [61, 85, 81], [61, 80, 91], [39, 40, 50], [39, 42, 40], [140, 541, 529],
  [61, 81, 80], [39, 50, 42], [61, 91, 85], [140, 529, 541], [39, 40, 42],
];
const fixtures = [];
let nextId = 1001;
for (let offset = -2; offset <= 7; offset++) {
  const day = addDays(new Date(), offset);
  for (let k = 0; k < 3; k++) {
    const [comp, h, a] = pairs[(offset + 2 + k * 3) % pairs.length];
    const kickoff = new Date(`${isoDate(day)}T${[15, 18, 21][k]}:00:00Z`);
    const past = offset < 0;
    const live = offset === 0 && k === 0;
    fixtures.push({
      id: nextId++,
      kickoff: kickoff.toISOString(),
      date: isoDate(day),
      status: past ? "FT" : live ? "2H" : "NS",
      elapsed: live ? 67 : null,
      competition: competitions[comp],
      home: teams[h],
      away: teams[a],
      score: past ? { home: (h + k) % 4, away: (a + offset + 5) % 3 } : live ? { home: 1, away: 1 } : { home: null, away: null },
      venue: `Stade de ${teams[h].name}`,
    });
  }
}

/** notes[username][fixtureId] = Map<noteId, Note> */
const notes = {};
/** summaries[username][fixtureId] = { status, summary } */
const summaries = {};
const tokens = new Map(); // token -> username

/* ------------------------------------------------------------------ helpers */

function send(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    throw Object.assign(new Error("invalid_json"), { status: 400 });
  }
}

const userNotes = (u, fid) => ((notes[u] ??= {})[fid] ??= new Map());

function withUserState(u, f) {
  const n = userNotes(u, f.id).size;
  const s = summaries[u]?.[f.id]?.status ?? "none";
  return { ...f, canSummarize: f.status === "FT" && n > 0, my: n ? { noteCount: n, summaryStatus: s } : null };
}

/* ------------------------------------------------------------------ routes */

const routes = [
  ["POST", /^\/auth\/login$/, async ({ body }) => {
    if (!body?.username || !body?.password) return [400, { error: "missing_credentials" }];
    const token = randomUUID();
    tokens.set(token, body.username);
    return [200, { accessToken: token, expiresIn: 3600 }];
  }, { public: true }],

  ["GET", /^\/health$/, async () => [200, { ok: true }], { public: true }],

  ["GET", /^\/fixtures$/, async ({ user, query }) => {
    const date = query.get("date") ?? isoDate(new Date());
    return [200, { date, fixtures: fixtures.filter((f) => f.date === date).map((f) => withUserState(user, f)) }];
  }],

  ["GET", /^\/fixtures\/(\d+)$/, async ({ user, params: [id] }) => {
    const f = fixtures.find((x) => x.id === Number(id));
    if (!f) return [404, { error: "fixture_not_found" }];
    return [200, { fixture: withUserState(user, f), summary: summaries[user]?.[f.id]?.summary ?? null }];
  }],

  ["GET", /^\/fixtures\/(\d+)\/notes$/, async ({ user, params: [id] }) => {
    const list = [...userNotes(user, Number(id)).values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return [200, { notes: list }];
  }],

  // PUT idempotent : le client choisit l'id de la note (ULID/UUID) -> rejouable sans doublon.
  ["PUT", /^\/fixtures\/(\d+)\/notes\/([\w-]+)$/, async ({ user, params: [fid, noteId], body }) => {
    if (!fixtures.some((f) => f.id === Number(fid))) return [404, { error: "fixture_not_found" }];
    if (typeof body?.text !== "string" || !body.text.trim()) return [400, { error: "text_required" }];
    const map = userNotes(user, Number(fid));
    const now = new Date().toISOString();
    const note = {
      id: noteId,
      fixtureId: Number(fid),
      text: body.text.trim().slice(0, 2000),
      minute: body.minute ?? null,
      source: body.source === "voice" ? "voice" : "text",
      createdAt: map.get(noteId)?.createdAt ?? body.createdAt ?? now,
      updatedAt: now,
    };
    map.set(noteId, note);
    if (summaries[user]?.[fid]?.status === "ready") summaries[user][fid].status = "stale";
    return [200, { note }];
  }],

  ["DELETE", /^\/fixtures\/(\d+)\/notes\/([\w-]+)$/, async ({ user, params: [fid, noteId] }) => {
    userNotes(user, Number(fid)).delete(noteId);
    return [204];
  }],

  ["GET", /^\/fixtures\/(\d+)\/summary$/, async ({ user, params: [fid] }) => {
    const s = summaries[user]?.[fid];
    return [200, { status: s?.status ?? "none", summary: s?.summary ?? null }];
  }],

  // Génération asynchrone simulée : "pending" pendant 4 s puis "ready" (pour exercer le polling).
  ["POST", /^\/fixtures\/(\d+)\/summary$/, async ({ user, params: [fid] }) => {
    const f = fixtures.find((x) => x.id === Number(fid));
    const list = [...userNotes(user, Number(fid)).values()];
    if (!f || !list.length) return [409, { error: "nothing_to_summarize" }];
    (summaries[user] ??= {})[fid] = { status: "pending", summary: null };
    setTimeout(() => {
      summaries[user][fid] = {
        status: "ready",
        summary: {
          fixtureId: f.id,
          season: f.competition.season,
          overall: `${f.home.name} - ${f.away.name} : ${list.length} note(s) prise(s). Points clés : ${list.map((n) => n.text).join(" / ").slice(0, 300)}`,
          teams: [],
          players: [],
          generatedAt: new Date().toISOString(),
        },
      };
    }, 4000);
    return [202, { status: "pending" }];
  }],

  ["GET", /^\/me\/matches$/, async ({ user }) => {
    const items = Object.entries(notes[user] ?? {})
      .filter(([, m]) => m.size)
      .map(([fid, m]) => {
        const f = fixtures.find((x) => x.id === Number(fid));
        const last = [...m.values()].map((n) => n.updatedAt).sort().at(-1);
        return { fixtureId: f.id, fixture: f, season: f.competition.season, noteCount: m.size, lastNoteAt: last, summaryStatus: summaries[user]?.[fid]?.status ?? "none" };
      })
      .sort((a, b) => b.lastNoteAt.localeCompare(a.lastNoteAt));
    return [200, { items }];
  }],

  ["GET", /^\/me\/teams$/, async ({ user }) => {
    const counts = new Map();
    for (const [fid, m] of Object.entries(notes[user] ?? {})) {
      if (!m.size) continue;
      const f = fixtures.find((x) => x.id === Number(fid));
      for (const t of [f.home, f.away]) {
        const c = counts.get(t.id) ?? { teamId: t.id, name: t.name, matchCount: 0, lastMatchAt: f.kickoff };
        c.matchCount++;
        if (f.kickoff > c.lastMatchAt) c.lastMatchAt = f.kickoff;
        counts.set(t.id, c);
      }
    }
    return [200, { teams: [...counts.values()] }];
  }],

  ["GET", /^\/teams$/, async () => [200, { teams: Object.values(teams) }]],
];

/* ------------------------------------------------------------------ serveur */

const server = createServer(async (req, res) => {
  const started = Date.now();
  const url = new URL(req.url, "http://x");
  const done = (status, body) => {
    send(res, status, body);
    console.log(`${req.method} ${url.pathname}${url.search} -> ${status} (${Date.now() - started} ms)`);
  };
  try {
    if (req.method === "OPTIONS") return done(204);
    if (LATENCY_MS) await new Promise((r) => setTimeout(r, LATENCY_MS));

    const route = routes.find(([m, re]) => m === req.method && re.test(url.pathname));
    if (!route) return done(404, { error: "route_not_found" });
    const [, re, handler, opts] = route;

    let user;
    if (!opts?.public) {
      if (Math.random() < FAIL_RATE) return done(503, { error: "service_unavailable" });
      const token = req.headers.authorization?.replace(/^Bearer /, "");
      user = tokens.get(token);
      if (!user) return done(401, { error: "unauthorized" });
    }
    const body = ["POST", "PUT"].includes(req.method) ? await readJson(req) : undefined;
    const [status, payload] = await handler({ user, body, query: url.searchParams, params: url.pathname.match(re).slice(1) });
    done(status, payload);
  } catch (err) {
    done(err.status ?? 500, { error: err.message ?? "internal_error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  const ips = Object.values(networkInterfaces()).flat().filter((i) => i && i.family === "IPv4" && !i.internal).map((i) => i.address);
  console.log(`Mock API prête sur http://localhost:${PORT}`);
  for (const ip of ips) console.log(`  depuis ton téléphone (même Wi-Fi) : http://${ip}:${PORT}`);
  console.log(`  LATENCY_MS=${LATENCY_MS} FAIL_RATE=${FAIL_RATE}`);
});
