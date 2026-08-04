import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { Transaction } from '../../../domain/entities/Transaction';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const { theme } = useTheme();

  const renderItem = ({ item }: { item: Transaction }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text variant="body" style={styles.description}>
            {item.description || 'Sin descripción'}
          </Text>
          <Text variant="caption" color="secondary">
            {formatDate(item.date)}
          </Text>
        </View>
        <View style={styles.right}>
          <Text
            variant="body"
            style={[
              styles.amount,
              { color: item.type === 'income' ? theme.success : theme.error },
            ]}
          >
            {item.type === 'income' ? '+' : '-'}
            {formatCurrency(item.amount)}
          </Text>
          <TouchableOpacity 
            onPress={() => onDelete(item.id)}
            accessibilityLabel={`Eliminar transacción ${item.description || 'sin descripción'}`}
            accessibilityHint="Elimina esta transacción de la lista"
          >
            <Text variant="caption" color="error">
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="body" color="secondary">
          No hay transacciones aún
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  description: {
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontWeight: '600',
    fontSize: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
