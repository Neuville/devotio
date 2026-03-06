import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import AuthStack      from './AuthStack';
import NotebookStack  from './NotebookStack';
import ScheduleStack  from './ScheduleStack';
import HomeScreen     from '../screens/HomeScreen';
import ProfileScreen  from '../screens/ProfileScreen';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home:     'home-outline',
  Notebook: 'book-outline',
  Schedule: 'calendar-outline',
  Profile:  'person-outline',
};

const TAB_ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home:     'home',
  Notebook: 'book',
  Schedule: 'calendar',
  Profile:  'person',
};

function TabBarBackground() {
  return (
    <BlurView
      intensity={60}
      tint="light"
      style={StyleSheet.absoluteFillObject}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? TAB_ICONS_ACTIVE[route.name] : TAB_ICONS[route.name]}
            size={size}
            color={color}
          />
        ),
        tabBarLabel: route.name === 'Home' ? 'Início'
          : route.name === 'Notebook'      ? 'Orações'
          : route.name === 'Schedule'      ? 'Horário'
          : 'Perfil',
        tabBarLabelStyle: {
          fontFamily: fonts.bold,
          fontSize: 10,
          letterSpacing: 0.2,
        },
        tabBarActiveTintColor:   colors.gold,
        tabBarInactiveTintColor: colors.inkLight,
        tabBarStyle: {
          position:        'absolute',
          backgroundColor: 'transparent',
          borderTopWidth:  0,
          elevation:       0,
          height:          70,
        },
        tabBarBackground: () => <TabBarBackground />,
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Notebook" component={NotebookStack} />
      <Tab.Screen name="Schedule" component={ScheduleStack} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.cream }} />;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
