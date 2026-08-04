import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Input, Button } from '../../../shared/components';
import { CreateReminder, ReminderFrequency } from '../../../domain/entities/Reminder';

interface ReminderFormProps {
  onSubmit: (data: CreateReminder) => Promise<void>;
  onCancel: () => void;
}

export function ReminderForm({ onSubmit, onCancel }: ReminderFormProps) {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<ReminderFrequency>('monthly');
  const [nextDate, setNextDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !amount) return;

    setLoading(true);
    try {
      await onSubmit({
        title,
        amount: parseFloat(amount),
        frequency,
        nextDate,
        notificationEnabled: true,
        notificationTime: '09:00',
        isActive: true,
      });
      onCancel();
    } catch (error) {
      console.error('Error creating reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const frequencies: { value: ReminderFrequency; label: string }[] = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' },
    { value: 'once', label: 'Una vez' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text variant="h2" style={styles.title}>
        Nuevo recordatorio
      </Text>

      <Input
        value={title}
        onChangeText={setTitle}
        placeholder="Título (ej: Pago de arriendo)"
      />

      <Input
        value={amount}
        onChangeText={setAmount}
        placeholder="Monto"
        keyboardType="numeric"
      />

      <View style={styles.frequencySelector}>
        {frequencies.map(f => (
          <Button
            key={f.value}
            title={f.label}
            onPress={() => setFrequency(f.value)}
            variant={frequency === f.value ? 'primary' : 'outline'}
            style={styles.frequencyButton}
          />
        ))}
      </View>

      <View style={styles.buttons}>
        <Button
          title="Cancelar"
          onPress={onCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Guardar"
          onPress={handleSubmit}
          loading={loading}
          disabled={!title || !amount}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  frequencySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    minWidth: 80,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
