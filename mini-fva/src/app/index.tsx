import { Text, View, StyleSheet } from "react-native";
import { MatchRow } from "../components/match";
import { GoalCounter } from "../components/goal_counter";
import { MatchClock } from "../components/chrono";
import { LiveCount } from "../components/live";

interface TeamRef {
    id: number;
    name: string;
    logo?: string; // optional
}

interface Fixture {
    id: number;
    home: TeamRef;
    away: TeamRef;
    status: "Not started" | "First half" | "Second half" | "Extra time" | "Penalty kickoff" | "Finished";
    score: { home: number | null; away: number | null };
}

export default function Index() {
    const fixtures: Fixture[] = [
        {
          id: 12,
          home: { id: 1, name: "Paris SG" },
          away: { id: 2, name: "Lyon" },
          status: "First half",
          score: { home: 1, away: 2},
        },
        {
          id: 43,
          home: { id: 4, name: "Paris FC" },
          away: { id: 3, name: "Rennes" },
          score: { home: 4, away: 3},
          status: "Second half",
        },
        {
          id: 13,
          home: { id: 3, name: "Rennes" },
          away: { id: 5, name: "Lille" },
          score: { home: 1, away: 3},
          status: "Finished",
        },
        {
          id: 32,
          home: { id: 3, name: "Rennes" },
          away: { id: 6, name: "Le Mans" },
          score: { home: null, away: null},
          status: "Not started",
        },
    ];

    return (
        <View style={styles.container}>
            <LiveCount fixtures={fixtures}/>
            <GoalCounter/>
            <MatchClock/>

        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
