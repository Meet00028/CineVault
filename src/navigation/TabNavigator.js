import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';

import { theme } from '../constants/theme';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  return (
    <Text
      style={{
        fontSize: 18,
        opacity: focused ? 1 : 0.7
      }}
    >
      {label}
    </Text>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: { fontFamily: theme.typography.bodyMedium, fontSize: 12 }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="🔍" focused={focused} /> }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="❤️" focused={focused} /> }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="ℹ️" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

