import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabLabel({ label }: { label: string }) {
  return <Text style={{ color: "#fff", fontSize: 11 }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0B0B0F" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#0B0B0F", borderTopColor: "#222" },
        tabBarActiveTintColor: "#E50914",
        tabBarInactiveTintColor: "#8B8B9A",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Inicio", tabBarLabel: () => <TabLabel label="Inicio" /> }}
      />
      <Tabs.Screen
        name="envivo"
        options={{ title: "En Vivo", tabBarLabel: () => <TabLabel label="En Vivo" /> }}
      />
      <Tabs.Screen
        name="deportes"
        options={{ title: "Deportes", tabBarLabel: () => <TabLabel label="Deportes" /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", tabBarLabel: () => <TabLabel label="Perfil" /> }}
      />
    </Tabs>
  );
}
