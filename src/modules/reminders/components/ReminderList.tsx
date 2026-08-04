import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { Reminder } from '../../../domain/entities/Reminder';
import { formatCurrency, formatRelativeDate } from '../../../shared/utils/formatters';

interface ReminderListProps {
  reminders: Reminder[];
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
}

export function ReminderList({ reminders, onDelete, onMarkAsPaid }: ReminderListProps) {
  const { theme } = useTheme();

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
      once: 'Una vez',
    };
    return labels[frequency] || frequency;
  };

  const renderItem = ({ item }: { item: Reminder }) => (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text variant="body" style={styles.title}>
            {item.title}
          </Text>
          <Text variant="caption" color="secondary">
            {getFrequencyLabel(item.frequency)} • Próximo: {formatRelativeDate(item.nextDate)}
          </Text>
        </View>
        <Text variant="body" style={[styles.amount, { color: theme.primary }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={() => onMarkAsPaid(item.id)} 
          style={styles.actionButton}
          accessibilityLabel={`Marcar ${item.title} como pagado`}
          accessibilityHint="Marca este recordatorio como pagado y actualiza la próxima fecha"
        >
          <Text variant="caption" style={{ color: theme.success }}>
            ✓ Pagado
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => onDelete(item.id)} 
          style={styles.actionButton}
          accessibilityLabel={`Eliminar recordatorio ${item.title}`}
          accessibilityHint="Elimina este recordatorio permanentemente"
        >
          <Text variant="caption" color="error">
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (reminders.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="body" color="secondary">
          No hay recordatorios aún
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reminders}
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
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontWeight: '500',
  },
  amount: {
    fontWeight: '600',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
