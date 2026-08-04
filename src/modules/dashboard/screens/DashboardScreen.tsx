import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme';
import { Text } from '../../../shared/components';
import { DashboardPieChart } from '../components/DashboardPieChart';
import { SummaryCards } from '../components/SummaryCards';
import { useDashboardData } from '../hooks/useDashboardData';

export function DashboardScreen() {
  const { theme } = useTheme();
  const { data, loading, refresh } = useDashboardData();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text variant="h2">Dashboard</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        {data && (
          <>
            <SummaryCards
              totalIncome={data.totalIncome}
              totalExpense={data.totalExpense}
              balance={data.balance}
            />
            <DashboardPieChart data={data.categoryBreakdown} />
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
    borderBottomColor: '#E0E0E0',
  },
  content: {
    padding: 16,
  },
});
