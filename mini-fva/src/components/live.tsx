import { useState, useMemo } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

import { MatchRow } from "./match";

export function isLive(fixture: Fixture): boolean {
    return [
        "First half",
        "Second half",
        "Extra time",
        "Penalty kickoff"
    ].includes(fixture.status);
}

interface LiveCountProps {
    fixtures: Fixture[];
}

export function LiveCount({ fixtures }: LiveCountProps) {
    const [filter, setFilter] = useState<"all" | "live" | "finished">("all");

    const filteredFixtures = useMemo(() => {
        switch(filter){
            case "live": return fixtures.filter(isLive);
            case "finished": return fixtures.filter((f) => f.status === "Finished");
            default:
                return fixtures;
        }
    }, [fixtures, filter]);

    const count = useMemo(() => filteredFixtures.length, [filteredFixtures]);

    return (
        <View style={styles.container}>
            <View style={styles.filters}>
                <Pressable onPress={() => setFilter("all")}>
                    <Text>Tous</Text>
                </Pressable>

                <Pressable onPress={() => setFilter("live")}>
                    <Text>En direct</Text>
                </Pressable>

                <Pressable onPress={() => setFilter("finished")}>
                    <Text>Terminés</Text>
                </Pressable>
            </View>

            <Text>{count} match{count>1 ? 's' : ''}</Text>

            {filteredFixtures.map(fixture => (
                <MatchRow key={fixture.id} fixture={fixture} onPress={(id) => console.log(id)}/>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  filters: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});