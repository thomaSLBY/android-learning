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

// Compos (comme API-Football) : 11 titulaires + remplaçants. id joueur = teamId * 1000 + numéro.
const squads = {
  85: ["4-3-3", ["Donnarumma", "Hakimi", "Marquinhos", "Pacho", "Mendes", "Vitinha", "Neves", "Zaïre-Emery", "Doué", "Dembélé", "Barcola"], ["Safonov", "Hernández", "Lee Kang-in", "Ruiz", "Ramos"]],
  81: ["3-4-2-1", ["Rulli", "Balerdi", "Cornelius", "Emerson", "Murillo", "Højbjerg", "Kondogbia", "Garcia", "Greenwood", "Gomes", "Aubameyang"], ["De Lange", "Egan-Riley", "O'Riley", "Nadir", "Vermeeren"]],
  80: ["4-2-3-1", ["Perri", "Maitland-Niles", "Niakhaté", "Mata", "Tagliafico", "Tolisso", "Matić", "Cherki", "Fofana", "Nuamah", "Mikautadze"], ["Descamps", "Kumbedi", "Moreira", "Šulc", "Karabec"]],
  91: ["4-4-2", ["Köhn", "Vanderson", "Kehrer", "Salisu", "Henrique", "Akliouche", "Camara", "Zakaria", "Minamino", "Biereth", "Embolo"], ["Majecki", "Mawissa", "Golovin", "Ben Seghir", "Ilenikhena"]],
  40: ["4-2-3-1", ["Alisson", "Frimpong", "Konaté", "Van Dijk", "Kerkez", "Gravenberch", "Mac Allister", "Szoboszlai", "Salah", "Wirtz", "Isak"], ["Mamardashvili", "Gomez", "Jones", "Chiesa", "Ekitiké"]],
  50: ["4-1-4-1", ["Donnarumma", "Nunes", "Dias", "Guéhi", "O'Reilly", "Rodri", "Foden", "Reijnders", "Cherki", "Doku", "Haaland"], ["Trafford", "Aké", "Kovačić", "Savinho", "Marmoush"]],
  42: ["4-3-3", ["Raya", "Timber", "Saliba", "Gabriel", "Calafiori", "Rice", "Zubimendi", "Ødegaard", "Saka", "Gyökeres", "Martinelli"], ["Kepa", "White", "Merino", "Eze", "Madueke"]],
  541: ["4-3-3", ["Courtois", "Carvajal", "Militão", "Huijsen", "Carreras", "Valverde", "Tchouaméni", "Bellingham", "Güler", "Mbappé", "Vinícius Jr"], ["Lunin", "Rüdiger", "Camavinga", "Brahim", "Rodrygo"]],
  529: ["4-2-3-1", ["Szczęsny", "Koundé", "Araujo", "Cubarsí", "Balde", "De Jong", "Pedri", "Yamal", "Fermín", "Raphinha", "Lewandowski"], ["Peña", "Martínez", "Gavi", "Olmo", "Ferran"]],
};
const player = (teamId, name, number) => ({ id: teamId * 1000 + number, name, number });
const lineupsFor = (f) =>
  [f.home, f.away].map(({ id }) => {
    const [formation, xi, subs] = squads[id];
    return { teamId: id, formation, startXI: xi.map((n, i) => player(id, n, i + 1)), substitutes: subs.map((n, i) => player(id, n, i + 12)) };
  });
const allPlayers = () =>
  Object.keys(squads).flatMap((id) => lineupsFor({ home: { id: Number(id) }, away: { id: Number(id) } })[0])
    .flatMap((l) => [...l.startXI, ...l.substitutes].map((p) => ({ ...p, teamId: l.teamId })));

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
/** plans[username] = { plan: "free" | "premium", premiumUntil } — le backend reste la source de vérité. */
const plans = {};
const profileOf = (u) => (plans[u] ??= { plan: "free", premiumUntil: null });

