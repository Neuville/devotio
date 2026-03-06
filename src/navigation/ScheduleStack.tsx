import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ScheduleStackParamList } from './types';
import ScheduleScreen      from '../screens/ScheduleScreen';
import AddEditSessionScreen from '../screens/AddEditSessionScreen';

const Stack = createStackNavigator<ScheduleStackParamList>();

export default function ScheduleStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'default' }}>
      <Stack.Screen name="ScheduleHome"   component={ScheduleScreen} />
      <Stack.Screen name="AddEditSession" component={AddEditSessionScreen} />
    </Stack.Navigator>
  );
}
