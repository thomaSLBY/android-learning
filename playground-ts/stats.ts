import type { Fixture } from "./types";
import { turkey_france, belgium_france, france_italy, france_belgium, italy_belgium, turkey_italy, belgium_turkey, italy_turkey } from "./types";

function goalsFor(fixtures: Fixture[], teamId: number): number {
    return fixtures
        .map((f) =>
            f.home.id === teamId ? (f.score.home ?? 0)
            : f.away.id === teamId ? (f.score.away ?? 0)
            : 0
        )
        .reduce((acc, s) => acc + s, 0);
}

function goalsAgainst(fixtures: Fixture[], teamId: number): number {
    return fixtures
        .map((f) =>
            f.home.id === teamId ? (f.score.away ?? 0)
            : f.away.id === teamId ? (f.score.home ?? 0)
            : 0
        )
        .reduce((acc, s) => acc + s, 0);
}

function results(fixtures: Fixture[], teamId: number): { P: number, W: number; D: number; L: number, GF: number, GA: number, GD: number } {
    const gf = goalsFor(fixtures, teamId)
    const ga = goalsAgainst(fixtures, teamId)
    const gd = gf - ga


    const teamFixtures = fixtures
        .filter((f) => (f.home.id === teamId || f.away.id === teamId) && (f.score.home != null && f.score.away != null))

    const r = { P: teamFixtures.length, W: 0, D: 0, L: 0, GF: gf, GA: ga, GD: gd };

    for (const f of teamFixtures) {
        const [mine, theirs] = f.home.id === teamId ? [f.score.home, f.score.away] : [f.score.away, f.score.home];
        mine > theirs ? r.W++ : mine === theirs ? r.D++ : r.L++;
    }

    return r
}

function groupByCompetition(fixtures: Fixture[]): Map<number, Fixture[]> {
    const map = new Map<number, Fixture[]>;
    for (const f of fixtures) {
        const competitionId = f.competition.id;
        !map.has(competitionId) ? map.set(competitionId, [f]) : map.get(competitionId)!.push(f);
    }
    return map
}


const all_fixtures = [turkey_france, belgium_france, france_italy, france_belgium, italy_belgium, turkey_italy, belgium_turkey, italy_turkey]
console.log("Equipe de France", results(all_fixtures, 1));
console.log("Turkey", results(all_fixtures, 2));
console.log("Belgium", results(all_fixtures, 3));
console.log("Italy", results(all_fixtures, 4));

console.log("Matches by competition", groupByCompetition(all_fixtures))