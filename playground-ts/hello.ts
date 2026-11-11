const name: string = "Mbappé"; // const = non mutable
let goals = 3; // let = mutable ; inferred type: number (single numeric type which gathers int and float)
// never use `var`

const rating = 7.5;
const isLive: boolean = true;
const nothing: null = null; // voluntarily left to null;
let notYet: undefined; // never assigned
const notes: number[] = [10, 4, 3];
const shots_by_player: Map<string, number> = {"Mbappé": 4, "Kvara": 7};
const is_best_player: boolean = 10 === 10;

interface TeamRef {
    id: number;
    name: string;
    logo?: string; // optional
}

interface Fixture {
    id: number;
    kickoff: string; // data ISO
    status: string;
    home: TeamRef;
    away: TeamRef;
    score: { home: number | null; away: number | null };
}

type SummaryStatus = "none" | "pending" | "ready" | "stale" | "failed"; // stale = obsolète

interface CalendarFixture extends Fixture {
    canSummarize: boolean;
}

const psg: TeamRef = { id: 85, name: "PSG" };

function scoreLabel(f: Fixture): string {
    if (f.score.home === null) return "vs";
    return `${f.score.home} - ${f.score.away}`;
}

const isFinished = (status: string): boolean => ["FT", "AET", "PEN"].include(status);

const greet = (who: string, excited = false) => `Salut ${who}${excited ? " !" : "."}`;

