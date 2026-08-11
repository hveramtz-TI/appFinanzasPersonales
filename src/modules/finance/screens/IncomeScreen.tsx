import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme';
import { Text } from '../../../shared/components';
import { IncomeView } from '../components/IncomeView';
import { useIncomeScreen } from '../hooks/useIncomeScreen';

export function IncomeScreen() {
  const { theme } = useTheme();
  const { transactionRepo, isInitializing, initError } = useIncomeScreen();

  if (isInitializing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (initError || !transactionRepo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Text variant="body" color="error">
            {initError ?? 'Error al inicializar'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <IncomeView transactionRepo={transactionRepo} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
});
