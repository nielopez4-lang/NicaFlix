import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player/[id]" options={{ presentation: "fullScreenModal" }} />
        <Stack.Screen name="live/[id]" options={{ presentation: "fullScreenModal" }} />
      </Stack>
    </>
  );
}
