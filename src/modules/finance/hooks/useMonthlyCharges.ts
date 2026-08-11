import { useState, useMemo, useCallback } from 'react';
import { Reminder } from '../../../domain/entities/Reminder';
import { useReminders } from '../../reminders/hooks/useReminders';

export type FilterPeriod = 'month' | 'week' | 'overdue';

function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export function filterByMonth(reminders: Reminder[], date: Date): Reminder[] {
  return reminders.filter(r => {
    const next = r.nextDate;
    return next.getMonth() === date.getMonth() && next.getFullYear() === date.getFullYear();
  });
}

export function filterByWeek(reminders: Reminder[], date: Date): Reminder[] {
  const { start, end } = getWeekRange(date);
  return reminders.filter(r => {
    const next = r.nextDate.getTime();
    return next >= start.getTime() && next <= end.getTime();
  });
}

export function filterByOverdue(reminders: Reminder[], date: Date): Reminder[] {
  return reminders.filter(r => r.isActive && r.nextDate.getTime() < date.getTime());
}

export function useMonthlyCharges() {
  const {
    reminders,
    loading,
    error,
    addReminder,
    deleteReminder,
    markAsPaid,
    refresh,
  } = useReminders();

  const [filter, setFilter] = useState<FilterPeriod>('month');

  const now = useMemo(() => new Date(), []);

  const filteredReminders = useMemo(() => {
    switch (filter) {
      case 'month':
        return filterByMonth(reminders, now);
      case 'week':
        return filterByWeek(reminders, now);
      case 'overdue':
        return filterByOverdue(reminders, now);
    }
  }, [reminders, filter, now]);

  const totalPending = useMemo(
    () => filteredReminders.reduce((sum, r) => sum + r.amount, 0),
    [filteredReminders],
  );

  const overdueCount = useMemo(
    () => filterByOverdue(reminders, now).length,
    [reminders, now],
  );

  const setFilterAndRefresh = useCallback((f: FilterPeriod) => {
    setFilter(f);
  }, []);

  return {
    filter,
    setFilter: setFilterAndRefresh,
    filteredReminders,
    totalPending,
    overdueCount,
    reminders,
    loading,
    error,
    addReminder,
    deleteReminder,
    markAsPaid,
    refresh,
  };
}
