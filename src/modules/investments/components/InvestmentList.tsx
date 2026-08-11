import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { Investment, InvestmentType } from '../../../domain/entities/Investment';
import { formatCurrency, formatPercentage } from '../../../shared/utils/formatters';

interface InvestmentListProps {
  investments: Investment[];
  onDelete: (id: string) => void;
  onWithdraw: (investment: Investment) => void;
}

export function InvestmentList({ investments, onDelete, onWithdraw }: InvestmentListProps) {
  const { theme } = useTheme();

  const getTypeLabel = (type: InvestmentType) => {
    const labels: Record<InvestmentType, string> = {
      DP: 'Plazo Fijo',
      FM: 'Fondo Mutuo',
    };
    return labels[type];
  };

  const calculateReturn = (initialAmount: number, currentValue: number) => {
    if (initialAmount === 0) return 0;
    return ((currentValue - initialAmount) / initialAmount) * 100;
  };

  const renderItem = ({ item }: { item: Investment }) => {
    const returnPercentage = calculateReturn(item.initialAmount, item.currentValue);
    const isPositive = returnPercentage >= 0;

    return (
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.info}>
            <Text variant="body" style={styles.name}>
              {item.name}
            </Text>
            <View style={styles.badge}>
              <Text variant="caption" color="secondary">
                {getTypeLabel(item.type)}
              </Text>
            </View>
          </View>
          <View style={styles.values}>
            <Text variant="body" style={[styles.amount, { color: theme.primary }]}>
              {formatCurrency(item.currentValue)}
            </Text>
            <Text variant="caption" color="secondary">
              Invertido: {formatCurrency(item.initialAmount)}
            </Text>
          </View>
        </View>
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text
            variant="caption"
            style={{ color: isPositive ? theme.success : theme.error }}
          >
            Rentabilidad: {isPositive ? '+' : ''}{formatPercentage(returnPercentage)}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onWithdraw(item)}
              accessibilityLabel={`Retirar inversión ${item.name}`}
              accessibilityHint="Abre el modal para retirar fondos de esta inversión"
            >
              <Text variant="caption" style={{ color: theme.primary }}>
                Retirar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              accessibilityLabel={`Eliminar inversión ${item.name}`}
              accessibilityHint="Elimina esta inversión de la lista"
            >
              <Text variant="caption" color="error">
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  if (investments.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="body" color="secondary">
          No hay inversiones aún
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={investments}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      scrollEnabled={false}
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
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
  },
  values: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
