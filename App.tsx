import React, { useEffect } from 'react';
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
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import Navigation from './src/navigation';
import { colors } from './src/constants/theme';
import { setupNotifications, requestPermissions } from './src/services/notifications';
import { navigationRef } from './src/navigation/navigationRef';

export default function App() {
  const [fontsLoaded] = useFonts({
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
    Lora_400Regular,
    Lora_700Bold,
    Lora_400Regular_Italic,
  });

  useEffect(() => {
    // Set up Android notification channel + request permissions once
    setupNotifications().then(() => requestPermissions());

    // Notification tapped while app is open or resumed from background
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const sessionId = response.notification.request.content.data
          ?.sessionId as string | undefined;
        if (sessionId && navigationRef.isReady()) {
          // Navigate to Schedule tab — Step 4 will navigate to PrayerSession directly
          navigationRef.navigate('Schedule' as never);
        }
      }
    );

    // Notification tapped that launched the app from cold start
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const sessionId = response.notification.request.content.data
        ?.sessionId as string | undefined;
      if (sessionId && navigationRef.isReady()) {
        navigationRef.navigate('Schedule' as never);
      }
    });

    return () => responseSub.remove();
  }, []);

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
