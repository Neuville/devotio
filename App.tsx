import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Lato_400Regular,
  Lato_700Bold,
  Lato_900Black,
} from '@expo-google-fonts/lato';
import {
  Lora_400Regular,
  Lora_700Bold,
  Lora_400Regular_Italic,
} from '@expo-google-fonts/lora';
import { AuthProvider } from './src/context/AuthContext';
import Navigation from './src/navigation';
import { colors } from './src/constants/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
    Lora_400Regular,
    Lora_700Bold,
    Lora_400Regular_Italic,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.cream }} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
