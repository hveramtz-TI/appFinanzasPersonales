import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { LoginForm } from '../components/LoginForm';

export function LoginScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LoginForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
