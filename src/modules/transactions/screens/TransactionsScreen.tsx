import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme';
import { Text, IconButton } from '../../../shared/components';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import { useTransactions } from '../hooks/useTransactions';

export function TransactionsScreen() {
  const { theme } = useTheme();
  const { transactions, categories, loading, addTransaction, deleteTransaction } = useTransactions();
  const [showForm, setShowForm] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text variant="h2">Transacciones</Text>
        <IconButton
          name={showForm ? 'close' : 'add'}
          onPress={() => setShowForm(!showForm)}
        />
      </View>

      {showForm ? (
        <TransactionForm
          categories={categories}
          onSubmit={addTransaction}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <TransactionList
          transactions={transactions}
          onDelete={deleteTransaction}
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
