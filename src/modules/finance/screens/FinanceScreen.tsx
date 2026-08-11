import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Text } from '../../../shared/components';
import { FinanceSummaryCards } from '../components/FinanceSummaryCards';
import { TopExpensesList } from '../components/TopExpensesList';
import { MonthlyTrendChart } from '../components/MonthlyTrendChart';
import { ThemedLineChart } from '../components/ThemedLineChart';
import { SubTabBar, TabItem } from '../components/SubTabBar';
import { IncomeView } from '../components/IncomeView';
import { MonthlyChargesView } from '../components/MonthlyChargesView';
import { NetWorthView } from '../components/NetWorthView';
import { useFinanceScreen } from '../hooks/useFinanceScreen';
import { MonthlyEvolutionPoint } from '../types';

type FinanceTab = 'summary' | 'income' | 'charges' | 'networth';

const TABS: TabItem[] = [
  { key: 'summary', label: 'Resumen', icon: 'analytics' },
  { key: 'income', label: 'Ingresos', icon: 'trending-up' },
  { key: 'charges', label: 'Mensualidades', icon: 'calendar' },
  { key: 'networth', label: 'Patrimonio', icon: 'wallet' },
];

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
  const [activeTab, setActiveTab] = useState<FinanceTab>('summary');
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
    transactionRepo,
    investmentRepo,
  } = useFinanceScreen();

  const isReady = !isInitializing && !isLoading;
  const displayError = error ?? (initError ? new Error(initError) : null);
  const evolutionChartData = useMemo(
    () => mapEvolutionToChartData(monthlyEvolution),
    [monthlyEvolution]
  );

  const renderContent = () => {
    if (!isReady) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator testID="activity-indicator" size="large" color={theme.primary} />
        </View>
      );
    }

    if (displayError && activeTab === 'summary') {
      return (
        <View style={[styles.errorCard, { backgroundColor: theme.card }]}>
          <Text variant="body" color="error">
            {displayError.message}
          </Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'summary':
        return (
          <View style={styles.tabContent}>
            <FinanceSummaryCards current={current} variance={variance} />
            <MonthlyTrendChart current={current} previous={previous} />
            <ThemedLineChart
              title="Evolución del balance"
              data={evolutionChartData}
              color={theme.primary}
            />
            <TopExpensesList expenses={topExpenses} />
          </View>
        );

      case 'income':
        if (!transactionRepo) {
          return (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          );
        }
        return <IncomeView transactionRepo={transactionRepo} />;

      case 'charges':
        return <MonthlyChargesView />;

      case 'networth':
        if (!transactionRepo) {
          return (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          );
        }
        return (
          <NetWorthView
            transactionRepo={transactionRepo}
            investmentRepo={investmentRepo}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text variant="h2">Finanzas</Text>
      </View>

      <SubTabBar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as FinanceTab)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  loading: { paddingVertical: 32 },
  errorCard: { padding: 16, borderRadius: 12, margin: 16 },
  tabContent: {
    padding: 16,
    gap: 16,
  },
});
