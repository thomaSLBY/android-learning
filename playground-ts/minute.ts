function minuteLabel(minute: number, status?: string): string {
    return status === "1H" ? minute <= "45" ? String(minute) : "45+"+(minute-45)
    : status === "HT" ? "MT"
    : status === "2H" ? minute <= "90" ? String(minute) : "90+"+(minute-90)
    : status === "FT" ? "FT" : "undefined"
}

console.log("45'", minuteLabel(45, "1H"));
console.log("47'", minuteLabel(47, "1H"));
console.log("47'", minuteLabel(47, "HT"));
console.log("76'", minuteLabel(76, "2H"));
console.log("95'", minuteLabel(95, "2H"));
console.log("95'", minuteLabel(95, "FT"));