import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../shared/hooks/useAuth';
import { useTheme } from '../shared/theme';
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../modules/auth';
import { createNavigationTheme } from './navigationTheme';

export function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const navigationTheme = createNavigationTheme(theme);

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <TabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
