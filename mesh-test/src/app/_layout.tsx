import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { MeshBrand } from '@/constants/mesh-colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: MeshBrand.forest,
        tabBarInactiveTintColor: MeshBrand.muted,
        tabBarStyle: {
          backgroundColor: MeshBrand.card,
          borderTopColor: MeshBrand.hairline,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: 'Devices',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'radio' : 'radio-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}