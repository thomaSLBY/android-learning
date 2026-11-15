// No async needed, because only operations are done: no waiting task (e.g. live status of a match).
function minuteLabel(minute: number, status?: string): string {
    switch (status) {
        case "HT":
            return "MT";
        case "FT":
            return "FT";
        case "1H":
            if (minute <= "45") return String(minute)
            else return "45+"+(minute-45)
        case "2H":
            if (minute <= "90") return String(minute)
            else return "90+"+(minute-90)
        default:
            "undefined";

    }
}

console.log("45'", minuteLabel(45, "1H"));
console.log("47'", minuteLabel(47, "1H"));
console.log("47'", minuteLabel(47, "HT"));
console.log("76'", minuteLabel(76, "2H"));
console.log("95'", minuteLabel(95, "2H"));
console.log("95'", minuteLabel(95, "FT"));