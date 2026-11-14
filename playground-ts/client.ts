const API = "http://localhost:4000";

async function login(username: string): Promise<string> {
    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password: "x" }),
    });

    // Lit le body de la réponse et le transforme son contenu JSON en valeur TypeScript
    // res.json() est asynchrone donc il faut utiliser `await`
    const data = await res.json();
    const accessToken = data.accessToken;
    // Version raccourcie
    //const { accessToken } = (await res.json()) as { accessToken: string };

    return accessToken;
}

async function getFixtures(token: string, date: string) {
    const res = await fetch(`${API}/fixtures?date=${date}`, {
        headers: { "authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return ((await res.json()) as { fixtures: Fixture[] }).fixtures;
}

// Fonction qui fonction avec des fonctions (fn) asynchrones : pas besoin de connaître les données, elle doit juste relancer fn si elle échoue
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
    // let: mutable - unknown: yet unknown type
    let lastErr: unknown;

    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        }
        catch(e) {
            lastErr = e;
            // Waiting before retrying...
            // The Promise will be solved after the timeout "await": we wait the Promise being solved before continuing.
            // Timeout: 200ms * 2^{i}, i=the id of retry (0...attempts-1) => EXPONENTIAL BACKOFF
            await new Promise((r) => setTimeout(r, 200 * 2 ** i));
        }
    }

    throw lastErr;
}

const token = await login("thomas");
console.log(token);
const today = new Date().toISOString().slice(0, 10);
for (const f of await withRetry<Fixture>(() => getFixtures(token, today))) {
    console.log(`[${f.competition.name}] ${f.home.name} ${f.score.home ?? "-"}-${f.score.away ?? "-"} ${f.away.name}`);
}