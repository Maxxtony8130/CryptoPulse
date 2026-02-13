import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { getAppTheme } from '../src/presentation/theme/appTheme';

export default function Layout() {
  const scheme = useColorScheme();
  const theme = getAppTheme(scheme);

  return (
    <>
      <StatusBar style={theme.statusBarStyle} translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.screen.background },
        }}
      />
    </>
  );
}
