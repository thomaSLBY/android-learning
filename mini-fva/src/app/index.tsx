import { Text, View, StyleSheet } from "react-native";
import { MatchRow } from "../components/match";

interface TeamRef {
    id: number;
    name: string;
    logo?: string; // optional
}

interface Fixture {
    id: number;
    home: TeamRef;
    away: TeamRef;
    score: { home: number | null; away: number | null };
    isLive: boolean;
}

export default function Index() {
    const fs: Fixture[] = [
        {
          id: 12,
          home: { id: 1, name: "Paris SG" },
          away: { id: 2, name: "Lyon" },
          score: { home: 1, away: 2},
          isLive: true,
        },
        {
          id: 43,
          home: { id: 4, name: "Paris FC" },
          away: { id: 3, name: "Rennes" },
          score: { home: 4, away: 3},
          isLive: false,
        },
        {
          id: 13,
          home: { id: 3, name: "Rennes" },
          away: { id: 5, name: "Lille" },
          score: { home: 1, away: 3},
          isLive: true,
        },
    ];

    return (
    <View style={styles.container}>
      {fs.map((f) =>(
            <MatchRow key={f.id} fixture={f} onPress={(id) => console.log(id)}/>
          )
      )}
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
