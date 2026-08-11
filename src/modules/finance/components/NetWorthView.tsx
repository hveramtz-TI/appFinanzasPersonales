import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { ThemedLineChart } from './ThemedLineChart';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { IInvestmentRepository } from '../../../domain/repositories/IInvestmentRepository';
import { MonthlyEvolutionPoint } from '../types';
import { formatCurrency } from '../../../shared/utils/formatters';

interface NetWorthViewProps {
  transactionRepo: ITransactionRepository;
  investmentRepo: IInvestmentRepository | null;
}

export function NetWorthView({ transactionRepo, investmentRepo }: NetWorthViewProps) {
  const { theme } = useTheme();
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyEvolutionPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const year = new Date().getFullYear();
        const [monthlyTotals, totalValue] = await Promise.all([
          transactionRepo.getMonthlyTotals(year),
          investmentRepo?.getTotalCurrentValue() ?? Promise.resolve(0),
        ]);

        if (cancelled) return;

        setMonthlyEvolution(monthlyTotals.map(t => ({
          month: t.month,
          year: t.year,
          income: t.income,
          expense: t.expense,
          balance: t.balance,
        })));
        setTotalInvestments(totalValue);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar patrimonio');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [transactionRepo, investmentRepo]);

  const accumulatedBalance = useMemo(
    () => monthlyEvolution.reduce((sum, m) => sum + m.balance, 0),
    [monthlyEvolution],
  );

  const netWorth = accumulatedBalance + totalInvestments;

  const chartData = useMemo(
    () => monthlyEvolution.map(m => ({
      value: m.balance,
      label: String(m.month + 1),
    })),
    [monthlyEvolution],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text variant="body" color="error">{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card>
        <Text variant="caption" color="secondary">
          Patrimonio neto
        </Text>
        <Text variant="h2" style={{ color: theme.primary }}>
          {formatCurrency(netWorth)}
        </Text>
      </Card>

      <View style={styles.breakdown}>
        <Card style={styles.breakdownCard}>
          <Text variant="caption" color="secondary">Balance acumulado</Text>
          <Text variant="h3" style={{ color: accumulatedBalance >= 0 ? theme.success : theme.error }}>
            {formatCurrency(accumulatedBalance)}
          </Text>
          <Text variant="caption" color="secondary">
            {netWorth > 0 ? `${((accumulatedBalance / netWorth) * 100).toFixed(0)}%` : '-'}
          </Text>
        </Card>
        <Card style={styles.breakdownCard}>
          <Text variant="caption" color="secondary">Inversiones</Text>
          <Text variant="h3" style={{ color: theme.primary }}>
            {formatCurrency(totalInvestments)}
          </Text>
          <Text variant="caption" color="secondary">
            {netWorth > 0 ? `${((totalInvestments / netWorth) * 100).toFixed(0)}%` : '-'}
          </Text>
        </Card>
      </View>

      <ThemedLineChart
        title="Evolución mensual del balance"
        data={chartData}
        color={theme.primary}
        emptyLabel="No hay datos de evolución mensual"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  center: {
    padding: 32,
    alignItems: 'center',
  },
  breakdown: {
    flexDirection: 'row',
    gap: 12,
  },
  breakdownCard: {
    flex: 1,
  },
});
