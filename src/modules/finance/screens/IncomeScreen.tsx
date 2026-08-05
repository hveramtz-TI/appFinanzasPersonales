import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { ThemedLineChart } from '../components/ThemedLineChart';
import { IncomeTransactionList } from '../components/IncomeTransactionList';
import { DateRangeModal } from '../components/DateRangeModal';
import { useIncomeEvolution } from '../hooks/useIncomeEvolution';
import { useIncomeScreen } from '../hooks/useIncomeScreen';
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

export function IncomeScreen() {
  const { theme } = useTheme();
  const { transactionRepo, isInitializing, initError } = useIncomeScreen();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange());
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { incomes, monthlyData, totals, isLoading, error } = useIncomeEvolution(
    transactionRepo,
    dateRange
  );

  const isReady = !isInitializing && !isLoading;
  const displayError = error ?? (initError ? new Error(initError) : null);
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text variant="h2">Evolución de ingresos</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!isReady && !displayError && (
          <View style={styles.loading}>
            <ActivityIndicator
              testID="activity-indicator"
              size="large"
              color={theme.primary}
            />
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
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              activeOpacity={0.7}
              accessibilityLabel="Seleccionar rango de fechas"
            >
              <Card style={styles.rangeCard}>
                <Text variant="caption" color="secondary">
                  Rango
                </Text>
                <Text variant="body">
                  {formatDate(dateRange.startDate, 'short')} →{' '}
                  {formatDate(dateRange.endDate, 'short')}
                </Text>
              </Card>
            </TouchableOpacity>

            <View style={styles.summary}>
              <Card
                style={[styles.summaryCard, { borderLeftColor: theme.success }]}
              >
                <Text variant="caption" color="secondary">
                  Total
                </Text>
                <Text
                  variant="h3"
                  style={{ color: theme.success }}
                  numberOfLines={1}
                >
                  {formatCurrency(totals.income)}
                </Text>
              </Card>
              <Card
                style={[styles.summaryCard, { borderLeftColor: theme.primary }]}
              >
                <Text variant="caption" color="secondary">
                  Transacciones
                </Text>
                <Text variant="h3">{incomes.length}</Text>
              </Card>
              <Card
                style={[styles.summaryCard, { borderLeftColor: theme.info }]}
              >
                <Text variant="caption" color="secondary">
                  Promedio
                </Text>
                <Text
                  variant="h3"
                  style={{ color: theme.info }}
                  numberOfLines={1}
                >
                  {formatCurrency(averageIncome)}
                </Text>
              </Card>
            </View>

            <View style={styles.chartSpacing}>
              <ThemedLineChart
                title="Evolución mensual"
                data={chartData}
                color={theme.success}
                emptyLabel="No hay ingresos en este rango"
              />
            </View>

            <IncomeTransactionList transactions={incomes} />
          </>
        )}
      </ScrollView>

      <DateRangeModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleConfirmRange}
        initialRange={dateRange}
      />
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
