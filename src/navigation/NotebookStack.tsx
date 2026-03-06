import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NotebookStackParamList } from './types';
import NotebookScreen      from '../screens/NotebookScreen';
import PrayerDetailScreen  from '../screens/PrayerDetailScreen';
import AddEditPrayerScreen from '../screens/AddEditPrayerScreen';

const Stack = createStackNavigator<NotebookStackParamList>();

export default function NotebookStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'default' }}>
      <Stack.Screen name="NotebookHome"  component={NotebookScreen} />
      <Stack.Screen name="PrayerDetail"  component={PrayerDetailScreen} />
      <Stack.Screen name="AddEditPrayer" component={AddEditPrayerScreen} />
    </Stack.Navigator>
  );
}
