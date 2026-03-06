import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen  from '../screens/auth/SignInScreen';
import SignUpScreen  from '../screens/auth/SignUpScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'default' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn"  component={SignInScreen} />
      <Stack.Screen name="SignUp"  component={SignUpScreen} />
    </Stack.Navigator>
  );
}
