import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme';
import { Text, IconButton } from '../../../shared/components';
import { ReminderForm } from '../components/ReminderForm';
import { ReminderList } from '../components/ReminderList';
import { useReminders } from '../hooks/useReminders';

export function RemindersScreen() {
  const { theme } = useTheme();
  const { reminders, loading, addReminder, deleteReminder, markAsPaid } = useReminders();
  const [showForm, setShowForm] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text variant="h2">Recordatorios</Text>
        <IconButton
          name={showForm ? 'close' : 'add'}
          onPress={() => setShowForm(!showForm)}
        />
      </View>

      {showForm ? (
        <ReminderForm
          onSubmit={addReminder}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <ReminderList
          reminders={reminders}
          onDelete={deleteReminder}
          onMarkAsPaid={markAsPaid}
        />
      )}
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
    borderBottomColor: '#E0E0E0',
  },
});
