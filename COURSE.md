# Cours : développement mobile Android avec React Native & Expo

> Objectif : partir de zéro et être autonome sur **football-view-aggregator** (`~/projects/football-view-aggregator/mobile`).
> Public : data engineer (Python, SQL, AWS, Terraform, POO) sans expérience mobile.
> Fil rouge : construire **« Mini FVA »**, une version simplifiée de l'app, contre une API simulée (`mock-api/`).

---

## Sommaire & planning (≈ 13 semaines, ~5–8 h/semaine)

| Semaine | Module | Tu sauras… |
|---|---|---|
| 1 | [0. Pourquoi React Native et pas Kotlin ?](#module-0--pourquoi-react-native-et-pas-kotlin-) + [1. Environnement](#module-1--environnement) | lancer une app sur ton téléphone |
| 2 | [2. TypeScript pour un dev Python](#module-2--typescript-pour-un-dev-python) | lire/écrire du TS typé, async/await |
| 3 | [3. React : composants, props, state](#module-3--react--composants-props-state) | penser « UI = f(state) » |
| 4 | [4. React Native : vues, listes, styles](#module-4--react-native--vues-listes-styles) | construire un écran mobile |
| 5 | [5. Navigation avec Expo Router](#module-5--navigation-avec-expo-router) | onglets, routes `[id]`, layouts |
| 6 | [6. Hooks avancés & architecture](#module-6--hooks-avancés--architecture-du-code) | extraire de la logique réutilisable |
| 7 | [7. Données distantes : fetch + React Query](#module-7--données-distantes--fetch--react-query) | cache, loading, erreurs, mutations |
| 8 | [8. Authentification & stockage sécurisé](#module-8--authentification--stockage-sécurisé) | login, token, SecureStore |
| 9 | [9. Offline-first : SQLite & outbox](#module-9--offline-first--sqlite--outbox) | l'architecture la plus « data » de l'app |
| 10 | [10. APIs natives : haptique, voix, permissions](#module-10--apis-natives--haptique-voix-permissions) | utiliser le matériel du téléphone |
| 11 | [11. Qualité : lint, typecheck, tests, debug](#module-11--qualité--lint-typecheck-tests-debug) | fiabiliser et débugger |
| 12 | [12. Build & déploiement : EAS, OTA, Play Store](#module-12--build--déploiement--eas-ota-play-store) | livrer un APK / AAB |
| 13 | [13. Visite guidée de football-view-aggregator](#module-13--visite-guidée-de-football-view-aggregator) | modifier la vraie app en confiance |
| Bonus | [B. Kotlin & Android natif](#bonus--kotlin--android-natif) | comprendre ce qu'il y a sous le capot |

**Méthode** : pour chaque module, lis la théorie, tape les exemples (ne copie-colle pas : la mémoire musculaire compte), fais les exercices *avant* d'ouvrir les corrigés (`<details>`). Commit à la fin de chaque exercice (`git commit -m "M4-ex2"`) : tu auras un historique de ta progression.

**Structure du projet `android-learning/`** (au fil du cours) :

```
android-learning/
├── COURSE.md          ← ce fichier
├── mock-api/          ← API simulée (fournie)
├── playground-ts/     ← module 2 : scripts TypeScript purs
├── mini-fva/          ← l'app Expo du fil rouge (créée au module 1)
└── bonus-kotlin/      ← projet Android Studio natif (bonus)
```

---

## Module 0 — Pourquoi React Native et pas Kotlin ?

### Les trois façons de faire une app Android

| Approche | Langage | UI | Plateformes |
|---|---|---|---|
| **Natif Android** | Kotlin (ou Java) | Jetpack Compose / XML | Android uniquement |
| **Natif iOS** | Swift | SwiftUI / UIKit | iOS uniquement |
| **Cross-platform « natif »** | TypeScript (React Native), Dart (Flutter) | vrais composants natifs (RN) ou moteur de rendu propre (Flutter) | Android + iOS (+ web) |

### Pourquoi j'ai choisi React Native + Expo pour football-view-aggregator

1. **Un seul code pour Android et iOS.** En Kotlin, il aurait fallu réécrire toute l'app en Swift pour iOS. Ici ~100 % du code est partagé.
2. **Un seul langage de bout en bout.** Le backend (`backend/`, Lambdas AWS) est en **TypeScript**. Les types de l'API sont littéralement copiés d'un côté à l'autre (`mobile/src/lib/types.ts` : *« Mirrors backend/src/domain/types.ts »*). Un changement de contrat se voit au typecheck des deux côtés.
3. **Expo supprime la plomberie native** : pas besoin d'Android Studio pour builder (EAS build dans le cloud), permissions/icônes/splash configurés dans `app.json`, modules prêts à l'emploi (SQLite, SecureStore, reconnaissance vocale, auth OAuth…).
4. **Mises à jour OTA** (*over-the-air*) : on peut corriger un bug JS sans repasser par la revue du Play Store.
5. **Itération rapide** : *Fast Refresh* — tu sauvegardes, l'écran se met à jour en < 1 s sur ton téléphone.
6. **Le besoin s'y prête** : l'app est essentiellement des listes, des formulaires, des appels API et un stockage local. Rien qui exige les performances ou l'accès bas niveau du natif (jeu 3D, traitement vidéo temps réel…).

**Quand Kotlin aurait été le meilleur choix** : app Android-only avec intégration profonde de l'OS (widgets d'écran d'accueil complexes, services en arrière-plan lourds, Wear OS, Android Auto), besoins de perf extrêmes, ou équipe déjà Kotlin. Et même avec React Native, on écrit parfois un **module natif** en Kotlin quand une librairie n'existe pas — d'où le module bonus.

### Comment ça marche sous le capot (modèle mental)

```
 ┌───────────── ton code TypeScript (React) ─────────────┐
 │  <View><Text>PSG 2-1 OM</Text></View>                  │
 └──────────────────────┬────────────────────────────────┘
                        │ exécuté par le moteur JS "Hermes" embarqué dans l'APK
                        ▼
 ┌──────────── React Native (nouvelle archi : JSI/Fabric) ┐
 │  traduit <View> → android.view.ViewGroup               │
 │          <Text> → android.widget.TextView              │
 └──────────────────────┬────────────────────────────────┘
                        ▼
              vrais widgets Android natifs
```

Analogie data : c'est comme PySpark. Tu écris du Python (TS), mais le travail réel est fait par la JVM (les widgets natifs). Tu n'as besoin de descendre dans la JVM (Kotlin) que pour des cas particuliers.

### Vocabulaire à retenir

- **Emulateur** : téléphone virtuel qui tourne dans une fenêtre du Mac.
- **Expo** : framework + outillage autour de React Native (CLI, modules, build cloud EAS).
- **Expo Go** : app du Play Store qui peut exécuter ton projet sans le compiler. Limitée aux modules natifs inclus.
- **Development build** : ta propre version « Expo Go » compilée avec tes modules natifs. Nécessaire pour FVA (SQLCipher, reconnaissance vocale).
- **Metro** : le *bundler* JS (équivalent d'un build step) qui sert ton code au téléphone.
- **APK / AAB** : paquet Android installable / format de publication Play Store.
- **CNG** (*Continuous Native Generation*) : le dossier `android/` est **généré** depuis `app.json`. On ne l'édite pas à la main.
- **Android Debug Bridge (adb)** : outil de ligne de commande polyvalent qui vous permet de communiquer avec un appareil. La commande adb facilite diverses actions sur l'appareil, telles que l'installation et le débogage des applications. adb donne accès à un shell Unix que vous pouvez utiliser pour exécuter différentes commandes sur un appareil. Il s'agit d'un programme client-serveur.

---

## Module 1 — Environnement

### Théorie

Tu as besoin de :
- **Node.js ≥ 20** (tu as la v25) + **npm** : runtime JS, équivalent de `python` + `pip`.
- **Android Studio** (déjà installé) : pour le SDK Android, l'émulateur, et `adb`.
- **Ton téléphone Android** avec **Expo Go** (Play Store) et le **mode développeur** activé.

Correspondance Python ↔ JS :

| Python | JavaScript / TypeScript |
|---|---|
| `pip` / `uv` | `npm` |
| `requirements.txt` / `pyproject.toml` | `package.json` |
| `poetry.lock` | `package-lock.json` |
| `.venv/` | `node_modules/` (local au projet, automatiquement) |
| `python -m module` | `npx commande` |
| `mypy` | `tsc --noEmit` |
| `ruff` | `eslint` (`npx expo lint`) |
| `pytest` | `jest` / `vitest` |

### Mise en place

1. **Variables Android** (dans `~/.zshrc`) :
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
   ```
   Puis `source ~/.zshrc` et vérifie : `adb --version`.

2. **Téléphone** : Paramètres → À propos → appuie 7 fois sur « Numéro de build » → Options développeur → active « Débogage USB ». Branche-le, puis `adb devices` doit le lister.

3. **Créer l'app du fil rouge** :
   ```bash
   cd ~/projects/android-learning
   npx create-expo-app@latest mini-fva
   cd mini-fva
   npx expo start
   ```
   Si le téléphone et le Mac sont sur le même wifi, sur Expo Go, un URL doit apparaître. Si le téléphone est branché en USB au mac,appuie sur `a` dans le terminal Metro.

4. **Lancer l'API simulée** (dans un autre terminal) :
   ```bash
   cd ~/projects/android-learning
   node mock-api/server.mjs
   ```
   Elle affiche l'URL à utiliser depuis ton téléphone (ex : `http://192.168.1.13:4000`). `localhost` sur le téléphone = le téléphone lui-même, pas ton Mac !

> ⚠️ **Expo évolue très vite.** Le template de `create-expo-app` peut différer légèrement de ce que ce cours décrit. Regarde la version de `expo` dans `package.json` et consulte `https://docs.expo.dev/versions/v<major>.0.0/` en cas de doute. FVA utilise **Expo SDK 57**.

### Anatomie d'un projet Expo

```
mini-fva/
├── app.json          ← config de l'app (nom, icône, permissions, plugins)
├── package.json      ← dépendances + scripts
├── tsconfig.json     ← config TypeScript
└── src/app/          ← (ou app/) chaque fichier = un écran (Expo Router)
    └── _layout.tsx   ← le « cadre » de navigation
```

### Exercices

**Ex 1.1** — Lance l'app sur ton téléphone via Expo Go. Modifie le texte de l'écran d'accueil et observe le *Fast Refresh* (sauvegarde ta modification, le changement doit apparaître tout seul).

**Ex 1.2** — Secoue le téléphone (ou `m` dans le terminal) pour ouvrir le **menu développeur**. Explore : Reload, Toggle Performance Monitor, Open JS debugger.

**Ex 1.3** — Démarre l'émulateur Android Studio (Device Manager → créer un "Virtual device" et choisis un Google Pixel récent), puis lance l'app dessus avec `a`.
Tu peux consulter la liste de devices que le Mac détecte avec `adb devices`. Si plusieurs devices sont détectés, pour lancer l'app sur un device spécifique, tape `Shift + a` dans le terminal Metro pour choisir le device. Expo est téléchargé dans le device virtuel, mais les changements dans le code sont appliqués sur chaque device !

**Ex 1.4** — Avec l'API simulée lancée, ouvre dans le navigateur **de ton téléphone** `http://<IP_DU_MAC>:4000/health`. Tu dois voir `{"ok":true}`. Sinon : pare-feu macOS ou Wi-Fi différent.

**Ex 1.5** — Nettoie le template : `npm run reset-project` dans un nouveau terminal (en laissant les autres tourner). La commande nettoie l'app en supprimant la démo (onglets "Home" et "Explore" et leurs composants) pour repartir d'une page blanche. La commande propose de déplacer la démo dans un dossier `example`, ou de la supprimer définitivement. Si tu veux relancer la démo, recrée un projet.
Commit.

<details><summary>Dépannage</summary>

- *QR code ne se connecte pas* : `npx expo start --tunnel`.
- *`adb devices` vide* : câble data (pas seulement charge), accepter l'empreinte RSA sur le téléphone.
- *Health KO depuis le téléphone* : Réglages système → Réseau → Pare-feu → autoriser `node`.
</details>

---

## Module 2 — TypeScript pour un dev Python

Crée un bac à sable :
```bash
mkdir -p ~/projects/android-learning/playground-ts && cd $_
npm init -y && npm i -D typescript tsx @types/node
npx tsc --init
```
Exécute un fichier avec `npx tsx fichier.ts` (comme `python fichier.py`).

### 2.1 Variables et types de base

```ts
const name: string = "Mbappé";   // const = non réassignable (usage par défaut)
let goals = 3;                    // let = réassignable ; type inféré : number
// var : n'utilise JAMAIS (portée bizarre, héritage historique)

// Il n'y a qu'un type numérique : number (int et float confondus)
const rating = 7.5;
const isLive: boolean = true;
const nothing: null = null;       // valeur absente volontaire
let notYet: undefined;            // jamais assigné
```

| Python | TypeScript |
|---|---|
| `None` | `null` **et** `undefined` (deux notions !) |
| `list[int]` | `number[]` ou `Array<number>` |
| `dict[str, int]` | `Record<string, number>` ou `Map<string, number>` |
| `tuple[int, str]` | `[number, string]` |
| `Optional[str]` | `string \| null` ou `string \| undefined` ou `name?: string` |
| `Union[A, B]` | `A \| B` |
| `Literal["a","b"]` | `"a" \| "b"` |
| `f"Hello {x}"` | `` `Hello ${x}` `` |
| `x if c else y` | `c ? x : y` |
| `and / or / not` | `&& / \|\| / !` |
| `==` | `===` (toujours triple égal !) |

### 2.2 Objets, interfaces, types

L'équivalent des `dataclass` / `TypedDict` / modèles Pydantic : **interface** (ou `type`). Seulement à la compilation — aucune validation au runtime.

```ts
interface TeamRef {
  id: number;
  name: string;
  logo?: string;          // optionnel (peut être absent)
}

interface Fixture {
  id: number;
  kickoff: string;        // date ISO
  status: string;
  home: TeamRef;
  away: TeamRef;
  score: { home: number | null; away: number | null };
}

type SummaryStatus = "none" | "pending" | "ready" | "stale" | "failed";

// Héritage d'interface
interface CalendarFixture extends Fixture {
  canSummarize: boolean;
}

const psg: TeamRef = { id: 85, name: "PSG" };
```

Ce sont **exactement** les types de `mobile/src/lib/types.ts` dans FVA. Ouvre-le maintenant et lis-le : tu devrais tout comprendre.

### 2.3 Fonctions

```ts
function scoreLabel(f: Fixture): string {
  if (f.score.home === null) return "vs";
  return `${f.score.home} - ${f.score.away}`;
}

// Fonction fléchée (lambda multi-ligne) — omniprésente en React
const isFinished = (status: string): boolean => ["FT", "AET", "PEN"].includes(status);

// Paramètres par défaut et optionnels
const greet = (who: string, excited = false) => `Salut ${who}${excited ? " !" : "."}`;
```

### 2.4 Collections (tes compréhensions de liste)

```ts
const fixtures: Fixture[] = [/* ... */];

// [f.id for f in fixtures if f.status == "FT"]
const finishedIds = fixtures.filter((f) => f.status === "FT").map((f) => f.id);

// sum(...)
const totalGoals = fixtures.reduce((acc, f) => acc + (f.score.home ?? 0) + (f.score.away ?? 0), 0);

// sorted(fixtures, key=lambda f: f.kickoff)
const sorted = [...fixtures].sort((a, b) => a.kickoff.localeCompare(b.kickoff)); // sort() MUTE le tableau → copie d'abord

// any / all / next
fixtures.some((f) => f.status === "2H");
fixtures.every((f) => f.home.id !== f.away.id);
fixtures.find((f) => f.id === 1001); // Fixture | undefined

// groupby
const byComp = new Map<number, Fixture[]>();
for (const f of fixtures) {                        // for...of (valeurs) ≠ for...in (clés !)
  const list = byComp.get(f.id) ?? [];
  list.push(f);
  byComp.set(f.id, list);
}
```

### 2.5 Déstructuration, spread, opérateurs null-safe

```ts
const { home, away, score } = fixture;            // a, b = ... pour les objets
const [first, ...rest] = fixtures;                 // first, *rest = fixtures

const updated = { ...fixture, status: "FT" };      // {**fixture, "status": "FT"} → copie immuable
const all = [...fixtures, newFixture];

fixture.home?.logo;                // accès sûr : undefined si home est null/undefined
const minute = note.minute ?? 0;   // valeur par défaut SEULEMENT si null/undefined (≠ ||)
```

L'**immuabilité** (créer de nouveaux objets plutôt que muter) est fondamentale en React. Retiens `{...obj, champ: val}` et `[...arr, item]`.

### 2.6 Asynchrone : Promise, async/await

Même concept qu'`asyncio`, mais en JS **tout I/O est asynchrone** et il n'y a pas de `asyncio.run` : la boucle d'évènements tourne toujours.

```ts
async function getHealth(): Promise<{ ok: boolean }> {
  const res = await fetch("http://localhost:4000/health");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Parallèle (asyncio.gather)
const [a, b] = await Promise.all([getHealth(), getHealth()]);

// try / except → try / catch
try {
  await getHealth();
} catch (err) {
  console.error((err as Error).message);
} finally {
  console.log("done");
}
```

### 2.7 Classes, génériques, modules

```ts
// Classe (cf. ApiError dans FVA : mobile/src/lib/api.ts)
export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string) {  // "readonly status" = déclare + assigne l'attribut
    super(code);
  }
  get retryable(): boolean {                                      // @property
    return this.status === 0 || this.status >= 500;
  }
}

// Générique (TypeVar)
async function request<T>(path: string): Promise<T> {
  const res = await fetch(path);
  return (await res.json()) as T;   // "as" = cast, on fait confiance (pas de validation !)
}
const data = await request<{ fixtures: Fixture[] }>("/fixtures");

// Modules : export / import (≈ from x import y)
import { ApiError } from "./api";
import type { Fixture } from "./types";   // import de type uniquement, effacé à la compilation
```

> 💡 En POO Python tu fais beaucoup de classes. En React moderne, on utilise **peu de classes** : des fonctions, des objets simples et des modules. FVA n'a quasiment qu'une classe (`ApiError`).

### Exercices (`playground-ts/`)

Lance l'API simulée pour les exercices 2.4 et 2.5.

**Ex 2.1** — `types.ts` : déclare `TeamRef`, `Competition`, `Fixture`, `Note` (`id, fixtureId, text, minute: number|null, source: "text"|"voice", createdAt`). Crée 4 fixtures en dur.

**Ex 2.2** — `stats.ts` : écris et teste
- `goalsFor(fixtures, teamId): number`
- `results(fixtures, teamId): { W: number; D: number; L: number }` (ignorer les matchs sans score)
- `groupByCompetition(fixtures): Map<number, Fixture[]>`

**Ex 2.3** — Provoque volontairement 3 erreurs de type (mauvais champ, `null` non géré, mauvais littéral de statut) et lis les messages de `npx tsc --noEmit`. Active `"strict": true` dans `tsconfig.json` si ce n'est pas le cas.

**Ex 2.4** — `client.ts` : écris `login(username)` (POST `/auth/login`) puis `getFixtures(token, date)` et affiche « Domicile score Extérieur » pour les matchs du jour.

**Ex 2.5** — Écris `withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T>` avec *backoff* exponentiel. Teste contre `FAIL_RATE=0.5 node mock-api/server.mjs`.

<details><summary>Corrigé Ex 2.2</summary>

```ts
import type { Fixture } from "./types";

export const goalsFor = (fs: Fixture[], teamId: number) =>
  fs.reduce((acc, f) => {
    if (f.home.id === teamId) return acc + (f.score.home ?? 0);
    if (f.away.id === teamId) return acc + (f.score.away ?? 0);
    return acc;
  }, 0);

export function results(fs: Fixture[], teamId: number) {
  const r = { W: 0, D: 0, L: 0 };
  for (const f of fs) {
    const { home, away } = f.score;
    if (home === null || away === null) continue;
    if (f.home.id !== teamId && f.away.id !== teamId) continue;
    const [mine, theirs] = f.home.id === teamId ? [home, away] : [away, home];
    if (mine > theirs) r.W++;
    else if (mine === theirs) r.D++;
    else r.L++;
  }
  return r;
}

export function groupByCompetition(fs: Fixture[]) {
  const m = new Map<number, Fixture[]>();
  for (const f of fs) m.set(f.competition.id, [...(m.get(f.competition.id) ?? []), f]);
  return m;
}
```
</details>

<details><summary>Corrigé Ex 2.4 / 2.5</summary>

```ts
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
```
(`await` au top-level : ajoute `"type": "module"` dans `package.json`.)
</details>

---

## Module 3 — React : composants, props, state

### 3.1 L'idée centrale : UI = f(state)

En data, tu écris des transformations pures : `output = f(input)`. React applique la même idée à l'interface :

> **L'écran est une fonction de l'état.** Tu ne modifies jamais l'écran à la main (« cache ce bouton, change ce texte »). Tu modifies l'**état**, et React recalcule l'écran puis applique le diff minimal.

C'est **déclaratif** (comme SQL : tu décris *quoi*, pas *comment*), par opposition à impératif.

### 3.2 Composant & JSX

Un composant = une **fonction** qui retourne du JSX (une syntaxe type HTML dans le TS ; fichiers `.tsx`).

```tsx
import { Text, View } from "react-native";

export function ScoreBadge() {
  return (
    <View>
      <Text>2 - 1</Text>
    </View>
  );
}
```

Règles JSX :
- Nom de composant en **PascalCase**.
- Une seule racine (ou fragment `<>...</>`).
- Expressions TS entre `{}` : `<Text>{home.name}</Text>`.
- Pas de `if` dans le JSX → ternaire `{live ? <LiveDot/> : null}` ou `{live && <LiveDot/>}`.
- Boucles → `.map()` avec une `key` unique : `{notes.map((n) => <NoteRow key={n.id} note={n} />)}`.

### 3.3 Props : les paramètres d'un composant

```tsx
interface MatchRowProps {
  fixture: Fixture;
  onPress?: (id: number) => void;   // callback : l'enfant remonte un évènement au parent
}

export function MatchRow({ fixture, onPress }: MatchRowProps) {
  const { home, away, score } = fixture;
  return (
    <Pressable onPress={() => onPress?.(fixture.id)}>
      <Text>{home.name} {score.home ?? "-"} - {score.away ?? "-"} {away.name}</Text>
    </Pressable>
  );
}

// Usage
<MatchRow fixture={f} onPress={(id) => console.log(id)} />
```

Les props sont **en lecture seule**. Les données descendent (parent → enfant), les évènements remontent (callbacks).

### 3.4 State : `useState`

```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);         // valeur + setter
  return (
    <Pressable onPress={() => setCount((c) => c + 1)}>
      <Text>Buts : {count}</Text>
    </Pressable>
  );
}
```

- Appeler `setCount` **re-exécute** la fonction du composant (un *render*) avec la nouvelle valeur.
- Jamais de mutation directe : `list.push(x)` ne déclenche rien. Fais `setList((cur) => [...cur, x])`.
- Utilise la forme fonctionnelle `set(cur => ...)` quand la nouvelle valeur dépend de l'ancienne.

Exemple réel dans FVA (`src/app/(tabs)/index.tsx`) :
```tsx
const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
const toggle = (id: number) =>
  setCollapsed((cur) => {
    const next = new Set(cur);   // copie → nouvel objet → React voit le changement
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
```

### 3.5 Effets : `useEffect`

Pour synchroniser avec l'extérieur (timer, abonnement, log). **Pas** pour charger des données (on utilisera React Query).

```tsx
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);   // nettoyage (comme un context manager __exit__)
}, []);                              // tableau de dépendances : [] = au montage seulement
```

### 3.6 Valeurs dérivées : `useMemo`

Ne stocke pas en state ce qui peut être **calculé** depuis le state ou les props (comme une vue SQL vs une table dupliquée).

```tsx
const liveCount = useMemo(() => fixtures.filter(isLive).length, [fixtures]);
```

### Exercices (dans `mini-fva/`)

**Ex 3.1** — Crée `src/components/MatchRow.tsx` qui affiche une fixture en dur. Affiche-le 3 fois dans l'écran d'accueil avec `.map()`.

**Ex 3.2** — Ajoute une prop `highlight?: boolean` qui met le texte en gras.

**Ex 3.3** — Crée un `GoalCounter` avec deux boutons « + domicile » / « + extérieur » et un bouton « reset ».

**Ex 3.4** — Crée un chronomètre de match (`MatchClock`) : démarre à 0', +1 toutes les secondes (accéléré), bouton pause/reprise. Nettoie bien l'intervalle.

**Ex 3.5** — Liste de 6 fixtures en dur + filtre « Tous / En direct / Terminés » (state) ; le compteur affiché est dérivé avec `useMemo`.

<details><summary>Corrigé Ex 3.4</summary>

```tsx
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export function MatchClock() {
  const [minute, setMinute] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setMinute((m) => Math.min(m + 1, 90)), 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <View>
      <Text style={{ fontSize: 32 }}>{minute}'</Text>
      <Pressable onPress={() => setRunning((r) => !r)}>
        <Text>{running ? "Pause" : "Démarrer"}</Text>
      </Pressable>
    </View>
  );
}
```
</details>

---

## Module 4 — React Native : vues, listes, styles

### 4.1 Composants de base (et leur équivalent Android)

| React Native | Android natif | Rôle |
|---|---|---|
| `View` | `ViewGroup` | conteneur (div) |
| `Text` | `TextView` | **tout** texte doit être dans un `<Text>` |
| `Image` / `expo-image` | `ImageView` | images (FVA utilise `expo-image` pour le cache) |
| `Pressable` | clickable View | zone tactile |
| `TextInput` | `EditText` | saisie |
| `ScrollView` | `ScrollView` | défilement (rend **tout** d'un coup) |
| `FlatList` / `SectionList` | `RecyclerView` | listes **virtualisées** (ne rend que le visible) |
| `ActivityIndicator` | `ProgressBar` | spinner |
| `Switch` | `Switch` | interrupteur |

Règle : liste de taille inconnue ou longue → `FlatList`/`SectionList`, jamais `ScrollView` + `.map()`.

### 4.2 Styles & Flexbox

Pas de CSS, mais des objets JS ; pas d'unités (densité-indépendant, `dp`).

```tsx
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",          // par défaut "column" (≠ web)
    alignItems: "center",          // axe secondaire
    justifyContent: "space-between", // axe principal
    padding: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  team: { flex: 1, fontSize: 16 },  // flex: 1 = prend l'espace restant
  score: { fontWeight: "700", fontVariant: ["tabular-nums"] },
});

<View style={styles.row}>
  <Text style={styles.team}>PSG</Text>
  <Text style={[styles.score, live && { color: "red" }]}>2 - 1</Text>   {/* tableau = fusion */}
  <Text style={[styles.team, { textAlign: "right" }]}>OM</Text>
</View>
```

Joue avec [Flexbox Froggy](https://flexboxfroggy.com/) (15 min) pour intuiter `justifyContent`/`alignItems`.

### 4.3 Listes

```tsx
<FlatList
  data={fixtures}
  keyExtractor={(f) => String(f.id)}
  renderItem={({ item }) => <MatchRow fixture={item} />}
  ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#eee" }} />}
  ListEmptyComponent={<Text>Aucun match</Text>}
  refreshing={isRefetching}
  onRefresh={refetch}            // pull-to-refresh
/>
```

`SectionList` = liste groupée (FVA groupe les matchs par compétition). Données : `[{ title, data: [...] }, ...]`.

### 4.4 Thème clair/sombre & zones sûres

```tsx
import { useColorScheme } from "react-native";
const scheme = useColorScheme(); // "light" | "dark"
```
FVA centralise couleurs et espacements dans `src/lib/theme.ts` (`useTheme()`, `space`, `radius`). Et `react-native-safe-area-context` évite l'encoche / la barre de navigation.

### 4.5 Saisie

```tsx
const [text, setText] = useState("");
<TextInput
  value={text}
  onChangeText={setText}        // composant « contrôlé » : l'état est la source de vérité
  placeholder="Ta note…"
  multiline
  maxLength={2000}
/>
```

### Exercices

**Ex 4.1** — Reproduis un `MatchRow` propre : logo (placeholder rond), nom domicile, score centré, nom extérieur ; point rouge + minute si `status === "2H"`.

**Ex 4.2** — Écran d'accueil : `SectionList` groupée par compétition, avec des données en dur (copie la sortie de `curl` de l'API simulée dans `src/data/fixtures.json`).

**Ex 4.3** — Rends les en-têtes de section cliquables pour replier/déplier (inspire-toi du `toggle` de FVA).

**Ex 4.4** — Crée `src/lib/theme.ts` avec des couleurs light/dark et un hook `useTheme()`. Passe ton téléphone en mode sombre pour tester.

**Ex 4.5** — Composant `NoteComposer` : `TextInput` multi-lignes + champ minute numérique (`keyboardType="number-pad"`) + bouton « Ajouter » désactivé si texte vide. Les notes s'affichent en dessous (state local).

<details><summary>Corrigé Ex 4.4</summary>

```ts
import { useColorScheme } from "react-native";

const palettes = {
  light: { bg: "#fff", text: "#111", muted: "#666", card: "#f4f4f5", accent: "#2563eb", live: "#dc2626" },
  dark: { bg: "#0b0b0c", text: "#f4f4f5", muted: "#a1a1aa", card: "#18181b", accent: "#60a5fa", live: "#f87171" },
};
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const useTheme = () => palettes[useColorScheme() === "dark" ? "dark" : "light"];
```
</details>

---

## Module 5 — Navigation avec Expo Router

### 5.1 Routing basé sur les fichiers

Comme un serveur web statique : **l'arborescence de `src/app/` = les URL de l'app**.

```
src/app/
├── _layout.tsx          → navigateur racine (Stack)
├── sign-in.tsx          → /sign-in
├── (tabs)/              → groupe (entre parenthèses = n'apparaît pas dans l'URL)
│   ├── _layout.tsx      → barre d'onglets
│   ├── index.tsx        → /           (onglet Matchs)
│   └── notes.tsx        → /notes      (onglet Notes)
├── match/[id].tsx       → /match/1001 (route dynamique)
└── team/[id].tsx        → /team/85
```

C'est **exactement** la structure de FVA.

### 5.2 Layouts

```tsx
// src/app/_layout.tsx — Stack = écrans empilés (bouton retour)
import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="match/[id]" options={{ title: "Match" }} />
    </Stack>
  );
}
```

```tsx
// src/app/(tabs)/_layout.tsx — onglets en bas
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Matchs", tabBarIcon: ({ color, size }) => <Ionicons name="football" color={color} size={size} /> }} />
      <Tabs.Screen name="notes" options={{ title: "Mes notes", tabBarIcon: ({ color, size }) => <Ionicons name="book" color={color} size={size} /> }} />
    </Tabs>
  );
}
```

### 5.3 Naviguer & lire les paramètres

```tsx
import { Link, router, useLocalSearchParams } from "expo-router";

<Link href={`/match/${f.id}`}>Voir</Link>          // déclaratif
router.push(`/match/${f.id}`);                      // impératif (dans un onPress)
router.back();

// dans match/[id].tsx
const { id } = useLocalSearchParams<{ id: string }>();  // toujours des strings !
const fixtureId = Number(id);
```

### 5.4 Redirections (garde d'authentification)

```tsx
import { Redirect } from "expo-router";
if (!user) return <Redirect href="/sign-in" />;
```

### Exercices

**Ex 5.1** — Mets en place la structure : onglets « Matchs » et « Mes notes », écran `match/[id]`.

**Ex 5.2** — Cliquer sur un `MatchRow` ouvre `match/[id]` qui affiche l'id et le titre « Domicile vs Extérieur » (en cherchant dans le JSON en dur).

**Ex 5.3** — Change dynamiquement le titre du header avec `<Stack.Screen options={{ title: ... }} />` dans l'écran.

**Ex 5.4** — Ajoute `team/[id].tsx` ; dans l'écran match, les noms d'équipes sont des `Link` vers leur page.

**Ex 5.5** — Ajoute un écran modal `about` (`presentation: "modal"`) ouvert depuis un bouton du header.

**Ex 5.6 (lecture)** — Ouvre `football-view-aggregator/mobile/src/app/` et dessine l'arbre de navigation de FVA sur papier. Quel fichier gère la redirection vers `sign-in` ?

---

## Module 6 — Hooks avancés & architecture du code

### 6.1 Règles des hooks
1. Appelés **au top-level** du composant (jamais dans un `if` / une boucle).
2. Appelés **uniquement** depuis un composant ou un autre hook.
3. Nom en `useXxx`.

### 6.2 Hooks personnalisés = fonctions réutilisables avec état

```tsx
export function useToggleSet<T>() {
  const [set, setSet] = useState<Set<T>>(new Set());
  const toggle = useCallback((v: T) => setSet((cur) => {
    const next = new Set(cur);
    next.has(v) ? next.delete(v) : next.add(v);
    return next;
  }), []);
  return { set, toggle, has: (v: T) => set.has(v) };
}
```

### 6.3 Context : état global léger (« dependency injection »)

```tsx
const AuthContext = createContext<{ user: string | null; signOut: () => void } | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  return <AuthContext.Provider value={{ user, signOut: () => setUser(null) }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```
C'est ce que fait `mobile/src/lib/auth.tsx`.

### 6.4 `useSyncExternalStore` : brancher un store non-React

L'outbox de FVA vit hors de React (module avec des `listeners`) et est exposée via `useSyncExternalStore(subscribe, getSnapshot)`. Pattern *observer* classique — tu le reverras au module 9.

### 6.5 Organisation du code (convention FVA)

```
src/app/         écrans uniquement (routes)
src/components/  composants UI réutilisables (MatchRow, Dropdown, ui.tsx…)
src/lib/         logique sans UI : api, queries, auth, outbox, types, format, theme
```
Analogie data : `app/` = couche présentation (dashboards), `lib/` = couche service/DAO, `types.ts` = schéma.

### Exercices

**Ex 6.1** — Extrais `useToggleSet` et utilise-le pour les sections repliables.

**Ex 6.2** — Crée `src/lib/format.ts` : `dayLabel(date)` (« Aujourd'hui », « Demain », « Hier », sinon « sam. 27 sept. » via `Intl.DateTimeFormat("fr-FR", …)`), `kickoffTime(iso)` → « 21:00 ».

**Ex 6.3** — Sélecteur de dates horizontal J-2..J+7 (comme FVA) en haut de l'écran Matchs, filtrant les données en dur.

**Ex 6.4** — Crée un `FavoritesContext` (équipes favorites, `Set<number>`) ; étoile sur l'écran équipe ; les matchs des favoris sont surlignés dans la liste.

---

## Module 7 — Données distantes : fetch + React Query

### 7.1 Le problème

Charger des données « à la main » demande : état loading, état erreur, retry, cache, dédoublonnage, rafraîchissement au retour sur l'app, invalidation après écriture… **TanStack React Query** gère tout ça. Pense-le comme une **couche de cache** entre ton UI et l'API, avec des clés (comme des clés Redis).

### 7.2 Configuration de l'app

```bash
npx expo install @tanstack/react-query
```

```ts
// src/lib/config.ts — l'URL change selon l'environnement
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.13:4000";
```
Fichier `.env` à la racine de `mini-fva/` : `EXPO_PUBLIC_API_URL=http://<IP_DU_MAC>:4000` (les variables `EXPO_PUBLIC_*` sont injectées dans le bundle → **jamais de secret dedans**).

```tsx
// src/app/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}
```

### 7.3 Client API typé (pattern FVA)

```ts
// src/lib/api.ts
export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string) { super(code); }
}

let token: string | null = null;
export const setToken = (t: string | null) => { token = t; };

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(0, "network_error");        // pas de réseau
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => undefined);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? "http_error");
  return data as T;
}

export const api = {
  fixtures: (date: string) => request<{ date: string; fixtures: CalendarFixture[] }>("GET", `/fixtures?date=${date}`),
  fixture: (id: number) => request<{ fixture: CalendarFixture; summary: MatchSummary | null }>("GET", `/fixtures/${id}`),
  notes: (fid: number) => request<{ notes: Note[] }>("GET", `/fixtures/${fid}/notes`),
  putNote: (fid: number, id: string, body: NoteUpsert) => request<{ note: Note }>("PUT", `/fixtures/${fid}/notes/${id}`, body),
  deleteNote: (fid: number, id: string) => request<void>("DELETE", `/fixtures/${fid}/notes/${id}`),
};
```
Compare avec `mobile/src/lib/api.ts` de FVA : c'est la même chose, avec en plus timeout, refresh du token sur 401, et un mode démo.

### 7.4 Lecture : `useQuery`

```ts
// src/lib/queries.ts
export const useFixtures = (date: string) =>
  useQuery({
    queryKey: ["fixtures", date],          // clé de cache — change la date → nouvelle requête
    queryFn: () => api.fixtures(date),
    refetchInterval: (q) => (q.state.data?.fixtures.some(isLive) ? 30_000 : false), // polling si live
  });
```
```tsx
const { data, isLoading, isError, refetch, isRefetching } = useFixtures(date);
if (isLoading) return <ActivityIndicator />;
if (isError) return <ErrorState onRetry={refetch} />;
```

### 7.5 Écriture : `useMutation` + invalidation

```ts
export function useAddNote(fixtureId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { text: string; minute: number | null }) =>
      api.putNote(fixtureId, newId(), { ...input, source: "text", createdAt: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes", fixtureId] });   // re-fetch la liste
      qc.invalidateQueries({ queryKey: ["fixtures"] });           // compteur de notes
    },
  });
}
```

**Mise à jour optimiste** : afficher la note *avant* la réponse serveur (`onMutate` → `setQueryData`, `onError` → rollback). C'est l'expérience « instantanée » qu'on attend d'une app mobile.

### 7.6 Polling d'un job asynchrone

Le résumé IA de FVA est généré de façon asynchrone (Lambda + Bedrock). L'API simulée reproduit ça : `POST /summary` → `pending` pendant 4 s → `ready`.
```ts
useQuery({
  queryKey: ["summary", fid],
  queryFn: () => api.summary(fid),
  refetchInterval: (q) => (q.state.data?.status === "pending" ? 1500 : false),
});
```

### Exercices (API simulée lancée ; pour l'instant, récupère un token avec `curl` et mets-le en dur via `setToken`)

**Ex 7.1** — Remplace les données en dur de l'écran Matchs par `useFixtures(date)`. Gère loading / erreur / vide.

**Ex 7.2** — Relance l'API avec `LATENCY_MS=2000` : observe le spinner, puis change de date et reviens → la donnée en cache s'affiche instantanément. Pourquoi ?

**Ex 7.3** — Pull-to-refresh sur la liste.

**Ex 7.4** — Écran match : infos + liste des notes (`useNotes`) + `NoteComposer` branché sur `useAddNote`. Bouton supprimer (appui long → `Alert.alert` de confirmation).

**Ex 7.5** — Rends l'ajout de note **optimiste**. Teste avec `LATENCY_MS=3000` puis avec `FAIL_RATE=1` (la note doit disparaître et une erreur s'afficher).

**Ex 7.6** — Bouton « Générer le résumé » (visible si `canSummarize`) + polling jusqu'à `ready` + affichage du texte.

**Ex 7.7** — Onglet « Mes notes » : liste `/me/matches`, cliquable vers le match.

<details><summary>Corrigé Ex 7.5</summary>

```ts
export function useAddNote(fixtureId: number) {
  const qc = useQueryClient();
  const key = ["notes", fixtureId];
  return useMutation({
    mutationFn: (note: Note) => api.putNote(fixtureId, note.id, note),
    onMutate: async (note) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<{ notes: Note[] }>(key);
      qc.setQueryData<{ notes: Note[] }>(key, (old) => ({ notes: [...(old?.notes ?? []), note] }));
      return { previous };
    },
    onError: (_err, _note, ctx) => qc.setQueryData(key, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
// Appel : mutate({ id: newId(), fixtureId, text, minute, source: "text", createdAt: now, updatedAt: now })
// newId() : Crypto.randomUUID() de expo-crypto
```
Point clé : c'est le **client** qui génère l'id → le `PUT` est **idempotent** (rejouable sans doublon). Exactement comme un `MERGE`/upsert en data engineering.
</details>

---

## Module 8 — Authentification & stockage sécurisé

### 8.1 Théorie

- **Où stocker un token ?** Jamais en clair (`AsyncStorage` = fichier non chiffré). Utilise **`expo-secure-store`** : Android **Keystore** (clé matérielle) / iOS Keychain.
- **FVA** utilise **Cognito** (AWS) via OAuth2 **Authorization Code + PKCE** (`expo-auth-session`) : l'app ouvre la page de login hébergée dans un navigateur sécurisé, récupère un *code*, l'échange contre des tokens (access + refresh). L'access token expire (~1 h) → on le rafraîchit avec le refresh token (cf. `getAccessToken(true)` sur 401 dans `api.ts`).
- Ton expérience AWS : c'est le même Cognito User Pool que tu provisionnes en Terraform dans `infra/`.

L'API simulée fait plus simple : `POST /auth/login` renvoie un token.

### 8.2 Flux dans l'app

```
démarrage → lire token dans SecureStore
         → absent ? <Redirect href="/sign-in" />
         → présent ? afficher (tabs)
login     → POST /auth/login → SecureStore.setItemAsync → setUser
logout    → SecureStore.deleteItemAsync → queryClient.clear() → /sign-in
401 API   → déconnexion automatique
```

```ts
import * as SecureStore from "expo-secure-store";
await SecureStore.setItemAsync("token", accessToken);
const t = await SecureStore.getItemAsync("token");   // string | null
await SecureStore.deleteItemAsync("token");
```

### Exercices

**Ex 8.1** — `npx expo install expo-secure-store`. Écris `src/lib/auth.tsx` : `AuthProvider` (état `status: "loading" | "signedOut" | "signedIn"`), `signIn(username, password)`, `signOut()`, hook `useAuth()`.

**Ex 8.2** — Écran `sign-in.tsx` (champs + bouton + erreur). Garde dans le layout racine : redirection selon `status`. Pendant `"loading"`, garde le splash screen (`expo-splash-screen`).

**Ex 8.3** — Écran `account.tsx` : nom de l'utilisateur + bouton « Se déconnecter » qui vide aussi le cache React Query (sinon l'utilisateur suivant verrait les données du précédent !).

**Ex 8.4** — Redémarre l'API simulée (les tokens sont en mémoire → invalidés). Fais en sorte qu'un 401 déconnecte proprement l'utilisateur.

**Ex 8.5 (lecture)** — Lis `mobile/src/lib/auth.tsx` de FVA. Repère : PKCE, stockage des tokens, rafraîchissement, et mode démo.

---

## Module 9 — Offline-first : SQLite & outbox

Le module le plus proche de ton métier. Au stade, le Wi-Fi saute : **aucune note ne doit être perdue**.

### 9.1 Le pattern *Transactional Outbox* (version mobile)

```
Utilisateur écrit une note
      │
      ▼
① INSERT dans SQLite local (table outbox)   ← durable immédiatement
      │
      ▼
② UI mise à jour (la note apparaît, « en attente »)
      │
      ▼
③ worker de synchro : pour chaque ligne → PUT idempotent vers l'API
      ├─ succès          → DELETE de la ligne
      ├─ erreur retryable (0, 408, 429, 5xx) → attempts++, retry plus tard (backoff)
      └─ erreur définitive (400, 404…)       → marquer en échec, montrer à l'utilisateur
Déclencheurs : démarrage, retour au premier plan (AppState), retour du réseau, après chaque ajout
```

Tu reconnais : **file d'attente + at-least-once + idempotence (clé = note_id) + dead letter**. C'est un mini-pipeline d'ingestion.

### 9.2 `expo-sqlite`

```ts
import * as SQLite from "expo-sqlite";

const db = await SQLite.openDatabaseAsync("outbox.db");
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS outbox (
    note_id    TEXT PRIMARY KEY NOT NULL,
    fixture_id INTEGER NOT NULL,
    op         TEXT NOT NULL,          -- JSON de l'opération
    attempts   INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    queued_at  INTEGER NOT NULL
  );
`);
await db.runAsync(
  "INSERT OR REPLACE INTO outbox (note_id, fixture_id, op, queued_at) VALUES (?, ?, ?, ?)",
  noteId, fixtureId, JSON.stringify(op), Date.now(),
);
const rows = await db.getAllAsync<{ note_id: string; op: string; attempts: number }>(
  "SELECT * FROM outbox ORDER BY queued_at",
);
```

`INSERT OR REPLACE` sur `note_id` = **coalescence** : si on édite 3 fois une note hors-ligne, on n'envoie que la dernière version. Toujours des paramètres `?` (injection SQL, comme en Python).

FVA va plus loin : base **chiffrée** (SQLCipher) avec une clé aléatoire stockée dans SecureStore (voir le début de `mobile/src/lib/outbox.ts`).

### 9.3 Exposer le store à React

```ts
let items: OutboxItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useOutbox() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => items,
  );
}
```

### 9.4 Fusionner serveur + local à l'affichage

Notes affichées = notes serveur (React Query) **∪** notes en attente (outbox), dédupliquées par id, l'outbox gagnant. Une icône « nuage barré » pour les notes non synchronisées.

### Exercices

**Ex 9.1** — `npx expo install expo-sqlite`. Crée `src/lib/outbox.ts` : `enqueueUpsert(note)`, `enqueueDelete(fixtureId, noteId)`, `list()`, `useOutbox()`.

**Ex 9.2** — Écris `flush()` : envoie séquentiellement, supprime en cas de succès, incrémente `attempts` sinon. Empêche deux `flush` simultanés (un simple booléen / une promesse en cours).

**Ex 9.3** — Déclenche `flush()` : au démarrage, après chaque `enqueue`, et au retour au premier plan (`AppState.addEventListener("change", …)`). Après un flush réussi, invalide les requêtes React Query concernées.

**Ex 9.4** — Branche le `NoteComposer` sur l'outbox au lieu de `useAddNote`. Affiche l'état « en attente » par note.

**Ex 9.5 — le test ultime** : mode avion sur le téléphone, écris 3 notes, modifie-en une, supprimes-en une, tue l'app, rallume-la, désactive le mode avion. Résultat attendu côté API (`curl`) : exactement 2 notes, la bonne version.

**Ex 9.6** — Lance l'API avec `FAIL_RATE=0.7` : vérifie que tout finit par passer. Ajoute un backoff exponentiel basé sur `attempts`.

**Ex 9.7 (lecture)** — Lis `mobile/src/lib/outbox.ts` en entier. Liste 3 différences avec ta version et explique pourquoi elles existent.

---

## Module 10 — APIs natives : haptique, voix, permissions

### 10.1 Permissions Android

Deux niveaux :
1. **Déclarées** dans le manifeste (générées depuis `app.json` → `android.permissions` ou par les *config plugins*).
2. **Demandées au runtime** pour les permissions « dangereuses » (micro, localisation, caméra…) : popup système, l'utilisateur peut refuser → ton UI doit gérer le refus.

```json
// app.json
{ "expo": { "plugins": [["expo-speech-recognition", { "microphonePermission": "Dicte tes notes pendant le match" }]] } }
```

### 10.2 Haptique

```ts
import * as Haptics from "expo-haptics";
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);          // petit « tac »
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

### 10.3 Reconnaissance vocale

FVA dicte les notes avec `expo-speech-recognition` (reconnaissance on-device). Ce module contient du code natif → **ne marche pas dans Expo Go** → il faut un **development build** :

```bash
npx expo install expo-dev-client expo-speech-recognition
npx expo run:android          # compile localement avec le SDK Android d'Android Studio, installe sur le téléphone USB
```
C'est la première fois que le dossier `android/` est généré : jette-y un œil (sans le modifier !). Tu verras du Kotlin (`MainActivity.kt`, `MainApplication.kt`) et du Gradle.

> ⚠️ API à vérifier dans la doc de la version installée — consulte le README du paquet et `mobile/src/components/NoteComposer.tsx` pour l'usage réel dans FVA.

### Exercices

**Ex 10.1** — Vibration légère à l'ajout d'une note, vibration « succès » quand un flush de l'outbox réussit.

**Ex 10.2** — Crée ton premier development build (`npx expo run:android`). Compare la taille / l'icône avec Expo Go.

**Ex 10.3** — Bouton micro dans `NoteComposer` : demande la permission, dicte en `fr-FR`, remplit le champ, `source: "voice"`. Gère le refus de permission (message + lien vers les réglages via `Linking.openSettings()`).

**Ex 10.4** — Personnalise `app.json` : nom, icône, couleur du splash, `android.package` (`com.thomas.minifva`). Rebuild.

---

## Module 11 — Qualité : lint, typecheck, tests, debug

### 11.1 Les commandes à lancer avant chaque commit (comme `ruff` + `mypy` + `pytest`)

```bash
npx tsc --noEmit        # typecheck
npx expo lint           # lint
npx expo-doctor         # cohérence des versions de dépendances
npx expo install --fix  # réparer les versions incompatibles
```

### 11.2 Tests

- **Logique pure** (`format.ts`, `stats`, fusion outbox/serveur) : tests unitaires Jest (`jest-expo` preset). C'est là que se trouve le meilleur ratio valeur/effort.
- **Composants** : `@testing-library/react-native` (rendre, trouver par texte, appuyer, vérifier).
- **E2E** : Maestro (scénarios YAML qui pilotent le vrai téléphone).

```ts
// src/lib/__tests__/format.test.ts
import { dayLabel } from "../format";
test("today", () => {
  expect(dayLabel(new Date().toISOString().slice(0, 10))).toBe("Aujourd'hui");
});
```

### 11.3 Debug

- **Menu dev** → *Open JS debugger* : breakpoints, console, onglet réseau (React Native DevTools).
- `console.log` s'affiche dans le terminal Metro.
- **Logcat** (Android Studio ou `adb logcat`) : crashs natifs.
- **React Query Devtools** / logs de l'API simulée pour voir les requêtes.
- Écran rouge (*RedBox*) = erreur JS avec stack trace cliquable.

### Exercices

**Ex 11.1** — Installe `jest-expo` et teste `format.ts` et la fonction de fusion notes serveur + outbox (au moins 5 cas, dont doublons et suppressions en attente).

**Ex 11.2** — Test de composant : `NoteComposer` — bouton désactivé si vide, `onSubmit` appelé avec le bon texte.

**Ex 11.3** — Pose un breakpoint dans `flush()` avec le debugger et inspecte les variables pendant une synchro.

**Ex 11.4** — Crée `.github/workflows/ci.yml` qui lance typecheck + lint + tests sur chaque push (tu connais GitHub Actions ; regarde `football-view-aggregator/.github/` pour t'inspirer).

---

## Module 12 — Build & déploiement : EAS, OTA, Play Store

### 12.1 Types de builds

| Profil (`eas.json`) | Usage | Format |
|---|---|---|
| `development` | contient le client de dev, se connecte à Metro | APK |
| `preview` | test interne, installation directe | APK |
| `production` | Play Store | AAB (signé) |

### 12.2 EAS Build (dans le cloud — comme un CodeBuild)

```bash
npm i -g eas-cli        # ou npx eas-cli@latest
eas login
eas build:configure     # crée eas.json
eas build --platform android --profile preview
```
EAS gère la **keystore** de signature Android (la perdre = ne plus pouvoir mettre à jour l'app sur le Store ; EAS la conserve pour toi). Regarde `mobile/eas.json` de FVA.

Alternative locale : `npx expo run:android --variant release`.

### 12.3 Mises à jour OTA (`eas update`)

Le bundle JS peut être remplacé à distance **sans nouveau build**, tant que le code natif ne change pas (pas de nouveau module natif, pas de changement de permission). Concept de **runtime version** : un update n'est livré qu'aux binaires compatibles.

```bash
eas update --branch preview --message "fix: tri des matchs"
```

### 12.4 Play Store (aperçu)

Compte développeur Google Play (frais unique) → créer l'app → piste de test interne → upload de l'AAB (`eas submit -p android`) → fiche Store, politique de confidentialité (FVA : export et suppression de compte = obligations RGPD/Play), formulaire *Data safety*.

### 12.5 Environnements

Variables `EXPO_PUBLIC_*` par profil dans `eas.json` (`env`), ou `app.config.ts` dynamique. Rappel : tout ce qui est dans le bundle est lisible par n'importe qui → **les secrets restent côté backend** (d'où les appels Bedrock côté Lambda dans FVA, jamais depuis l'app).

### Exercices

**Ex 12.1** — Build `preview` avec EAS et installe l'APK sur ton téléphone via le lien/QR.

**Ex 12.2** — Configure `expo-updates`, publie un update OTA qui change un texte, vérifie qu'il arrive sur l'APK installé (relancer l'app deux fois).

**Ex 12.3** — Deux profils avec deux URL d'API différentes (IP locale / une URL factice) et vérifie laquelle est utilisée.

**Ex 12.4 (réflexion)** — Liste les changements qui **exigent** un nouveau build natif vs ceux qui passent en OTA.

---

## Module 13 — Visite guidée de football-view-aggregator

Tu as maintenant tout le vocabulaire. Place-toi dans `~/projects/football-view-aggregator/mobile`.

### 13.1 Carte du code

| Fichier | Rôle | Module du cours |
|---|---|---|
| `app.json`, `eas.json` | config native, profils de build | 1, 10, 12 |
| `src/app/_layout.tsx` | providers (Query, Auth), Stack, garde d'auth | 5, 7, 8 |
| `src/app/(tabs)/_layout.tsx` | onglets | 5 |
| `src/app/(tabs)/index.tsx` | calendrier J-2..J+7, SectionList par compétition, live en premier | 4, 6, 7 |
| `src/app/(tabs)/notes.tsx` | journal : matchs / équipes / joueurs, par saison | 7 |
| `src/app/match/[id].tsx` | détail, notes, résumé IA | 5, 7, 9 |
| `src/app/team/[id].tsx`, `player/[id].tsx` | historique d'une entité | 5, 7 |
| `src/app/sign-in.tsx`, `account.tsx` | login Cognito, export RGPD, suppression | 8 |
| `src/components/NoteComposer.tsx` | saisie texte + voix | 4, 10 |
| `src/components/MatchRow.tsx`, `ui.tsx`, `Dropdown.tsx` | UI réutilisable | 3, 4 |
| `src/lib/types.ts` | contrat d'API (miroir du backend) | 2 |
| `src/lib/api.ts` | client HTTP, `ApiError`, mode démo | 7 |
| `src/lib/demo.ts` | faux backend en mémoire (même contrat, vérifié au typecheck) | 2, 7 |
| `src/lib/queries.ts` | hooks React Query | 7 |
| `src/lib/auth.tsx` | OAuth PKCE, tokens, refresh | 8 |
| `src/lib/outbox.ts`, `ulid.ts` | offline-first, IDs triables | 9 |
| `src/lib/format.ts`, `theme.ts`, `config.ts` | utilitaires | 4, 6, 7 |

### 13.2 Parcours de lecture conseillé

1. `types.ts` → `api.ts` → `demo.ts` (remarque l'astuce `AssertDemoContract` : le compilateur garantit que le faux backend respecte le vrai contrat).
2. `queries.ts` : liste chaque `queryKey` et quand elle est invalidée.
3. `_layout.tsx` racine : ordre des providers.
4. `(tabs)/index.tsx` : retrouve `useState`, `useMemo`, `SectionList`, `useFixtures`.
5. `match/[id].tsx` + `NoteComposer.tsx` + `outbox.ts` : suis une note du doigt jusqu'à DynamoDB (côté backend : `backend/src/`).

### 13.3 Lancer FVA en mode démo

Lis `src/lib/config.ts` pour voir comment le mode démo s'active, puis :
```bash
cd ~/projects/football-view-aggregator/mobile
npm install
npx expo run:android      # development build (modules natifs)
```

### Exercices sur la vraie app (fais une branche : `git switch -c learning/<exo>`)

**Ex 13.1** — Ajoute dans `format.ts` une fonction testée et utilise-la pour afficher « il y a 5 min » sur la dernière note d'un match.

**Ex 13.2** — Dans l'écran Matchs, ajoute un badge avec le nombre total de matchs en direct dans le header.

**Ex 13.3** — Ajoute un filtre « Seulement mes matchs notés » (`my !== null`) persistant pendant la session.

**Ex 13.4** — Ajoute un champ au contrat (ex. `Note.pinned?: boolean`) : modifie `backend/src/domain/types.ts`, `mobile/src/lib/types.ts`, `demo.ts` ; constate que le typecheck t'indique tous les endroits à adapter.

**Ex 13.5** — Lance `npx tsc --noEmit && npx expo lint` puis ouvre une PR avec ta branche.

**Ex 13.6 (synthèse)** — Écris dans `android-learning/NOTES-FVA.md` un schéma du trajet d'une note : doigt → `NoteComposer` → outbox SQLite → `PUT` → API Gateway → Lambda → DynamoDB → résumé Bedrock → polling → écran.

---

## Bonus — Kotlin & Android natif

Objectif : comprendre ce que React Native génère pour toi, et savoir écrire un petit module natif si un jour une librairie manque.

### B.1 Kotlin pour un dev Python

```kotlin
val name: String = "Mbappé"          // val = const, var = let
var goals = 3
val logo: String? = null              // nullabilité dans le type (comme TS strict)
val len = logo?.length ?: 0           // ?. et ?: (≈ ?. et ??)

data class TeamRef(val id: Int, val name: String, val logo: String? = null)   // ≈ @dataclass(frozen=True)
val psg = TeamRef(85, "PSG")
val copy = psg.copy(name = "Paris SG")                                        // ≈ dataclasses.replace

fun scoreLabel(home: Int?, away: Int?): String =
    if (home == null) "vs" else "$home - $away"

val finished = fixtures.filter { it.status == "FT" }.map { it.id }            // it = paramètre implicite

sealed interface Status { data object Live : Status; data class Finished(val score: String) : Status }
when (s) { is Status.Live -> "🔴"; is Status.Finished -> s.score }            // match/case exhaustif

suspend fun load(): List<Fixture> = api.fixtures()                             // coroutines ≈ async/await
```

### B.2 Les briques d'une app Android native

| Concept | Rôle | Équivalent RN/Expo |
|---|---|---|
| `AndroidManifest.xml` | déclaration app, permissions, activités | `app.json` |
| **Activity** | un écran/point d'entrée avec un cycle de vie (`onCreate`, `onPause`…) | RN n'a qu'**une** Activity (`MainActivity`) |
| **Jetpack Compose** | UI déclarative en Kotlin (`@Composable`) | composants React |
| `remember { mutableStateOf() }` | état local | `useState` |
| **ViewModel** + `StateFlow` | état qui survit aux rotations | hooks / React Query |
| **Navigation Compose** | navigation | Expo Router |
| **Retrofit / Ktor** | client HTTP | `fetch` |
| **Room** | ORM SQLite | `expo-sqlite` |
| **WorkManager** | tâches de fond garanties | (pas d'équivalent direct simple — flush au foreground dans FVA) |
| **Gradle** (`build.gradle.kts`) | build | Metro + EAS |
| **Hilt** | injection de dépendances | Context |

Compose ressemble énormément à React :
```kotlin
@Composable
fun MatchRow(fixture: Fixture, onClick: (Int) -> Unit) {
    Row(Modifier.fillMaxWidth().clickable { onClick(fixture.id) }.padding(12.dp),
        verticalAlignment = Alignment.CenterVertically) {
        Text(fixture.home.name, Modifier.weight(1f))
        Text("${fixture.score.home ?: "-"} - ${fixture.score.away ?: "-"}", fontWeight = FontWeight.Bold)
        Text(fixture.away.name, Modifier.weight(1f), textAlign = TextAlign.End)
    }
}

@Composable
fun Counter() {
    var count by remember { mutableIntStateOf(0) }
    Button(onClick = { count++ }) { Text("Buts : $count") }
}
```

### Exercices bonus (`bonus-kotlin/`)

**B.1** — Android Studio → New Project → *Empty Activity* (Compose), emplacement `~/projects/android-learning/bonus-kotlin`, package `com.thomas.minifva.native`. Lance sur ton téléphone (bouton ▶).

**B.2** — Explore : `AndroidManifest.xml`, `MainActivity.kt`, `app/build.gradle.kts`, `res/`. Compare avec `mini-fva/android/` généré au module 10.

**B.3** — Écris le `MatchRow` + une `LazyColumn` (≈ FlatList) de fixtures en dur, avec un `data class Fixture`.

**B.4** — Ajoute la permission INTERNET au manifeste, puis charge `/fixtures` de l'API simulée avec Ktor ou Retrofit + `kotlinx.serialization` dans un `ViewModel` (`viewModelScope.launch`). Autorise le HTTP en clair pour ton IP locale (`usesCleartextTraffic` ou network security config) — et comprends pourquoi c'est interdit par défaut.

**B.5** — Écran détail avec Navigation Compose (`match/{id}`).

**B.6 (pont vers RN)** — Dans `mini-fva`, crée un **Expo Module** local en Kotlin :
```bash
npx create-expo-module@latest --local battery-level
```
Expose une fonction `getBatteryLevel(): Int` (via `BatteryManager`), appelle-la depuis TS et affiche « 🔋 42 % » dans l'écran compte. Tu as maintenant fait le chemin complet TS → JSI → Kotlin → Android.

---

## Annexes

### Checklist de fin de parcours
- [ ] Je lis n'importe quel fichier de `mobile/src/` et j'explique ce qu'il fait.
- [ ] Je sais ajouter un écran, une route dynamique, un onglet.
- [ ] Je sais ajouter un endpoint : type → `api.ts` → hook React Query → écran, avec invalidation.
- [ ] J'explique l'outbox et pourquoi les PUT sont idempotents.
- [ ] Je sais quand un changement demande un nouveau build natif vs un update OTA.
- [ ] Je sais débugger (debugger JS, logcat, logs réseau).
- [ ] Je lance typecheck + lint + tests avant chaque PR.

### Ressources
- Expo (docs versionnées) : https://docs.expo.dev — index pour LLM/corrections : https://docs.expo.dev/llms.txt
- React (officiel, excellent) : https://react.dev/learn
- React Native : https://reactnative.dev/docs/getting-started
- TypeScript Handbook : https://www.typescriptlang.org/docs/handbook/intro.html
- TanStack Query : https://tanstack.com/query/latest
- Expo Router : https://docs.expo.dev/router/introduction/
- Kotlin (Koans) : https://play.kotlinlang.org/koans · Compose : https://developer.android.com/jetpack/compose/tutorial

### Référence de l'API simulée (`node mock-api/server.mjs`)

| Méthode | Route | Notes |
|---|---|---|
| POST | `/auth/login` | `{username, password}` → `{accessToken}` (public) |
| GET | `/health` | public |
| GET | `/fixtures?date=YYYY-MM-DD` | calendrier J-2..J+7, 3 matchs/jour, 1 match en direct aujourd'hui |
| GET | `/fixtures/:id` | `{fixture, summary}` |
| GET | `/fixtures/:id/notes` | notes de l'utilisateur |
| PUT | `/fixtures/:id/notes/:noteId` | upsert idempotent `{text, minute?, source, createdAt}` |
| DELETE | `/fixtures/:id/notes/:noteId` | 204 |
| GET / POST | `/fixtures/:id/summary` | POST → `pending` 4 s → `ready` |
| GET | `/me/matches`, `/me/teams` | journal |
| GET | `/teams` | toutes les équipes |

Variables : `PORT` (4000), `LATENCY_MS` (0), `FAIL_RATE` (0..1, renvoie des 503). Les données sont en mémoire : un redémarrage efface notes et tokens.

Exemple :
```bash
TOKEN=$(curl -s -XPOST localhost:4000/auth/login -d '{"username":"thomas","password":"x"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken')
curl -s -H "authorization: Bearer $TOKEN" "localhost:4000/fixtures?date=$(date +%F)"
```
