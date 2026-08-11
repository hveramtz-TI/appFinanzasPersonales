import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { ReminderList } from '../../reminders/components/ReminderList';
import { useMonthlyCharges, FilterPeriod } from '../hooks/useMonthlyCharges';
import { formatCurrency } from '../../../shared/utils/formatters';

const FILTERS: { key: FilterPeriod; label: string }[] = [
  { key: 'month', label: 'Mes actual' },
  { key: 'week', label: 'Semana' },
  { key: 'overdue', label: 'Vencidos' },
];

export function MonthlyChargesView() {
  const { theme } = useTheme();
  const {
    filter,
    setFilter,
    filteredReminders,
    totalPending,
    overdueCount,
    loading,
    deleteReminder,
    markAsPaid,
  } = useMonthlyCharges();

  const getEmptyMessage = () => {
    if (filter === 'overdue') return 'No hay mensualidades vencidas';
    return 'No hay mensualidades en este período';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.filters}>
        {FILTERS.map(({ key, label }) => {
          const selected = filter === key;
          const showBadge = key === 'overdue' && overdueCount > 0;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: selected ? theme.primary : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}
              accessibilityLabel={`Filtrar por ${label}`}
              accessibilityState={{ selected }}
            >
              <Text
                variant="caption"
                style={{
                  color: selected ? '#FFFFFF' : theme.text,
                  fontWeight: selected ? '600' : '400',
                }}
              >
                {label}
              </Text>
              {showBadge && (
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
                  <Text variant="caption" style={styles.badgeText}>
                    {overdueCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.summary}>
        <Card>
          <Text variant="caption" color="secondary">
            Total pendiente
          </Text>
          <Text variant="h3" style={{ color: theme.text }}>
            {formatCurrency(totalPending)}
          </Text>
          {overdueCount > 0 && (
            <Text variant="caption" color="error" style={styles.overdueLabel}>
              {overdueCount} vencido{overdueCount !== 1 ? 's' : ''}
            </Text>
          )}
        </Card>
      </View>

      {loading ? (
        <View style={styles.empty}>
          <Text variant="body" color="secondary">
            Cargando mensualidades...
          </Text>
        </View>
      ) : filteredReminders.length > 0 ? (
        <ReminderList
          reminders={filteredReminders}
          onDelete={deleteReminder}
          onMarkAsPaid={markAsPaid}
        />
      ) : (
        <View style={styles.empty}>
          <Text variant="body" color="secondary">
            {getEmptyMessage()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  summary: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  overdueLabel: {
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
