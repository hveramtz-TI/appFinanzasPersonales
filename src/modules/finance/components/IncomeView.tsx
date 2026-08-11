import React, { useState, useMemo } from 'react';
import {
  View, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { ThemedLineChart } from './ThemedLineChart';
import { IncomeTransactionList } from './IncomeTransactionList';
import { DateRangeModal } from './DateRangeModal';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { useIncomeEvolution } from '../hooks/useIncomeEvolution';
import { DateRange, MonthlyEvolutionPoint } from '../types';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

function getDefaultRange(): DateRange {
  const today = new Date();
  return {
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: today,
  };
}

function mapMonthlyDataToChart(
  monthlyData: MonthlyEvolutionPoint[]
): { value: number; label: string }[] {
  return monthlyData.map((point) => ({
    value: point.income,
    label: String(point.month + 1),
  }));
}

interface IncomeViewProps {
  transactionRepo: ITransactionRepository;
}

export function IncomeView({ transactionRepo }: IncomeViewProps) {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange());
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { incomes, monthlyData, totals, isLoading, error } = useIncomeEvolution(
    transactionRepo,
    dateRange
  );

  const averageIncome = useMemo(
    () => (incomes.length > 0 ? totals.income / incomes.length : 0),
    [incomes.length, totals.income]
  );
  const chartData = useMemo(
    () => mapMonthlyDataToChart(monthlyData),
    [monthlyData]
  );

  const handleConfirmRange = (range: DateRange) => {
    setDateRange(range);
    setIsModalVisible(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator testID="activity-indicator" size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorCard, { backgroundColor: theme.card }]}>
        <Text variant="body" color="error">{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsModalVisible(true)} activeOpacity={0.7}
        accessibilityLabel="Seleccionar rango de fechas">
        <Card style={styles.rangeCard}>
          <Text variant="caption" color="secondary">Rango</Text>
          <Text variant="body">
            {formatDate(dateRange.startDate, 'short')} →{' '}
            {formatDate(dateRange.endDate, 'short')}
          </Text>
        </Card>
      </TouchableOpacity>

      <View style={styles.summary}>
        <Card style={[styles.summaryCard, { borderLeftColor: theme.success }]}>
          <Text variant="caption" color="secondary">Total</Text>
          <Text variant="h3" style={{ color: theme.success }} numberOfLines={1}>
            {formatCurrency(totals.income)}
          </Text>
        </Card>
        <Card style={[styles.summaryCard, { borderLeftColor: theme.primary }]}>
          <Text variant="caption" color="secondary">Transacciones</Text>
          <Text variant="h3">{incomes.length}</Text>
        </Card>
        <Card style={[styles.summaryCard, { borderLeftColor: theme.info }]}>
          <Text variant="caption" color="secondary">Promedio</Text>
          <Text variant="h3" style={{ color: theme.info }} numberOfLines={1}>
            {formatCurrency(averageIncome)}
          </Text>
        </Card>
      </View>

      <View style={styles.chartSpacing}>
        <ThemedLineChart title="Evolución mensual" data={chartData}
          color={theme.success} emptyLabel="No hay ingresos en este rango" />
      </View>

      <IncomeTransactionList transactions={incomes} />

      <DateRangeModal visible={isModalVisible} onClose={() => setIsModalVisible(false)}
        onConfirm={handleConfirmRange} initialRange={dateRange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  rangeCard: {
    marginBottom: 16,
  },
  summary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderLeftWidth: 4,
    padding: 12,
  },
  chartSpacing: {
    marginBottom: 16,
  },
});