// Évènements (comme API-Football) : un remplacement et un carton rouge par match commencé.
// Piège réaliste : sur un remplacement, le fournisseur met parfois l'entrant dans `assistId` et parfois dans `playerId`.
function eventsFor(f) {
  if (f.status === "NS") return [];
  const [h, a] = [f.home.id, f.away.id];
  return [
    { minute: 58, teamId: h, type: "substitution", playerId: h * 1000 + 9, playerName: squads[h][1][8], assistId: h * 1000 + 15, assistName: squads[h][2][3] },
    { minute: 61, teamId: a, type: "substitution", playerId: a * 1000 + 14, playerName: squads[a][2][2], assistId: a * 1000 + 7, assistName: squads[a][1][6] },
    { minute: 45, extra: 2, teamId: a, type: "red", playerId: a * 1000 + 4, playerName: squads[a][1][3] },
  ];
}

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
    // Compo publiée ~1 h avant le coup d'envoi (sinon liste vide, comme en vrai).
    const published = Date.parse(f.kickoff) - Date.now() < 3_600_000;
    return [200, { fixture: withUserState(user, f), lineups: published ? lineupsFor(f) : [], events: eventsFor(f), summary: summaries[user]?.[f.id]?.summary ?? null }];
  }],

  ["GET", /^\/fixtures\/(\d+)\/notes$/, async ({ user, params: [id] }) => {
    const list = [...userNotes(user, Number(id)).values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return [200, { notes: list }];
  }],

  // PUT idempotent : le client choisit l'id de la note (ULID/UUID) -> rejouable sans doublon.
  ["PUT", /^\/fixtures\/(\d+)\/notes\/([\w-]+)$/, async ({ user, params: [fid, noteId], body }) => {
    if (!fixtures.some((f) => f.id === Number(fid))) return [404, { error: "fixture_not_found" }];
    // Étiquettes rapides ("Perte de balle"…) : 8 max, 40 caractères max chacune.
    const labels = Array.isArray(body?.labels) ? body.labels.filter((l) => typeof l === "string" && l.trim()).map((l) => l.trim().slice(0, 40)).slice(0, 8) : [];
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    // Une note doit avoir du texte OU au moins une étiquette.
    if (!text && !labels.length) return [400, { error: "text_or_labels_required" }];
    const map = userNotes(user, Number(fid));
    const now = new Date().toISOString();
    const note = {
      id: noteId,
      fixtureId: Number(fid),
      text: text.slice(0, 2000),
      labels,
      minute: body.minute ?? null,
      source: body.source === "voice" ? "voice" : "text",
      // Tags posés depuis les compos : une équipe et/ou jusqu'à 11 joueurs.
      teamId: body.teamId ?? null,
      playerIds: Array.isArray(body.playerIds) ? body.playerIds.slice(0, 11) : [],
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
    // Freemium : le résumé IA est réservé au plan Premium → 402 Payment Required.
    if (profileOf(user).plan !== "premium") return [402, { error: "premium_required", message: "This feature requires Premium" }];
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

  ["GET", /^\/me$/, async ({ user }) => [200, { ...profileOf(user), currentSeason: 2026 }]],

  // Simule le webhook du store (RevenueCat) : en vrai, c'est le SERVEUR du store qui appelle le backend,
  // jamais l'app. Body : {"plan":"premium"} ou {"plan":"free"}.
  ["POST", /^\/dev\/webhook$/, async ({ user, body }) => {
    const premium = body?.plan === "premium";
    plans[user] = { plan: premium ? "premium" : "free", premiumUntil: premium ? new Date(Date.now() + 30 * 86_400_000).toISOString() : null };
    return [200, plans[user]];
  }],

  // Suppression de compte (obligatoire sur les stores) : efface toutes les données de l'utilisateur.
  ["DELETE", /^\/me$/, async ({ user }) => {
    delete notes[user];
    delete summaries[user];
    delete plans[user];
    for (const [t, u] of tokens) if (u === user) tokens.delete(t);
    return [204];
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

  ["GET", /^\/me\/players$/, async ({ user }) => {
    const roster = new Map(allPlayers().map((p) => [p.id, p]));
    const counts = new Map();
    for (const [fid, m] of Object.entries(notes[user] ?? {})) {
      const f = fixtures.find((x) => x.id === Number(fid));
      const tagged = new Set([...m.values()].flatMap((n) => n.playerIds));
      for (const pid of tagged) {
        const p = roster.get(pid);
        if (!p) continue;
        const c = counts.get(pid) ?? { playerId: pid, name: p.name, team: teams[p.teamId], matchCount: 0, lastMatchAt: f.kickoff };
        c.matchCount++;
        if (f.kickoff > c.lastMatchAt) c.lastMatchAt = f.kickoff;
        counts.set(pid, c);
      }
    }
    return [200, { players: [...counts.values()] }];
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
