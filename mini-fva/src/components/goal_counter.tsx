import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export function GoalCounter() {
    const [homeCount, setHomeCount] = useState(0);
    const [awayCount, setAwayCount] = useState(0);

    const incrementScore = (side: "home" | "away") => {
        if (side !== "home" && side !== "away") {
            throw new Error(`Invalid side: ${side}`);
          }
        (side === "home" ? setHomeCount : setAwayCount)((c) => c+1);
    };

    const resetScore = (side: "home" | "away") => {
        if (side !== "home" && side !== "away") {
            throw new Error(`Invalid side: ${side}`);
          }
        (side === "home" ? setHomeCount : setAwayCount)(0);
    };

    return (
        <View style={{ flexDirection: "row", gap: 15 }}>
            <Pressable onPress={() => incrementScore("home")}>
                <Text>+Home: {homeCount}</Text>
            </Pressable>

            <Pressable onPress={() => incrementScore("away")}>
                <Text>+Away: {awayCount}</Text>
            </Pressable>

            <Pressable onPress={() => {
                    resetScore("home");
                    resetScore("away");
            }}>
                <Text>Reset</Text>
            </Pressable>
        </View>
    );
}