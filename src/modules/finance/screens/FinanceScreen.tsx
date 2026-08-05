import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../shared/theme';
import { Text } from '../../../shared/components';
import { FinanceSummaryCards } from '../components/FinanceSummaryCards';
import { TopExpensesList } from '../components/TopExpensesList';
import { IncomeEvolutionCard } from '../components/IncomeEvolutionCard';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart';
import { ThemedLineChart } from '../components/ThemedLineChart';
import { useFinanceScreen } from '../hooks/useFinanceScreen';
import { MonthlyEvolutionPoint } from '../types';
import { NativeStackNavigationProp } from '../navigation/FinanceStack';

function mapEvolutionToChartData(
  monthlyEvolution: MonthlyEvolutionPoint[]
): { value: number; label: string }[] {
  return monthlyEvolution.map((point) => ({
    value: point.balance,
    label: String(point.month + 1),
  }));
}

export function FinanceScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp>();
  const {
    current,
    previous,
    variance,
    topExpenses,
    monthlyEvolution,
    isLoading,
    error,
    isInitializing,
    initError,
  } = useFinanceScreen();

  const handleNavigateToIncome = () => {
    navigation.navigate('Income');
  };

  const isReady = !isInitializing && !isLoading;
  const displayError = error ?? (initError ? new Error(initError) : null);
  const evolutionChartData = useMemo(
    () => mapEvolutionToChartData(monthlyEvolution),
    [monthlyEvolution]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text variant="h2">Finanzas</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!isReady && (
          <View style={styles.loading}>
            <ActivityIndicator testID="activity-indicator" size="large" color={theme.primary} />
          </View>
        )}

        {displayError && (
          <View style={[styles.errorCard, { backgroundColor: theme.card }]}>
            <Text variant="body" color="error">
              {displayError.message}
            </Text>
          </View>
        )}

        {isReady && !displayError && (
          <>
            <FinanceSummaryCards current={current} variance={variance} />
            <MonthlyTrendChart current={current} previous={previous} />
            <ThemedLineChart
              title="Evolución del balance"
              data={evolutionChartData}
              color={theme.primary}
            />
            <TopExpensesList expenses={topExpenses} />
            <IncomeEvolutionCard onPress={handleNavigateToIncome} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  content: {
    padding: 16,
  },
  loading: {
    paddingVertical: 32,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
});
