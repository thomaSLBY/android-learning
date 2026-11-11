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
| Bonus A | [A. Kotlin & Android natif](#bonus-a--kotlin--android-natif) | comprendre ce qu'il y a sous le capot |
| Bonus B | [B. Publier sur le Play Store](#bonus-b--publier-sur-le-play-store-et-lapp-store) | passer de l'APK à une app publique |
| Bonus C | [C. Comptes, abonnements & paiements](#bonus-c--comptes-abonnements--paiements) | monétiser avec un modèle freemium |

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

- `npm init -y` : crée un fichier `package.json` contenant le nom, les dépendances et les scripts du nouveau projet. C'est l'équivalent du `pyproject.toml`.
- `npm i -D typescript tsx @types/node` : installe les 3 paquets dans `node_modules/` et les note dans `package.json`. C'est l'équivalent de `pip install` dans un venv.
  - `typescript` : compilateur qui vérifie les types
  - `tsx` : exécute directement un fichier `.ts` - `npx tsx fichier.ts`
  - `@types/node` : définition des types de Node pour que TypeScript les connaisse
- `npx tsc --init` : crée un `tsconfig.json` : fichier de config de TypeScript.

**Objectif du module** : créer un fichier TypeScript et l'exécuter avec `npx tsx fichier.ts` (comme `python fichier.py`).

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

*Remarques :*
- `export interface` : rendre la structure visible par les autres fichiers (car privée par défaut). D'autres les autres fichiers, import la structure avec `import` :
```ts
// types.ts
export interface EntityMatch { ... }   // visible ailleurs
interface Brouillon { ... }            // utilisable seulement dans types.ts

// team/[id].tsx
import type { EntityMatch } from "@/lib/types";   // ✅
import type { Brouillon } from "@/lib/types";     // ❌ erreur : non exporté
```

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

`[...startXI, ...substitutes]`: crée une nouvelle liste en copiant les listes *startXI* et *substitutes*.

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

#### Rappel : la programmation asynchrone

**Le problème** : un appel réseau ou une lecture disque prend du temps (200 ms pour une API = une éternité pour un processeur). En code **synchrone**, le programme **attend sans rien faire** :

```python
r1 = requests.get(url1)   # bloque 200 ms
r2 = requests.get(url2)   # bloque encore 200 ms  → total 400 ms
```

Sur mobile, c'est pire : pendant l'attente, l'écran serait **gelé** (pas de scroll, boutons inactifs).

**L'idée** : pendant qu'on **attend** une réponse, on fait **autre chose**. Pas besoin de plusieurs threads : un seul fil d'exécution, qui passe d'une tâche à l'autre à chaque attente.

> Analogie : un serveur de restaurant ne reste pas planté devant la cuisine pendant la cuisson. Il prend d'autres commandes et revient quand le plat est prêt. Un seul serveur, plusieurs tables servies.

| Notion | Définition |
|---|---|
| **Boucle d'évènements** (*event loop*) | Le « chef d'orchestre » : tient la liste des tâches en attente et relance chacune quand ce qu'elle attendait est arrivé. |
| **Fonction `async`** | Fonction qui peut se mettre en pause. L'appeler ne l'exécute pas tout de suite : ça renvoie un « ticket » pour un résultat futur. |
| **`await`** | « Mets-moi en pause ici jusqu'au résultat, et laisse la boucle faire autre chose pendant ce temps. » |
| **Future / Promise** | Le « ticket » : objet qui contiendra le résultat plus tard (ou une erreur). Python : *coroutine* / *Task* / *Future*. JS : **Promise**. |
| **Concurrence ≠ parallélisme** | Async = plusieurs tâches **entrelacées** sur un seul cœur, pendant les attentes d'I/O. N'accélère pas un calcul lourd (pour ça : threads/processus). |

**En Python (asyncio)** :

```python
import asyncio, aiohttp

async def get(session, url):
    async with session.get(url) as r:
        return await r.json()          # pause ici, la boucle fait autre chose

async def main():
    async with aiohttp.ClientSession() as s:
        a, b = await asyncio.gather(get(s, url1), get(s, url2))  # les 2 en même temps → ~200 ms

asyncio.run(main())    # ← démarre la boucle, exécute main(), puis arrête la boucle
```

En Python, l'async est **optionnel** : par défaut tout est synchrone. Il faut **démarrer explicitement** la boucle (`asyncio.run`) et utiliser des librairies compatibles (`aiohttp` au lieu de `requests`).

**En JavaScript / TypeScript** :

```ts
async function get(url: string) {
  const r = await fetch(url);          // pause ici
  return r.json();
}

const [a, b] = await Promise.all([get(url1), get(url2)]);   // ≈ asyncio.gather
```

Différences avec Python :
1. **La boucle tourne toujours** : elle est intégrée au moteur JS (navigateur, Node, Hermes sur le téléphone). Pas d'`asyncio.run`, on écrit `await` directement.
2. **Tout I/O est asynchrone** : il n'existe pas de `fetch` bloquant. Réseau, disque, SQLite, SecureStore… tout renvoie une `Promise`.
3. **C'est ce qui garde l'app fluide** : le JS tourne sur un seul fil ; pendant un `await fetch(...)`, ce fil reste libre pour gérer les taps et les animations.

**Pièges fréquents** :
- **Oublier `await`** → on récupère la `Promise` au lieu du résultat (`console.log` affiche `Promise { <pending> }`).
- **`await` en série quand on pourrait paralléliser** → deux `await` successifs sur des appels indépendants = 2× le temps. Utiliser `Promise.all`.
- **Erreurs** → une `Promise` rejetée se rattrape avec `try/catch` autour de l'`await`, comme une exception.

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

### 2.8 Types utilitaires, `switch`, et validation au runtime

**Types utilitaires** : des « fonctions sur les types » fournies par TypeScript, pour dériver un type d'un autre au lieu de le recopier.

```ts
type MinuteInput = Pick<Fixture, "status" | "elapsed">;   // seulement ces 2 champs
type FixtureSansScore = Omit<Fixture, "score">;            // tous les champs sauf score
type FixturePatch = Partial<Fixture>;                       // tous les champs deviennent optionnels
type GoalsByTeam = Record<number, number>;                  // dict id → nombre
```

Exemple réel (`mobile/src/lib/minute.ts` de FVA) :
```ts
export function liveMinute(f: Pick<Fixture, "status" | "elapsed">, fetchedAt: number, now = Date.now()): number | null
```
Pourquoi `Pick` plutôt que `Fixture` ? La fonction ne demande **que ce dont elle a besoin** : on peut l'appeler (et la tester) avec `{ status: "2H", elapsed: 67 }`, sans fabriquer un match complet.

**`switch`** : l'équivalent de `match/case` (Python 3.10), avec des `case` qui peuvent s'empiler :
```ts
switch (f.status) {
  case "1H":
  case "2H":           // plusieurs cas → même branche
    return "en cours";
  case "HT":
    return "mi-temps";
  default:             // ≈ case _:
    return "autre";
}
```
Avec `return` dans chaque branche, pas besoin de `break`. Sans `return`, **oublier `break` est un bug classique** : l'exécution continue dans le `case` suivant.

**Validation au runtime** : les `interface` **disparaissent à l'exécution**. Un `as Note` sur du JSON reçu ne vérifie rien. Pour des données **non fiables** (corps d'une requête HTTP, fichier, saisie), on valide au runtime avec **zod** — l'équivalent de **Pydantic**. Le backend de FVA le fait (`backend/src/handlers/api.ts`) :

```ts
import { z } from "zod";

const NoteBody = z.object({
  text: z.string().trim().max(2000),
  minute: z.number().int().nullable().optional(),
  labels: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
}).refine((n) => n.text.length > 0 || (n.labels?.length ?? 0) > 0, {   // règle sur plusieurs champs
  message: "text or labels required",
});

type NoteBody = z.infer<typeof NoteBody>;   // le type TS est DÉDUIT du schéma → une seule source de vérité

const parsed = NoteBody.safeParse(JSON.parse(rawBody));
if (!parsed.success) return { status: 400, body: parsed.error.issues };
parsed.data.labels;  // typé et validé
```

Règle : **types TS partout, validation runtime aux frontières** (entrée d'API, données externes) — comme la validation de schéma à l'ingestion d'un pipeline.

### Exercices (`playground-ts/`)

Lance l'API simulée pour les exercices 2.4 et 2.5.

**Ex 2.1** — `types.ts` : déclare `TeamRef`, `Competition`, `Fixture`, `Note` (`id, fixtureId, text, minute: number|null, source: "text"|"voice", teamId?: number|null, playerIds?: number[], createdAt`), `LineupPlayer` (`id, name, number?`) et `Lineup` (`teamId, formation?, startXI: LineupPlayer[], substitutes: LineupPlayer[]`). Crée 4 fixtures et une compo en dur. Écris `playerName(lineups: Lineup[], id: number): string | undefined`.

**Ex 2.2** — `stats.ts` : écris et teste
- `goalsFor(fixtures, teamId): number`
- `results(fixtures, teamId): { W: number; D: number; L: number }` (ignorer les matchs sans score)
- `groupByCompetition(fixtures): Map<number, Fixture[]>`

**Ex 2.3** — Provoque volontairement 3 erreurs de type (mauvais champ, `null` non géré, mauvais littéral de statut) et lis les messages de `npx tsc --noEmit`. Active `"strict": true` dans `tsconfig.json` si ce n'est pas le cas.

**Ex 2.4** — `client.ts` : écris `login(username)` (POST `/auth/login`) puis `getFixtures(token, date)` et affiche « Domicile score Extérieur » pour les matchs du jour.

**Ex 2.5** — Écris `withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T>` avec *backoff* exponentiel. Teste contre `FAIL_RATE=0.5 node mock-api/server.mjs`.

**Ex 2.6** — `minute.ts` : écris `minuteLabel(minute: number, status?: string): string` qui renvoie `"67'"`, mais `"45+2'"` si `status === "1H"` et `minute === 47`, `"90+4'"` en 2ᵉ mi-temps au-delà de 90, et `"MT"` à la mi-temps (`"HT"`). Teste au moins 6 cas avec `console.log`.

**Ex 2.7** — `npm i zod` dans `playground-ts/`. Écris le schéma `NoteBody` de la section 2.8, puis valide 4 objets : un avec texte, un avec seulement `labels`, un vide (`{ text: "" }`), un avec 9 étiquettes. Affiche `parsed.success` et les messages d'erreur.

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

<details><summary>Corrigé Ex 2.6</summary>

```ts
export function minuteLabel(minute: number, status?: string): string {
  if (status === "1H" && minute > 45) return `45+${minute - 45}'`;
  if (status === "2H" && minute > 90) return `90+${minute - 90}'`;
  if (status === "HT") return "MT";
  return `${minute}'`;
}
```
C'est la fonction de `mobile/src/lib/minute.ts` (qui gère aussi la prolongation `"ET"` → `"120+…"`).
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

### 4.6 Le clavier qui cache le champ de saisie

Sur mobile, le clavier occupe la moitié de l'écran et **recouvre** souvent le champ en bas (le `NoteComposer` de FVA est collé en bas de l'écran match). Solution : un conteneur qui **remonte** le contenu quand le clavier s'ouvre.

FVA utilise `react-native-keyboard-controller`, plus fiable que le `KeyboardAvoidingView` de base de React Native (comportements différents Android/iOS) :
```tsx
// _layout.tsx : le provider, une seule fois à la racine
import { KeyboardProvider } from "react-native-keyboard-controller";
<KeyboardProvider>{/* … */}</KeyboardProvider>

// match/[id].tsx
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useHeaderHeight } from "@react-navigation/elements";

const headerHeight = useHeaderHeight();
<KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={headerHeight}>
  <FlatList /* notes */ />
  <NoteComposer />          {/* reste visible au-dessus du clavier */}
</KeyboardAvoidingView>
```
`keyboardVerticalOffset` = hauteur du header de navigation, sinon le calcul est décalé d'autant. Ce paquet contient du code natif → **development build** nécessaire (pas Expo Go, cf. module 10).

### 4.7 Polices personnalisées & identité de marque

```tsx
import { useFonts } from "expo-font";

const [loaded] = useFonts({ Baloo2ExtraBold: require("../../assets/fonts/Baloo2-ExtraBold.ttf") });
const brand = loaded ? { fontFamily: "Baloo2ExtraBold", fontWeight: "normal" as const } : null;   // repli : police système

<Text style={[styles.title, brand]}>Kalpin</Text>
```
- `require(...)` d'un fichier = l'**embarquer dans le bundle** (comme les images).
- Le chargement est **asynchrone** : tant que `loaded` est `false`, on affiche la police système plutôt qu'un écran blanc.
- `fontWeight: "normal"` : la graisse est déjà dans le fichier « ExtraBold » ; demander `"700"` en plus ferait un faux gras sur Android.
- Vérifie la **licence** d'une police avant de l'embarquer (FVA livre `LICENSE-Baloo2.txt` à côté).

Les textes de marque sont centralisés dans `mobile/src/lib/brand.ts` (`APP_NAME = "Kalpin"`, `TAGLINE`) : une seule source de vérité pour l'écran de connexion et la fiche du store. (Oui, FVA s'appelle désormais **Kalpin** côté utilisateur.)

### Exercices

**Ex 4.1** — Reproduis un `MatchRow` propre : logo (placeholder rond), nom domicile, score centré, nom extérieur ; point rouge + minute si `status === "2H"`.

**Ex 4.2** — Écran d'accueil : `SectionList` groupée par compétition, avec des données en dur (copie la sortie de `curl` de l'API simulée dans `src/data/fixtures.json`).

**Ex 4.3** — Rends les en-têtes de section cliquables pour replier/déplier (inspire-toi du `toggle` de FVA).

**Ex 4.4** — Crée `src/lib/theme.ts` avec des couleurs light/dark et un hook `useTheme()`. Passe ton téléphone en mode sombre pour tester.

**Ex 4.5** — Composant `NoteComposer` : `TextInput` multi-lignes + champ minute numérique (`keyboardType="number-pad"`) + bouton « Ajouter » désactivé si texte vide. Les notes s'affichent en dessous (state local).

**Ex 4.6** — Place ton `NoteComposer` en bas de l'écran match, sous une `FlatList`. Ouvre le clavier : le champ est-il caché ? Corrige avec un `KeyboardAvoidingView` (celui de React Native d'abord, en Expo Go ; celui de `react-native-keyboard-controller` après ton development build du module 10).

**Ex 4.7** — Choisis une police sur Google Fonts (licence OFL), mets le `.ttf` dans `assets/fonts/`, et applique-la au titre de l'app avec `useFonts`. Crée `src/lib/brand.ts` avec le nom et le slogan de ton app.

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

### 5.5 Routes protégées : `Stack.Protected` (la méthode de FVA)

Plutôt que des `<Redirect>` dispersés dans chaque écran, Expo Router permet de déclarer **quels écrans existent selon une condition**, directement dans le layout racine :

```tsx
// mobile/src/app/_layout.tsx (simplifié)
const { status } = useAuth();
if (status === "loading") return null;          // splash screen encore affiché

<Stack>
  <Stack.Protected guard={status === "signedIn"}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="match/[id]" />
    <Stack.Screen name="premium" options={{ presentation: "modal" }} />
  </Stack.Protected>
  <Stack.Protected guard={status === "signedOut"}>
    <Stack.Screen name="sign-in" options={{ headerShown: false }} />
  </Stack.Protected>
</Stack>
```
Quand `guard` passe à `false`, les écrans du groupe deviennent **inaccessibles** et l'utilisateur est renvoyé vers le premier écran accessible. Se déconnecter = changer `status` → l'app bascule toute seule sur `sign-in`. Encore « UI = f(état) », appliqué à la navigation. Analogie : des *policies* IAM déclaratives plutôt que des `if` dans chaque Lambda.

**Routes typées** : `"experiments": { "typedRoutes": true }` dans `app.json` → Expo génère les types de toutes tes routes ; `router.push("/mtach/1")` (faute de frappe) devient une **erreur de compilation**.

### Exercices

**Ex 5.1** — Mets en place la structure : onglets « Matchs » et « Mes notes », écran `match/[id]`.

**Ex 5.2** — Cliquer sur un `MatchRow` ouvre `match/[id]` qui affiche l'id et le titre « Domicile vs Extérieur » (en cherchant dans le JSON en dur).

**Ex 5.3** — Change dynamiquement le titre du header avec `<Stack.Screen options={{ title: ... }} />` dans l'écran.

**Ex 5.4** — Ajoute `team/[id].tsx` ; dans l'écran match, les noms d'équipes sont des `Link` vers leur page.

**Ex 5.5** — Ajoute un écran modal `about` (`presentation: "modal"`) ouvert depuis un bouton du header.

**Ex 5.6 (lecture)** — Ouvre `football-view-aggregator/mobile/src/app/` et dessine l'arbre de navigation de FVA sur papier. Quel fichier gère la redirection vers `sign-in` ? (Indice : cherche `Stack.Protected`.)

**Ex 5.7** — Active `typedRoutes`, relance Metro, puis écris volontairement `router.push("/mtach/1")` : vérifie que `npx tsc --noEmit` le refuse.

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

### 6.5 Remonter l'état (*lifting state up*) : l'exemple des compos de FVA

Dans l'écran match de FVA, deux composants **frères** doivent partager une information :
- `LineupPanel` affiche les deux compos ; on **touche** une équipe ou des joueurs pour les « taguer » ;
- `NoteComposer` affiche ces tags sous forme de **puces** supprimables, et la note envoyée les contient (`teamId`, `playerIds`).

Deux frères ne peuvent pas se parler directement. La règle React : **on place l'état dans leur plus proche parent commun** (ici l'écran `match/[id].tsx`), qui le passe aux deux via les props, avec des callbacks pour le modifier.

```
                 match/[id].tsx  ← possède l'état : teamTag, playerTags
                 │                                  │
   props : selectedTeamId, selectedPlayerIds        props : tags, onRemoveTag
           onToggleTeam, onTogglePlayer             │
                 ▼                                  ▼
           LineupPanel                        NoteComposer
   (affiche, remonte les « taps »)     (affiche les puces, remonte « supprimer »)
```

Extrait simplifié de `mobile/src/app/match/[id].tsx` :
```tsx
const [teamTag, setTeamTag] = useState<number | null>(null);   // une seule équipe max
const [playerTags, setPlayerTags] = useState<number[]>([]);     // plusieurs joueurs

<LineupPanel
  selectedTeamId={teamTag}
  selectedPlayerIds={playerTags}
  // Toucher l'équipe déjà sélectionnée la désélectionne (toggle)
  onToggleTeam={(id) => setTeamTag((cur) => (cur === id ? null : id))}
  // Ajoute/retire le joueur, 11 max — toujours en créant un NOUVEAU tableau
  onTogglePlayer={(id) =>
    setPlayerTags((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 11 ? cur : [...cur, id]))}
/>

// À l'envoi : les tags partent avec la note, puis on remet à zéro
const submit = (n: ComposerSubmit) => {
  enqueue({ kind: "upsert", noteId: ulid(), fixtureId, body: { ...n, teamId: teamTag, playerIds: playerTags, /* … */ } });
  setTeamTag(null);
  setPlayerTags([]);
};
```

Points à retenir :
- `LineupPanel` est un composant **« contrôlé »** / « bête » (*presentational*) : il ne possède **aucun** état métier, il affiche ce qu'on lui donne et signale les taps. Il est donc réutilisable et facile à tester.
- On ne stocke que des **ids** dans l'état ; les noms affichés sont **dérivés** avec `useMemo` (une `Map` id → nom construite depuis les compos) — comme une jointure plutôt qu'une donnée dupliquée.
- **Édition d'une note** : `startEdit` recharge `teamTag`/`playerTags` depuis la note → le panneau se re-surligne tout seul, puisque l'écran = f(état).
- Pourquoi c'est utile : la note n'a pas besoin de dire « Dembélé a… » ; le tag rattache la note au joueur, ce qui alimente sa page (`player/[id]`) et le résumé IA par joueur.

### 6.6 Le temps comme état : la minute de jeu en direct

L'API ne renvoie la minute (`elapsed`) qu'à chaque rafraîchissement (~30 s). Pour qu'elle **avance seule** à l'écran, FVA la calcule sur le téléphone (`mobile/src/lib/minute.ts`) :

> minute affichée = dernière minute connue + minutes écoulées depuis la réception, **figée** à la mi-temps, plafonnée à +15 min de temps additionnel.

**1. Une fonction pure, avec `now` injecté** :
```ts
export function liveMinute(f: Pick<Fixture, "status" | "elapsed">, fetchedAt: number, now = Date.now()): number | null {
  if (f.elapsed == null) return null;
  const drift = Math.max(0, Math.floor((now - fetchedAt) / 60_000));   // minutes depuis le fetch
  switch (f.status) {
    case "1H": case "2H": case "ET": case "LIVE":
      return Math.min(f.elapsed + drift, (f.status === "1H" ? 45 : f.status === "2H" ? 90 : 120) + 15);
    default:
      return f.elapsed;   // HT, pause… : horloge arrêtée
  }
}
```
`now = Date.now()` est un **paramètre par défaut** : en production on ne le passe pas ; en test on passe une heure fixe → résultat déterministe. (Comme injecter une date de traitement dans un job batch au lieu d'appeler `datetime.now()` en dur.)

**2. Un hook « horloge »** : l'écran ne se re-rend que si un **état** change. Le temps qui passe n'en est pas un… alors on en fait un :
```ts
export function useNow(intervalMs = 10_000): number {
  const [now, setNow] = useState(() => Date.now());   // initialiseur paresseux : appelé une seule fois
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
```
Toutes les 10 s, `now` change → re-rendu → minute recalculée.

**3. `dataUpdatedAt` de React Query** : l'heure (ms) de réception de la donnée — c'est notre `fetchedAt`, fourni gratuitement :
```tsx
const now = useNow();
const currentMinute = isLive(fixture) ? liveMinute(fixture, fixtureQ.dataUpdatedAt, now) : null;
```
`currentMinute` n'est **pas** dans un `useState` : c'est une **valeur dérivée** recalculée à chaque rendu (cf. 3.6).

### 6.7 Un état à trois valeurs : figer la minute au premier geste

Tu commences une note à la 67ᵉ, tu l'envoies à la 69ᵉ : elle doit dire **67'**. FVA verrouille donc la minute **au premier geste** (tap sur un joueur, une étiquette, une frappe, le micro) :

```ts
// undefined = pas encore capturée · null = capturée, pas de minute (match pas en direct) · number = figée
const [draftMinute, setDraftMinute] = useState<number | null | undefined>(undefined);

const captureMinute = () => {
  if (!editing && draftMinute === undefined) setDraftMinute(currentMinute);   // une seule fois
};
const stampedMinute = editing ? editing.minute : draftMinute !== undefined ? draftMinute : currentMinute;
// à l'envoi : minute: stampedMinute ?? null, puis setDraftMinute(undefined) pour la note suivante
```

La distinction `undefined` / `null` mise à profit : `null` = « on a regardé, il n'y en avait pas », `undefined` = « on n'a pas encore regardé ». D'où `=== undefined` (et **pas** `== null`, qui confondrait les deux).

`NoteComposer` reçoit un callback **`onActivity`** qu'il appelle à chaque interaction, et affiche la minute qui sera tamponnée (prop `minuteLabel`, ex. `"67'"`). Encore le *lifting state up* : l'écran possède l'état, le composant signale les évènements.

### 6.8 Étiquettes rapides (*quick labels*)

Pour noter vite au stade, `NoteComposer` propose une rangée horizontale d'étiquettes (« Perte de balle », « Passe clé »…). Une note peut n'avoir **que** des étiquettes, sans texte.

```tsx
export const QUICK_LABELS = ["Bon placement", "Perte de balle", "Dribble réussi", /* … */];

const [labels, setLabels] = useState<string[]>(editing?.labels ?? []);
const toggleLabel = (label: string) =>
  setLabels((cur) => (cur.includes(label) ? cur.filter((l) => l !== label) : cur.length >= 8 ? cur : [...cur, label]));

<ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
  {QUICK_LABELS.map((label) => {
    const on = labels.includes(label);
    return (
      <Pressable key={label} onPress={() => toggleLabel(label)} accessibilityState={{ selected: on }}
        style={{ backgroundColor: on ? t.text : t.cardAlt }}>
        <T color={on ? t.card : t.text}>{label}</T>
      </Pressable>
    );
  })}
</ScrollView>
```

Notions :
- même idiome *toggle* + plafond que les joueurs tagués (8 étiquettes max) ;
- `ScrollView horizontal` suffit ici (liste **courte et fixe**), pas besoin de `FlatList` ;
- `keyboardShouldPersistTaps="handled"` : sans ça, le premier tap pendant que le clavier est ouvert ne fait que **fermer le clavier** ;
- la règle « **texte ou étiquette** » est vérifiée **deux fois** : dans l'UI (bouton désactivé) pour l'ergonomie, et dans le backend (zod `.refine`, cf. 2.8) pour la sécurité. **Ne jamais faire confiance au client seul.** Un joueur tagué seul, sans texte ni étiquette, est refusé ;
- dans la liste : étiquettes `#Perte de balle`, joueurs `@Dembélé`.

### 6.9 Organisation du code (convention FVA)

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

**Ex 6.5** — *Lifting state up*, avec des données en dur. Dans l'écran `match/[id]`, crée :
- `LineupPanel` : deux colonnes (domicile / extérieur), un bouton par équipe, 11 boutons joueurs (numéro + nom). Il reçoit `selectedTeamId`, `selectedPlayerIds`, `onToggleTeam`, `onTogglePlayer` et **ne possède aucun `useState` métier**.
- Au-dessus du `NoteComposer`, les tags sélectionnés en « puces » avec une croix pour les retirer.
- Règles : une seule équipe (re-toucher désélectionne), 11 joueurs max, remise à zéro après l'ajout d'une note.
- Bonus : le panneau est repliable (flèche dans l'en-tête), avec `accessibilityState={{ selected }}` sur les boutons.

<details><summary>Corrigé Ex 6.5 (écran parent)</summary>

```tsx
const [teamTag, setTeamTag] = useState<number | null>(null);
const [playerTags, setPlayerTags] = useState<number[]>([]);

const names = useMemo(
  () => new Map(lineups.flatMap((l) => [...l.startXI, ...l.substitutes]).map((p) => [p.id, p.name])),
  [lineups],
);
const tags = [
  ...(teamTag ? [{ key: `t${teamTag}`, label: teamTag === fixture.home.id ? fixture.home.name : fixture.away.name }] : []),
  ...playerTags.map((id) => ({ key: `p${id}`, label: names.get(id) ?? "?" })),
];
const removeTag = (key: string) =>
  key.startsWith("t") ? setTeamTag(null) : setPlayerTags((cur) => cur.filter((id) => `p${id}` !== key));

return (
  <>
    <LineupPanel
      fixture={fixture}
      lineups={lineups}
      selectedTeamId={teamTag}
      selectedPlayerIds={playerTags}
      onToggleTeam={(id) => setTeamTag((cur) => (cur === id ? null : id))}
      onTogglePlayer={(id) =>
        setPlayerTags((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 11 ? cur : [...cur, id]))}
    />
    <NoteComposer tags={tags} onRemoveTag={removeTag} onSubmit={submit} />
  </>
);
```
Compare ensuite avec `mobile/src/components/LineupPanel.tsx` (styles, `PlayerButton`, remplaçants, message « Compo publiée ~1 h avant le match »).
</details>

**Ex 6.6** — Crée `useNow()` et affiche dans l'en-tête de l'écran match une minute qui avance seule pour un match `"2H"` en dur (`elapsed: 67`, `fetchedAt` = heure d'ouverture de l'écran). Pour tester sans attendre, accélère : `intervalMs = 1000` et des « minutes » de 5 s.

**Ex 6.7** — Étiquettes rapides dans ton `NoteComposer` : rangée horizontale, toggle, 8 max, bouton « Ajouter » actif si texte **ou** étiquette. Affiche-les `#étiquette` sous chaque note.

**Ex 6.8** — Minute figée : implémente `draftMinute` (`number | null | undefined`) et `onActivity`. Test : commence une note à 67', attends 69', envoie → la note indique 67'. La note suivante repart de la minute courante.

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

### 7.7 Réglages du cache, retour au premier plan, clés de requête

**Un `QueryClient` partagé avec des réglages par défaut** (`mobile/src/lib/queries.ts`) :
```ts
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, gcTime: 30 * 60_000 } },
});
```
- `staleTime` : pendant combien de temps une donnée est considérée **fraîche** (pas de re-fetch). 1 min ici.
- `gcTime` : combien de temps une donnée **inutilisée** reste en mémoire avant d'être jetée. 30 min.
Analogie : un TTL de cache, avec deux seuils distincts.

**Rafraîchir au retour dans l'app** : sur le web, React Query rafraîchit quand l'onglet reprend le focus. Sur mobile, il faut lui dire ce qu'est le « focus » — l'app qui repasse au premier plan (`AppState`) :
```ts
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (s) => handleFocus(s === "active"));
  return () => sub.remove();
});
```
Tu sors de l'app à la mi-temps, tu reviens : les scores se mettent à jour seuls.

**Clés de requête centralisées** :
```ts
export const keys = {
  me: ["me", "profile"] as const,
  notes: (fixtureId: number) => ["notes", fixtureId] as const,
  fixture: (id: number) => ["fixture", id] as const,
};
```
Une seule définition pour `useQuery` **et** `invalidateQueries` → pas de faute de frappe qui empêcherait une invalidation. `as const` fige le tableau en type littéral (`readonly ["me", "profile"]` au lieu de `string[]`).

### 7.8 Les erreurs métier : `402 premium_required`

Une API ne renvoie pas que « OK » ou « en panne ». FVA renvoie **`402 Payment Required`** quand une fonctionnalité est réservée au Premium (résumé IA, saisons archivées). Le client doit traiter ce cas **différemment** d'une panne :

```ts
try {
  await api.requestSummary(fixtureId);
} catch (err) {
  if (err instanceof ApiError && err.code === "premium_required") router.push("/premium");   // proposer l'offre
  else Alert.alert("Erreur", "Réessaie dans un instant.");                                    // vraie erreur
}
```
Et on ne **re-tente pas** une 402 : elle n'est pas `retryable` (cf. `ApiError.retryable` : seulement réseau, 408, 429, 5xx). Mieux encore : ne pas proposer le bouton du tout quand on sait que l'utilisateur est en gratuit (`isPremium(me)`), et garder la 402 comme filet de sécurité côté serveur.

### Exercices (API simulée lancée ; pour l'instant, récupère un token avec `curl` et mets-le en dur via `setToken`)

**Ex 7.1** — Remplace les données en dur de l'écran Matchs par `useFixtures(date)`. Gère loading / erreur / vide.

**Ex 7.2** — Relance l'API avec `LATENCY_MS=2000` : observe le spinner, puis change de date et reviens → la donnée en cache s'affiche instantanément. Pourquoi ?

**Ex 7.3** — Pull-to-refresh sur la liste.

**Ex 7.4** — Écran match : infos + liste des notes (`useNotes`) + `NoteComposer` branché sur `useAddNote`. Bouton supprimer (appui long → `Alert.alert` de confirmation).

**Ex 7.5** — Rends l'ajout de note **optimiste**. Teste avec `LATENCY_MS=3000` puis avec `FAIL_RATE=1` (la note doit disparaître et une erreur s'afficher).

**Ex 7.6** — Bouton « Générer le résumé » (visible si `canSummarize`) + polling jusqu'à `ready` + affichage du texte.

**Ex 7.7** — Onglet « Mes notes » : liste `/me/matches`, cliquable vers le match.

**Ex 7.8** — Compos réelles et notes taguées :
- `GET /fixtures/:id` renvoie aussi `lineups: Lineup[]` — **vide** tant que la compo n'est pas publiée (~1 h avant le coup d'envoi). Branche ton `LineupPanel` (Ex 6.5) dessus et gère le cas vide.
- Envoie `teamId` et `playerIds` dans le `PUT` de la note ; affiche sous chaque note les noms des joueurs/équipe tagués.
- Modifier une note (tap dessus) recharge ses tags dans le panneau.
- Ajoute un onglet ou une section « Joueurs » alimenté par `GET /me/players` (les joueurs que tu as tagués).
- Vérifie avec `curl` que la note contient bien les tags.

**Ex 7.9** — Branche la minute en direct sur la vraie donnée : `liveMinute(fixture, fixtureQ.dataUpdatedAt, now)` (le match en direct de l'API simulée est à `elapsed: 67`). Envoie `labels` et `minute` dans le `PUT`, et vérifie avec `curl` que l'API refuse une note sans texte ni étiquette (`400 text_or_labels_required`).

**Ex 7.10** — Crée `src/lib/queries.ts` avec un `queryClient` (`staleTime`, `gcTime`), l'objet `keys`, et le `focusManager` branché sur `AppState`. Test : ouvre l'écran Matchs, passe sur une autre app 2 minutes, reviens → une requête part (visible dans les logs de l'API simulée).

**Ex 7.11** — Freemium : `useMe()` (`GET /me`) et `isPremium(me)`. Le bouton « Générer le résumé » ouvre un écran `premium` si l'utilisateur est en gratuit ; et si l'API renvoie quand même `402 premium_required`, redirige aussi vers `premium`. Passe en Premium avec :
```bash
curl -XPOST -H "authorization: Bearer $TOKEN" localhost:4000/dev/webhook -d '{"plan":"premium"}'
```
puis vérifie que le résumé se génère.

**Ex 7.12** — Évènements du match : `GET /fixtures/:id` renvoie `events` (remplacements, cartons rouges). Écris `playerMarks(lineups, events): Map<number, { in?: string; out?: string; red?: string }>` et affiche dans ton `LineupPanel` « ↑ 58' », « ↓ 58' », « 🟥 45+2' ». Piège (réel !) : sur un remplacement, le fournisseur met l'entrant tantôt dans `playerId`, tantôt dans `assistId`. Utilise la compo pour décider : l'entrant est celui qui était sur le **banc**. Compare ensuite avec `mobile/src/lib/events.ts`.

<details><summary>Corrigé Ex 7.12</summary>

```ts
const at = (e: MatchEvent) => `${e.minute}${e.extra ? `+${e.extra}` : ""}'`;

export function playerMarks(lineups: Lineup[], events: MatchEvent[]) {
  const marks = new Map<number, PlayerMarks>();
  const mark = (id: number | null | undefined, m: PlayerMarks) => {
    if (id == null) return;
    marks.set(id, { ...marks.get(id), ...m });            // fusion : un joueur peut entrer PUIS être expulsé
  };
  const bench = new Set(lineups.flatMap((l) => l.substitutes.map((p) => p.id)));

  for (const e of events) {
    if (e.type === "substitution") {
      const playerEnters = e.playerId != null && bench.has(e.playerId);
      mark(playerEnters ? e.assistId : e.playerId, { out: at(e) });
      mark(playerEnters ? e.playerId : e.assistId, { in: at(e) });
    } else if (e.type === "red" || e.type === "second_yellow") {
      mark(e.playerId, { red: at(e) });
    }
  }
  return marks;
}
```
La version de FVA va plus loin : elle trie les évènements par minute et gère un remplaçant entré puis ressorti (`cameOn`). C'est du **nettoyage de données d'un fournisseur incohérent** — ton métier de data engineer, côté client.
</details>

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

### 8.3 Connexion Google / Apple (*social login*)

FVA (Kalpin) propose « Continuer avec Google » et, **sur iOS**, « Continuer avec Apple ». Pas de SDK Google ni Apple dans l'app : c'est **Cognito** qui est fédéré avec ces fournisseurs. L'app ouvre la même page de connexion hébergée, avec un paramètre qui saute directement au bon fournisseur :

```ts
// mobile/src/lib/auth.tsx (extrait)
signIn: (provider?: "Google" | "SignInWithApple") => /* … */
  extraParams: provider ? { identity_provider: provider } : {},
```
```tsx
// sign-in.tsx
{Platform.OS === "ios" ? <Button label="Continuer avec Apple" onPress={() => go("SignInWithApple")} /> : null}
<Button label="Continuer avec Google" onPress={() => go("Google")} />
```
- **Règle App Store** : si une app propose un login social tiers (Google…), elle **doit** aussi proposer *Sign in with Apple*. D'où le `Platform.OS === "ios"`.
- `Platform.OS` (`"android" | "ios"`) : la façon standard de faire du code spécifique à une plateforme.
- Quel que soit le fournisseur, l'app reçoit les mêmes tokens Cognito, et l'utilisateur est identifié par son **`sub`** Cognito (id stable). C'est ce `sub` qui sert aussi d'identifiant pour les abonnements (bonus C).

### 8.4 Déconnexion vs suppression de compte

| | Déconnexion | Suppression de compte |
|---|---|---|
| Serveur | rien (ou révocation du token) | **efface** toutes les données (`DELETE /me`) |
| Local | tokens supprimés | tokens **+ cache React Query + outbox SQLite** effacés |
| Obligatoire ? | — | **oui** : Google Play et l'App Store exigent qu'on puisse supprimer son compte **depuis l'app** |

Extrait de `mobile/src/app/account.tsx` :
```tsx
const doDelete = () =>
  Alert.alert("Supprimer mon compte ?", "Toutes tes notes… seront définitivement supprimées.", [
    { text: "Annuler", style: "cancel" },
    {
      text: "Supprimer définitivement",
      style: "destructive",                 // bouton rouge sur iOS
      onPress: async () => {
        await api.deleteAccount();          // 1. serveur d'abord
        await clearOutbox();                // 2. puis TOUT le local
        queryClient.clear();
        await forgetSession();
      },
    },
  ]);
```
L'ordre compte : si l'appel serveur échoue, on n'efface rien localement et on affiche une erreur. L'écran Compte propose aussi l'**export** des données (`Share.share` d'un JSON) — droit à la portabilité (RGPD).

### Exercices

**Ex 8.1** — `npx expo install expo-secure-store`. Écris `src/lib/auth.tsx` : `AuthProvider` (état `status: "loading" | "signedOut" | "signedIn"`), `signIn(username, password)`, `signOut()`, hook `useAuth()`.

**Ex 8.2** — Écran `sign-in.tsx` (champs + bouton + erreur). Garde dans le layout racine : redirection selon `status`. Pendant `"loading"`, garde le splash screen (`expo-splash-screen`).

**Ex 8.3** — Écran `account.tsx` : nom de l'utilisateur + bouton « Se déconnecter » qui vide aussi le cache React Query (sinon l'utilisateur suivant verrait les données du précédent !).

**Ex 8.4** — Redémarre l'API simulée (les tokens sont en mémoire → invalidés). Fais en sorte qu'un 401 déconnecte proprement l'utilisateur.

**Ex 8.5 (lecture)** — Lis `mobile/src/lib/auth.tsx` de FVA. Repère : PKCE, stockage des tokens, rafraîchissement, et mode démo.

**Ex 8.6** — Remplace tes `<Redirect>` par `Stack.Protected` (cf. 5.5) dans le layout racine. Vérifie que la déconnexion renvoie bien sur `sign-in` sans aucune navigation manuelle.

**Ex 8.7** — Bouton « Supprimer mon compte » dans `account.tsx` : confirmation `Alert` destructive, `DELETE /me` sur l'API simulée, puis nettoyage local complet (SecureStore, `queryClient.clear()`, outbox). Vérifie avec `curl` que tes notes ont disparu et que ton ancien token renvoie `401`.

**Ex 8.8** — Bouton « Exporter mes données » : récupère tes notes et partage-les en JSON avec `Share.share`.

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

**Ex 11.0** — Teste `liveMinute` sans attendre grâce au `now` injecté : `fetchedAt = 0`, `now = 3 * 60_000` → `elapsed + 3` en `"2H"` ; inchangé en `"HT"` ; plafonné à 105 en `"2H"` avec `elapsed: 88` et 30 min de dérive ; `null` si `elapsed` est `null`.

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

Compte développeur Google Play (frais unique) → créer l'app → piste de test interne → upload de l'AAB (`eas submit -p android`) → fiche Store, politique de confidentialité (FVA : export et suppression de compte = obligations RGPD/Play), formulaire *Data safety*. **Le détail complet est dans le bonus B.**

### 12.4 bis Le `eas.json` de FVA

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal", "android": { "buildType": "apk" }, "environment": "development" },
    "preview":     { "distribution": "internal", "android": { "buildType": "apk" }, "environment": "preview" },
    "production":  { "autoIncrement": true, "environment": "production" }
  },
  "submit": { "production": {} }
}
```
- `appVersionSource: "remote"` + `autoIncrement: true` : EAS gère le **numéro de build** (`versionCode` Android) et l'incrémente à chaque build de production. Le Play Store refuse deux uploads avec le même `versionCode` — plus besoin d'y penser.
- `environment` : chaque profil lit ses variables (`EXPO_PUBLIC_API_URL`…) dans les **environnements EAS** (stockés chez Expo, `eas env:create`), au lieu d'un `.env` local. Le `.env.example` du repo documente les variables attendues.
- `buildType: "apk"` pour l'installation directe ; la production produit un **AAB** (format exigé par le Play Store).

### 12.4 ter Icône, splash, identité (`app.json`)

```json
"name": "Kalpin",
"android": {
  "package": "com.example.fva",
  "allowBackup": false,
  "adaptiveIcon": {
    "backgroundColor": "#22C574",
    "foregroundImage": "./assets/android-icon-foreground.png",
    "backgroundImage": "./assets/android-icon-background.png",
    "monochromeImage": "./assets/android-icon-monochrome.png"
  }
}
```
- **Icône adaptative** Android : un premier plan + un fond, que chaque constructeur découpe à sa façon (rond, carré arrondi…). Garde le logo dans la **zone centrale** (~66 %). L'icône **monochrome** sert aux icônes thématiques d'Android 13+.
- **Splash** : plugin `expo-splash-screen` (`image`, `backgroundColor`).
- `allowBackup: false` : la base locale (chiffrée) n'est pas copiée dans les sauvegardes Google — sa clé est liée à l'appareil, la restaurer ailleurs ne marcherait pas.
- `package` : l'**identifiant définitif** de l'app sur le Play Store. `com.example.*` est un placeholder : il est **refusé** par le store et ne pourra plus changer après la première publication.
- FVA garde ses logos en **SVG** (`assets/logo/`) et génère les PNG par script : une source, plusieurs tailles.

Toute modification de `app.json` (icône, permissions, package) = **nouveau build natif** (pas d'OTA).

### 12.5 Environnements

Variables `EXPO_PUBLIC_*` par profil dans `eas.json` (`env`), ou `app.config.ts` dynamique. Rappel : tout ce qui est dans le bundle est lisible par n'importe qui → **les secrets restent côté backend** (d'où les appels Bedrock côté Lambda dans FVA, jamais depuis l'app).

### Exercices

**Ex 12.1** — Build `preview` avec EAS et installe l'APK sur ton téléphone via le lien/QR.

**Ex 12.2** — Configure `expo-updates`, publie un update OTA qui change un texte, vérifie qu'il arrive sur l'APK installé (relancer l'app deux fois).

**Ex 12.3** — Deux profils avec deux URL d'API différentes (IP locale / une URL factice) et vérifie laquelle est utilisée.

**Ex 12.4 (réflexion)** — Liste les changements qui **exigent** un nouveau build natif vs ceux qui passent en OTA.

**Ex 12.5** — Crée une icône adaptative pour `mini-fva` (premier plan, fond, monochrome) et un splash à ta couleur. Rebuild et vérifie le rendu sur ton téléphone avec plusieurs formes d'icône (Paramètres → Fond d'écran et style, selon le constructeur).

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
| `src/components/NoteComposer.tsx` | saisie texte + voix, puces des tags | 4, 6, 10 |
| `src/components/LineupPanel.tsx` | compos cliquables pour taguer équipe/joueurs d'une note | 4, 6 |
| `src/lib/minute.ts` | minute en direct calculée sur le téléphone (`liveMinute`, `minuteLabel`, `useNow`) | 2, 6, 11 |
| `src/lib/events.ts` | remplacements / cartons rouges par joueur, nettoyage des données du fournisseur | 7 |
| `src/lib/purchases.ts` | abonnements via RevenueCat (offres, achat, restauration) | bonus C |
| `src/app/premium.tsx`, `src/components/Locked.tsx` | paywall, saisons archivées verrouillées | 7, bonus C |
| `src/lib/brand.ts`, `assets/logo/`, `assets/fonts/` | nom « Kalpin », slogan, logo, police | 4, 12 |
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
6. `LineupPanel.tsx` + les états `teamTag` / `playerTags` de `match/[id].tsx` : suis un tag depuis le tap sur un joueur jusqu'au `PUT` (`playerIds`), puis jusqu'à la page `player/[id]`. Côté données : les compos viennent d'API-Football (`backend/src/lib/football-api.ts`) ; en mode démo, de `SQUADS` dans `demo.ts`.

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

**Ex 13.3 bis** — Dans `LineupPanel`, affiche à côté de chaque joueur le nombre de notes qui le taguent déjà dans ce match (dérivé des `notes` de l'écran : passe une `Map<playerId, count>` en prop). Vérifie en mode démo.

**Ex 13.4** — Ajoute un champ au contrat (ex. `Note.pinned?: boolean`) : modifie `backend/src/domain/types.ts`, `mobile/src/lib/types.ts`, `demo.ts` ; constate que le typecheck t'indique tous les endroits à adapter.

**Ex 13.5** — Lance `npx tsc --noEmit && npx expo lint` puis ouvre une PR avec ta branche.

**Ex 13.6 (synthèse)** — Écris dans `android-learning/NOTES-FVA.md` un schéma du trajet d'une note : doigt → `NoteComposer` → outbox SQLite → `PUT` → API Gateway → Lambda → DynamoDB → résumé Bedrock → polling → écran.

---

## Bonus A — Kotlin & Android natif

Objectif : comprendre ce que React Native génère pour toi, et savoir écrire un petit module natif si un jour une librairie manque.

### A.1 Kotlin pour un dev Python

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

### A.2 Les briques d'une app Android native

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

**A.1** — Android Studio → New Project → *Empty Activity* (Compose), emplacement `~/projects/android-learning/bonus-kotlin`, package `com.thomas.minifva.native`. Lance sur ton téléphone (bouton ▶).

**A.2** — Explore : `AndroidManifest.xml`, `MainActivity.kt`, `app/build.gradle.kts`, `res/`. Compare avec `mini-fva/android/` généré au module 10.

**A.3** — Écris le `MatchRow` + une `LazyColumn` (≈ FlatList) de fixtures en dur, avec un `data class Fixture`.

**A.4** — Ajoute la permission INTERNET au manifeste, puis charge `/fixtures` de l'API simulée avec Ktor ou Retrofit + `kotlinx.serialization` dans un `ViewModel` (`viewModelScope.launch`). Autorise le HTTP en clair pour ton IP locale (`usesCleartextTraffic` ou network security config) — et comprends pourquoi c'est interdit par défaut.

**A.5** — Écran détail avec Navigation Compose (`match/{id}`).

**A.6 (pont vers RN)** — Dans `mini-fva`, crée un **Expo Module** local en Kotlin :
```bash
npx create-expo-module@latest --local battery-level
```
Expose une fonction `getBatteryLevel(): Int` (via `BatteryManager`), appelle-la depuis TS et affiche « 🔋 42 % » dans l'écran compte. Tu as maintenant fait le chemin complet TS → JSI → Kotlin → Android.

---

## Bonus B — Publier sur le Play Store (et l'App Store)

Le module 12 t'a appris à produire un AAB. Ici : tout ce qu'il faut **autour** pour qu'une app soit publiée, et le rester.

> ⚠️ Les règles des stores (frais, délais, nombre de testeurs, niveau d'API cible) changent régulièrement. Les chiffres ci-dessous sont des ordres de grandeur : vérifie toujours la page officielle de la Play Console avant de te lancer.

### B.1 Le parcours Google Play

```
Compte développeur (frais uniques, vérification d'identité)
  → Créer l'app dans la Play Console (nom, langue, gratuite/payante)
  → Remplir le « Contenu de l'application » (obligatoire, voir B.2)
  → Piste de test INTERNE   : jusqu'à 100 testeurs, dispo en quelques minutes, pas de revue
  → Piste de test FERMÉE    : testeurs invités ; pour un compte PERSONNEL récent, Google exige
                              un test fermé avec un minimum de testeurs actifs pendant ~2 semaines
                              avant d'autoriser la production
  → (Test OUVERT, optionnel)
  → PRODUCTION              : revue Google (quelques heures à quelques jours), déploiement
                              progressif possible (10 % → 50 % → 100 %)
```

**Compte personnel ou organisation ?** Un compte « organisation » (numéro D-U-N-S d'entreprise requis) échappe à l'obligation de test fermé et affiche le nom de la société. Un compte personnel affiche ton nom… et ton adresse si tu monétises. À décider **avant** de créer le compte.

### B.2 Le « Contenu de l'application » (la partie que tout le monde sous-estime)

| Rubrique | Pour FVA / Kalpin |
|---|---|
| **Règles de confidentialité** | une URL publique obligatoire décrivant les données collectées |
| **Sécurité des données** (*Data safety*) | déclarer : e-mail (compte), notes (contenu utilisateur), achats ; chiffrées en transit ; **supprimables à la demande** |
| **Suppression de compte** | possible **dans l'app** (cf. 8.4) **et** via un lien web, à déclarer dans la console |
| **Classification du contenu** | questionnaire IARC → « Tout public » |
| **Public cible** | 13+ / adultes (pas d'enfants → règles allégées) |
| **Accès à l'app** | Google doit pouvoir tester : fournir un compte de test ou un mode démo (FVA a `EXPO_PUBLIC_DEMO`) |
| **Annonces** | « l'app ne contient pas de publicité » |
| **Permissions sensibles** | justifier le micro (dictée) |

Une déclaration incohérente avec le comportement réel de l'app = **refus** ou suspension. Fais l'inventaire des données comme un registre RGPD.

### B.3 La fiche Play Store

- Nom (30 caractères), description courte (80), description longue (4 000) — reprends `brand.ts` (`TAGLINE`) pour rester cohérent.
- Icône 512×512, image de présentation 1024×500, **au moins 2 captures d'écran** téléphone.
- Catégorie (Sports), coordonnées de contact.
- Astuce : génère les captures depuis l'émulateur en mode démo, avec des données propres.

### B.4 Signature et identifiants

- **Clé de signature d'upload** : EAS la crée et la stocke (`eas credentials`). Google re-signe ensuite avec la clé de l'app (*Play App Signing*). Garde quand même une sauvegarde.
- **`android.package`** : définitif après la première publication ; `com.example.*` est refusé → choisis ton vrai domaine inversé (`fr.tondomaine.kalpin`).
- **`versionCode`** : entier strictement croissant à chaque upload (géré par `autoIncrement`, cf. 12.4 bis). **`version`** (`1.0.0`) : la version affichée aux utilisateurs.
- **Niveau d'API cible** (`targetSdkVersion`) : Google impose chaque année de viser une version récente d'Android. Avec Expo, monter de SDK Expo suffit en général.

### B.5 Automatiser l'envoi : `eas submit`

1. Dans Google Cloud, crée un **compte de service** avec accès à la Play Console, télécharge sa clé JSON (c'est un secret : jamais dans git).
2. **Le tout premier AAB doit être envoyé à la main** dans la console (limitation Google), ensuite :
```bash
eas build -p android --profile production
eas submit -p android --latest          # envoie le dernier build sur la piste configurée
```
Dans `eas.json`, `"submit": { "production": { "android": { "track": "internal" } } }` pour viser la piste interne d'abord.

### B.6 Et l'App Store ?

Même logique, plus stricte : compte Apple Developer (abonnement **annuel**), **revue humaine à chaque version**, TestFlight pour les tests, *App Privacy* (équivalent de Data safety), *Sign in with Apple* obligatoire si login social (cf. 8.3), et paiements numériques **obligatoirement** via les achats intégrés d'Apple. EAS construit l'app iOS dans le cloud : pas besoin de Mac pour builder, mais un iPhone aide à tester.

### Exercices bonus B

**B.1** — Rédige l'inventaire des données de `mini-fva` (quoi, pourquoi, où c'est stocké, chiffré ?, supprimable ?) au format du formulaire *Data safety*.

**B.2** — Rédige une politique de confidentialité d'une page pour `mini-fva` et publie-la (GitHub Pages ou un bucket S3 statique).

**B.3** — Prépare une fiche Store complète dans `store/fiche.md` : nom, descriptions courte/longue, 4 captures (émulateur), icône 512.

**B.4** — Si tu crées un compte Play Console : publie `mini-fva` en **test interne**, installe-la depuis le Play Store, puis publie une mise à jour (vérifie l'incrément du `versionCode`).

---

## Bonus C — Comptes, abonnements & paiements

FVA est devenue **Kalpin** avec un modèle **freemium** : la prise de notes est gratuite ; **Premium** (abonnement mensuel ou annuel) débloque les résumés IA et l'historique des saisons passées.

### C.1 Ce qui est imposé par les stores

- Un contenu **numérique** consommé dans l'app (fonctionnalités, abonnement) doit être vendu via le **système de facturation du store** : *Google Play Billing* sur Android, *In-App Purchase* sur iOS. Pas de Stripe pour ça (Stripe reste possible pour des biens **physiques** ou des services hors app).
- Le store prend une **commission** sur chaque paiement (de l'ordre de 15 % sur les abonnements ; vérifie les conditions actuelles).
- L'utilisateur doit pouvoir **gérer/résilier** son abonnement facilement, et **restaurer** ses achats (changement de téléphone).
- Le prix, la période et le renouvellement automatique doivent être **affichés clairement** avant l'achat.

### C.2 Pourquoi RevenueCat ?

Implémenter Google Play Billing **et** StoreKit (Apple) directement, c'est : deux APIs différentes, vérifier chaque reçu côté serveur, gérer renouvellements, périodes de grâce, remboursements, changements d'offre… RevenueCat est une **couche d'abstraction** (gratuite jusqu'à un certain chiffre d'affaires) :

```
  App (react-native-purchases)            Store (Google / Apple)
        │  achat ───────────────────────────────▶│
        │                                        │ reçu
        ▼                                        ▼
   RevenueCat  ◀────────── valide les reçus, suit les renouvellements
        │
        │ webhook (INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION…)
        ▼
   Backend FVA  → met à jour profile.plan = "premium" / "free"   ← SOURCE DE VÉRITÉ
        │
        ▼
   GET /me → { plan, premiumUntil }  → l'app affiche / débloque
```

Vocabulaire RevenueCat :
- **Product** : ce que tu vends dans le store (`premium_monthly`, `premium_annual`).
- **Entitlement** : le **droit** que ça donne (`premium`). Plusieurs produits → un même droit.
- **Offering / Package** : la sélection de produits affichée dans le paywall (modifiable à distance sans nouvelle version).
- **App User ID** : l'identifiant de ton utilisateur. FVA utilise le **`sub` Cognito** → l'abonnement suit le **compte**, pas le téléphone.

### C.3 Le code côté app (`mobile/src/lib/purchases.ts`)

```ts
import Purchases from "react-native-purchases";

const ENTITLEMENT = "premium";
// Clés PUBLIQUES du SDK (différentes Android / iOS) : elles peuvent être dans le bundle, ce ne sont pas des secrets.
const apiKey = () => (Platform.OS === "ios" ? appConfig.revenueCatIosKey : appConfig.revenueCatAndroidKey);
export const purchasesAvailable = () => !appConfig.demo && Boolean(apiKey());

export async function initPurchases(userId: string) {        // à la connexion
  if (configuredFor === null) Purchases.configure({ apiKey: apiKey(), appUserID: userId });
  else await Purchases.logIn(userId);                          // changement de compte
}
export async function resetPurchases() { await Purchases.logOut(); }   // à la déconnexion

export async function getOffers(): Promise<Offer[]> {
  const offerings = await Purchases.getOfferings();
  return (offerings.current?.availablePackages ?? []).map((pkg) => ({
    id: pkg.identifier,
    price: pkg.product.priceString,            // prix LOCALISÉ fourni par le store ("4,99 €")
    period: pkg.packageType === "MONTHLY" ? "monthly" : pkg.packageType === "ANNUAL" ? "annual" : "other",
    pkg,
  }));
}

/** true si l'achat a débloqué Premium, false si l'utilisateur a annulé. */
export async function buy(offer: Offer): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(offer.pkg);   // ouvre la feuille de paiement Google
    return Boolean(customerInfo.entitlements.active[ENTITLEMENT]);
  } catch (err) {
    if ((err as { userCancelled?: boolean }).userCancelled) return false;  // annuler n'est PAS une erreur
    throw err;
  }
}

export const restore = async () => Boolean((await Purchases.restorePurchases()).entitlements.active[ENTITLEMENT]);
export const manageSubscription = () => Purchases.showManageSubscriptions();
```

Et dans le layout racine, l'abonnement est **lié au compte** :
```tsx
useEffect(() => {
  if (userId) void initPurchases(userId).catch(() => undefined);
  else void resetPurchases();
}, [userId]);
```

Points d'architecture :
- **Jamais de prix en dur** : le store fournit le prix dans la devise de l'utilisateur.
- **Annulation ≠ erreur** : l'utilisateur qui ferme la feuille de paiement ne doit pas voir « Achat impossible ».
- `purchasesAvailable()` : en mode démo ou sans clé, l'écran affiche un message au lieu de planter → l'app reste testable par la revue Google (cf. B.2 « Accès à l'app »).
- Le SDK est un module **natif** → development build obligatoire.

### C.4 Le paywall (`mobile/src/app/premium.tsx`)

Écran modal (`presentation: "modal"`, cf. 5.5) : bénéfices, offres, « Restaurer mes achats », mention du renouvellement automatique. Le détail intéressant est **après** l'achat :

```ts
const unlocked = async () => {
  // Le backend apprend l'achat via le webhook RevenueCat : quelques secondes de décalage.
  for (let i = 0; i < 5; i++) {
    await qc.invalidateQueries({ queryKey: ["me"] });
    if (isPremium(qc.getQueryData(keys.me))) break;
    await new Promise((r) => setTimeout(r, 2_000));
  }
  void qc.invalidateQueries();     // tout re-télécharger : les contenus verrouillés deviennent visibles
  router.back();
};
```
C'est de la **cohérence à terme** (*eventual consistency*) : le store, RevenueCat et ton backend ne sont pas synchronisés instantanément. L'app **interroge** le backend jusqu'à ce qu'il soit à jour — comme attendre qu'une partition soit écrite avant de lancer le job suivant.

### C.5 Le verrouillage (*gating*) : serveur d'abord, UI ensuite

| Couche | Rôle | Dans FVA |
|---|---|---|
| **Backend** | **sécurité** : refuse ce qui n'est pas payé | `402 premium_required` sur le résumé ; les saisons passées renvoient `locked: true` sans les données |
| **App** | **ergonomie** : montre ce qui est verrouillé et donne envie | `LockedSeasonCard` (« Saison archivée — tes notes sont conservées »), bouton résumé → paywall |

Ne fais **jamais** confiance au client : un utilisateur peut modifier l'app ou appeler l'API à la main. Le client ne décide pas, il **reflète** ce que dit le serveur (`GET /me`).

Les types du contrat :
```ts
export type Plan = "free" | "premium";
export interface Me { plan: Plan; premiumUntil: string | null; currentSeason: number }
export interface EntityHistory<E> {
  entity: E; matches: EntityMatch[]; seasons: SeasonSummary[];
  /** Saisons archivées masquées en gratuit, avec leur nombre de matchs. */
  lockedSeasons?: { season: number; matchCount: number }[];
}
```
Le serveur renvoie **combien** de matchs sont verrouillés (pour le message incitatif), mais **pas leur contenu**.

### C.6 Le webhook côté backend (pour comprendre, sans infra)

`backend/src/handlers/revenuecat.ts` : un endpoint HTTP appelé **par RevenueCat** (jamais par l'app) :
1. Vérifie un **secret partagé** dans le header `Authorization`, avec une comparaison à temps constant (`timingSafeEqual`, contre les attaques par mesure du temps).
2. Valide le corps avec **zod** (cf. 2.8).
3. Selon `event.type` : `INITIAL_PURCHASE`, `RENEWAL`… → Premium jusqu'à `expiration_at_ms` ; `CANCELLATION` → **garde l'accès jusqu'à la fin de la période payée** ; `EXPIRATION` → retour en gratuit.
4. Un même évènement peut arriver deux fois : le traitement doit être **idempotent** — même principe que l'outbox (module 9).

### C.7 Tester les achats sans payer

- **Play Console → Paramètres → Test de licence** : ajoute ton adresse Google. Tes achats sur une piste de test sont gratuits, et les abonnements se renouvellent en accéléré (quelques minutes au lieu d'un mois).
- Les produits d'abonnement ne peuvent être créés qu'**après** avoir envoyé un premier build contenant la librairie de facturation (cf. B.5).
- RevenueCat a un mode *sandbox* : les évènements de test arrivent au webhook avec `environment: "SANDBOX"`.
- Avant tout ça : l'**API simulée** (`POST /dev/webhook`) te permet de développer tout le parcours freemium sans store.

### Exercices bonus C (API simulée)

**C.1** — Écran `premium.tsx` en modal : 3 bénéfices, 2 offres **en dur** (« Mensuel 4,99 € », « Annuel 39,99 € — le plus avantageux »), bouton « Restaurer ». Le bouton d'achat appelle `POST /dev/webhook {"plan":"premium"}` après un faux délai de 3 s, puis **interroge** `GET /me` jusqu'à `plan === "premium"` (la boucle de C.4).

**C.2** — Gating : en gratuit, le bouton « Résumé » ouvre le paywall ; si le serveur répond quand même `402`, même chose. Repasse en gratuit avec `{"plan":"free"}` pour vérifier.

**C.3** — Écran Compte : affiche « Premium jusqu'au 9 nov. » (formate `premiumUntil` avec `Intl.DateTimeFormat("fr-FR")`) ou un bouton « Passer à Premium ».

**C.4** — Lecture : lis `mobile/src/lib/purchases.ts`, `src/app/premium.tsx` et `backend/src/handlers/revenuecat.ts`. Dessine le trajet d'un achat, du tap jusqu'à l'affichage du résumé IA, en marquant chaque endroit où un décalage temporel peut se produire.

**C.5 (vrai store, optionnel)** — Avec un compte Play Console et un compte RevenueCat gratuit : crée un produit d'abonnement, un entitlement `premium`, installe `react-native-purchases`, fais un development build, et achète en tant que testeur de licence.

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
| GET | `/fixtures/:id` | `{fixture, lineups, summary}` — `lineups` vide si coup d'envoi dans plus d'1 h |
| GET | `/fixtures/:id/notes` | notes de l'utilisateur |
| PUT | `/fixtures/:id/notes/:noteId` | upsert idempotent `{text, minute?, source, createdAt, teamId?, playerIds?, labels?}` — texte **ou** au moins une étiquette requis (sinon `400 text_or_labels_required`) ; 8 étiquettes max |
| DELETE | `/fixtures/:id/notes/:noteId` | 204 |
| GET / POST | `/fixtures/:id/summary` | POST → `pending` 4 s → `ready` |
| GET | `/me/matches`, `/me/teams`, `/me/players` | journal (`/me/players` = joueurs tagués dans tes notes) |
| GET | `/me` | `{plan: "free" \| "premium", premiumUntil, currentSeason}` |
| DELETE | `/me` | supprime le compte et toutes ses données (204), invalide les tokens |
| POST | `/dev/webhook` | **simule** le webhook du store : `{"plan":"premium"}` ou `{"plan":"free"}` |

`POST /fixtures/:id/summary` renvoie **`402 premium_required`** en plan gratuit. `GET /fixtures/:id` renvoie aussi `events` (remplacements, carton rouge).
| GET | `/teams` | toutes les équipes |

Variables : `PORT` (4000), `LATENCY_MS` (0), `FAIL_RATE` (0..1, renvoie des 503). Les données sont en mémoire : un redémarrage efface notes et tokens.

Exemple :
```bash
TOKEN=$(curl -s -XPOST localhost:4000/auth/login -d '{"username":"thomas","password":"x"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken')
curl -s -H "authorization: Bearer $TOKEN" "localhost:4000/fixtures?date=$(date +%F)"
```
