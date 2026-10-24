import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F6F2EA" },
      }}
    >
      <Stack.Screen
        name="debug"
        options={{
          headerShown: true,
          title: "BLE Debug",
          headerTintColor: "#E6EDF3",
          headerStyle: { backgroundColor: "#0B0F14" },
          contentStyle: { backgroundColor: "#0B0F14" },
        }}
      />
    </Stack>
  );
}
