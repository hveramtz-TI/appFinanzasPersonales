import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { Transaction } from '../../../domain/entities/Transaction';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

interface IncomeTransactionListProps {
  transactions: Transaction[];
}

function IncomeTransactionItem({ transaction }: { transaction: Transaction }) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.item, { borderBottomColor: theme.divider }]}
      accessibilityLabel="Ingreso"
    >
      <View style={styles.details}>
        <Text variant="body" numberOfLines={1}>
          {transaction.description || 'Ingreso'}
        </Text>
        <Text variant="caption" color="secondary">
          {formatDate(transaction.date, 'short')}
        </Text>
      </View>
      <Text variant="body" style={[styles.amount, { color: theme.success }]}>
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
}

export function IncomeTransactionList({ transactions }: IncomeTransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text variant="body" color="secondary" style={styles.emptyText}>
          No hay ingresos en este rango
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text variant="h3" style={styles.title}>
        Ingresos
      </Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IncomeTransactionItem transaction={item} />}
        scrollEnabled={false}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  details: {
    flex: 1,
    marginRight: 12,
  },
  amount: {
    fontWeight: '600',
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 32,
  },
});
