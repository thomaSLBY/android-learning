const API = "http://localhost:4000";

async function login(username: string): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password: "x" }),
  });
  const { accessToken } = (await res.json()) as { accessToken: string };
  return accessToken;
}

async function getFixtures(token: string, date: string) {
  const res = await fetch(`${API}/fixtures?date=${date}`, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return ((await res.json()) as { fixtures: Fixture[] }).fixtures;
}

export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 200 * 2 ** i));
    }
  }
  throw lastErr;
}

const token = await login("thomas");
const today = new Date().toISOString().slice(0, 10);
for (const f of await withRetry(() => getFixtures(token, today))) {
  console.log(`${f.home.name} ${f.score.home ?? "-"}-${f.score.away ?? "-"} ${f.away.name}`);
}