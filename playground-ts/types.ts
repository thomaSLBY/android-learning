interface TeamRef {
    id: number;
    name: string;
    logo?: string; // optional
}

export interface Competition {
    id: number;
    name: string;
    country?: string;
    logo?: string;
    season: string;
    round?: string;
}

export interface Fixture {
    id: number;
    kickoff: string; // data ISO
    status: "Not started" | "First half" | "Second hald" | "Extra time" | "Penalty kickoff" | "Finished";
    competition: Competition;
    home: TeamRef;
    away: TeamRef;
    score: { home: number | null; away: number | null };
}

interface Note {
    id: string;
    fixtureId: string;
    text: string;
    minute: number|null;
    source: "text"|"voice";
    teamId: number|null;
    playerIds?: number[];
    createdAt: string;
}

interface LineupPlayer {
    id: string;
    name: string;
    number?: number;
}

interface Lineup {
    teamId: string;
    formation?: string;
    startXI: LineupPlayer[];
    substitues: LineupPlayer[];
}

const nations_league: Competition = {
    id: 1,
    name: "Nations League",
    season: "2026-2027"
};

const france: TeamRef = {
    id: 1,
    name: "Equipe de France"
};

const turkey: TeamRef = {
    id: 2,
    name: "Turkey"
};

const belgium: TeamRef = {
    id: 3,
    name: "Belgium"
};

const italy: TeamRef = {
    id: 4,
    name: "Italy"
};

export const turkeyVsFrance: Fixture = {
    id: 1,
    kickoff: "2026-09-25",
    status: "Finished",
    home: turkey,
    away: france,
    competition: nations_league,
    score: { home: 0, away: 1 }
};

export const belgiumVsFrance: Fixture = {
    id: 2,
    kickoff: "2026-09-28",
    status: "Finished",
    home: belgium,
    away: france,
    competition: nations_league,
    score: { home: 0, away: 1 }
};

export const franceVsItaly: Fixture = {
    id: 3,
    kickoff: "2026-10-02",
    status: "Finished",
    home: france,
    away: italy,
    competition: nations_league,
    score: { home: 1, away: 1 }
};

export const franceVsBelgium: Fixture = {
    id: 4,
    kickoff: "2026-10-05",
    status: "Finished",
    home: france,
    away: belgium,
    competition: nations_league,
    score: { home: 4, away: 1 }
};

export const italyVsBelgium: Fixture = {
    id: 5,
    kickoff: "2026-09-25",
    status: "Finished",
    home: italy,
    away: belgium,
    competition: nations_league,
    score: { home: 0, away: 2 }
};

export const turkeyVsItaly: Fixture = {
    id: 6,
    kickoff: "2026-09-28",
    status: "Finished",
    home: turkey,
    away: italy,
    competition: nations_league,
    score: { home: 1, away: 4 }
};

export const belgiumVsTurkey: Fixture = {
    id: 7,
    kickoff: "2026-10-02",
    status: "Finished",
    home: belgium,
    away: turkey,
    competition: nations_league,
    score: { home: 3, away: 0 }
};

export const italyVsTurkey: Fixture = {
    id: 8,
    kickoff: "2026-10-05",
    status: "Finished",
    home: italy,
    away: turkey,
    competition: nations_league,
    score: { home: 3, away: 1 }
};

const camavinga: LineupPlayer = {
    id: "camavinga",
    name: "Eduardo Camavinga",
    number: 6
}

const jacquet: LineupPlayer = {
    id: "jacquet",
    name: "Jeremy Jacquet",
    number: 22
}

const da_cunha: LineupPlayer = {
    id: "da_cunha",
    name: "Lucas Da Cunha",
    number: 21
}

const truffert: LineupPlayer = {
    id: "truffert",
    name: "Adrien Truffert",
    number: 3
}

const lineup: Lineup = {
    teamId: "france",
    formation: "4-3-3",
    startXI: [camavinga, jacquet, da_cunha],
    substitues: [truffert]
}

function playerName(lineups: Lineup[], id: string): string | undefined {
    return lineups
        .flatMap((lineup) => [...lineup.startXI, ...lineup.substitues])
        .find((p) => p.id === id)
        ?.name;
}