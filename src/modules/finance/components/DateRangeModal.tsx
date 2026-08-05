import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '../../../shared/theme';
import { Text, Button } from '../../../shared/components';
import { DateRange } from '../types';
import { formatDate } from '../../../shared/utils/formatters';

interface DateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (range: DateRange) => void;
  initialRange?: DateRange;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toStartOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function toEndOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}

function getDefaultRange(): DateRange {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    startDate: toStartOfDay(startDate),
    endDate: toEndOfDay(today),
  };
}

function getMarkedDates(
  startDate: Date | null,
  endDate: Date | null,
  selectedColor: string
): Record<string, { startingDay?: boolean; endingDay?: boolean; color: string }> {
  const marked: Record<string, { startingDay?: boolean; endingDay?: boolean; color: string }> =
    {};

  if (!startDate) {
    return marked;
  }

  const start = toDateString(startDate);
  const end = endDate ? toDateString(endDate) : start;

  if (start === end) {
    marked[start] = { startingDay: true, endingDay: true, color: selectedColor };
    return marked;
  }

  marked[start] = { startingDay: true, color: selectedColor };
  marked[end] = { endingDay: true, color: selectedColor };

  const current = new Date(startDate);
  const last = endDate ? new Date(endDate) : new Date(startDate);
  current.setDate(current.getDate() + 1);

  while (current < last) {
    marked[toDateString(current)] = { color: selectedColor };
    current.setDate(current.getDate() + 1);
  }

  return marked;
}

export function DateRangeModal({
  visible,
  onClose,
  onConfirm,
  initialRange,
}: DateRangeModalProps) {
  const { theme, resolvedTheme } = useTheme();
  const today = useMemo(() => new Date(), []);
  const maxDate = useMemo(() => toDateString(today), [today]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      const range = initialRange ?? getDefaultRange();
      setStartDate(toStartOfDay(range.startDate));
      setEndDate(toEndOfDay(range.endDate));
      setValidationError(null);
    }
  }, [visible, initialRange]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      setValidationError(null);
      const selected = new Date(day.dateString);

      if (!startDate || (startDate && endDate)) {
        setStartDate(selected);
        setEndDate(null);
        return;
      }

      if (selected < startDate) {
        setStartDate(selected);
        setEndDate(null);
        return;
      }

      setEndDate(selected);
    },
    [startDate, endDate]
  );

  const handleConfirm = useCallback(() => {
    if (!startDate || !endDate) {
      setValidationError('Selecciona un rango de fechas completo');
      return;
    }

    if (startDate > endDate) {
      setValidationError('La fecha de inicio debe ser anterior o igual a la fecha de fin');
      return;
    }

    onConfirm({
      startDate: toStartOfDay(startDate),
      endDate: toEndOfDay(endDate),
    });
    onClose();
  }, [startDate, endDate, onConfirm, onClose]);

  const markedDates = useMemo(
    () => getMarkedDates(startDate, endDate, theme.primary),
    [startDate, endDate, theme.primary]
  );

  const currentDate = useMemo(
    () => (startDate ? toDateString(startDate) : toDateString(today)),
    [startDate, today]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID="date-range-modal"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View
          key={resolvedTheme}
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text variant="h3">Seleccionar rango</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text variant="body" color="secondary">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rangeDisplay}>
            <Text variant="body" color="secondary">
              {startDate ? formatDate(startDate, 'short') : '—'} {'→'}{' '}
              {endDate ? formatDate(endDate, 'short') : '—'}
            </Text>
          </View>

          <Calendar
            current={currentDate}
            maxDate={maxDate}
            markingType="period"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            firstDay={1}
            theme={{
              calendarBackground: theme.background,
              textSectionTitleColor: theme.textSecondary,
              dayTextColor: theme.text,
              todayTextColor: theme.primary,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: theme.background,
              monthTextColor: theme.text,
              arrowColor: theme.primary,
              textDisabledColor: theme.textDisabled,
              selectedDotColor: theme.background,
              indicatorColor: theme.primary,
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
            }}
            enableSwipeMonths
          />

          {validationError && (
            <View style={styles.errorContainer}>
              <Text variant="caption" color="error">
                {validationError}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <View style={styles.buttonContainer}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={styles.button}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Confirmar"
                onPress={handleConfirm}
                style={styles.button}
                disabled={!startDate || !endDate}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  rangeDisplay: {
    alignItems: 'center',
    marginBottom: 12,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  buttonContainer: {
    flex: 1,
  },
  button: {
    width: '100%',
  },
});
