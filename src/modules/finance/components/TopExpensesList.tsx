import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { formatCurrency, formatPercentage } from '../../../shared/utils/formatters';
import { TopExpense } from '../types';
import { CHART_COLORS } from '../../../shared/constants/business';

interface TopExpensesListProps {
  expenses: TopExpense[];
}

function getCategoryIcon(categoryName: string): keyof typeof Ionicons.glyphMap {
  const normalized = categoryName.toLowerCase();
  if (normalized.includes('comida') || normalized.includes('food') || normalized.includes('restaurant')) {
    return 'fast-food';
  }
  if (normalized.includes('transport') || normalized.includes('bus') || normalized.includes('metro')) {
    return 'bus';
  }
  if (normalized.includes('entreten') || normalized.includes('fun') || normalized.includes('film')) {
    return 'film';
  }
  if (normalized.includes('salud') || normalized.includes('health') || normalized.includes('med')) {
    return 'fitness';
  }
  if (normalized.includes('compra') || normalized.includes('shop') || normalized.includes('market')) {
    return 'cart';
  }
  if (normalized.includes('vivienda') || normalized.includes('home') || normalized.includes('rent')) {
    return 'home';
  }
  return 'pricetag';
}

export function TopExpensesList({ expenses }: TopExpensesListProps) {
  const { theme } = useTheme();

  if (expenses.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text variant="body" color="secondary" style={styles.emptyText}>
          No hay gastos en este período
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <Text variant="h3" style={styles.title}>
        Top gastos
      </Text>
      {expenses.map((expense, index) => {
        const iconName = getCategoryIcon(expense.categoryName);
        const color = CHART_COLORS[index % CHART_COLORS.length];

        return (
          <View
            key={expense.categoryId}
            style={[
              styles.item,
              index < expenses.length - 1 && { borderBottomColor: theme.divider },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
              <Ionicons name={iconName} size={18} color="#FFFFFF" />
            </View>
            <View style={styles.details}>
              <Text variant="body" numberOfLines={1}>
                {expense.categoryName}
              </Text>
              <Text variant="caption" color="secondary">
                {formatPercentage(expense.percentage)}
              </Text>
            </View>
            <Text variant="body" style={styles.amount}>
              {formatCurrency(expense.amount)}
            </Text>
          </View>
        );
      })}
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  amount: {
    marginLeft: 8,
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 32,
  },
});
