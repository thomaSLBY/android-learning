import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export function MatchClock() {
    const [second, setSecond] = useState(0);
    const [paused, setPaused] = useState(true);

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => setSecond((s) => Math.min(s + 1, 90)), 1000);
        return () => clearInterval(id);
    }, [paused]);

    return (
        <View style={{ flexDirection: "row", gap: 15 }}>
            <Text style={{ fontWeight: "bold" }}>{second}'</Text>
            <Pressable onPress={() => {
                console.log(paused ? "Start" : "Pause");
                setPaused(!paused);
            }}>
                <Text>{paused ? "Start" : "Pause"}</Text>
            </Pressable>
            <Pressable onPress={() => {
                console.log("Réinit");
                setPaused(true);
                setSecond(0);
            }}>
                <Text>Reset</Text>
            </Pressable>
        </View>
    );
};