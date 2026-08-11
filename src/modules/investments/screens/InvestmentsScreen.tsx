import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../../shared/theme';
import { Text, IconButton } from '../../../shared/components';
import { InvestmentList } from '../components/InvestmentList';
import { InvestmentsPieChart } from '../components/InvestmentsPieChart';
import { InvestmentsLineChart } from '../components/InvestmentsLineChart';
import { WithdrawModal } from '../components/WithdrawModal';
import { useInvestments } from '../hooks/useInvestments';
import { Investment } from '../../../domain/entities/Investment';
import { InvestmentsStackParamList } from '../navigation/InvestmentsStack';

type NavigationProp = StackNavigationProp<InvestmentsStackParamList, 'InvestmentsHome'>;

export function InvestmentsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { investments, loading, deleteInvestment, refresh } = useInvestments();
  const [withdrawTarget, setWithdrawTarget] = useState<Investment | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleWithdraw = useCallback(
    (investment: Investment) => {
      setWithdrawTarget(investment);
    },
    [],
  );

  const handleWithdrawConfirm = useCallback(
    async (_amount: number, _isFull: boolean) => {
      // Withdrawal logic will be wired when use cases are integrated
      setWithdrawLoading(true);
      try {
        // Placeholder: refresh after withdrawal
        await refresh();
        setWithdrawTarget(null);
      } finally {
        setWithdrawLoading(false);
      }
    },
    [refresh],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text variant="h2">Inversiones</Text>
        <IconButton
          name="add"
          onPress={() => navigation.navigate('InvestmentForm')}
        />
      </View>

      {loading ? (
        <View style={styles.empty}>
          <Text variant="body" color="secondary">
            Cargando inversiones...
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.charts}>
            <InvestmentsPieChart investments={investments} />
            <InvestmentsLineChart investments={investments} />
          </View>
          <InvestmentList
            investments={investments}
            onDelete={deleteInvestment}
            onWithdraw={handleWithdraw}
          />
        </ScrollView>
      )}

      <WithdrawModal
        visible={withdrawTarget !== null}
        investment={withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onWithdraw={handleWithdrawConfirm}
        loading={withdrawLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  charts: {
    padding: 16,
    gap: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
