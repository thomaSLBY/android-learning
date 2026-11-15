import { Pressable, Text } from "react-native";
import { isLive } from "./live";

interface MatchRowProps {
    fixture: Fixture;
    onPress?: (id: number) => void;
};

export function MatchRow({ fixture, onPress }: MatchRowProps) {
    const { home, away, score } = fixture;
    return (
        <Pressable onPress={() => onPress?.(fixture.id)}>
            <Text style={isLive(fixture) ? {fontWeight: "bold"} : {}} >{home.name} {score.home ?? "0"} - {score.away ?? "0"} {away.name}</Text>
        </Pressable>
    );
}