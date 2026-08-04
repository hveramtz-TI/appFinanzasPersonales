import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Input, Button } from '../../../shared/components';
import { Category } from '../../../domain/entities/Category';
import { CreateTransaction } from '../../../domain/entities/Transaction';

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: CreateTransaction) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({ categories, onSubmit, onCancel }: TransactionFormProps) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !categoryId) return;

    setLoading(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        type,
        categoryId,
        description: description || undefined,
        date: new Date(),
        tags: [],
      });
      onCancel();
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text variant="h2" style={styles.title}>
        Nueva transacción
      </Text>

      <View style={styles.typeSelector}>
        <Button
          title="Gasto"
          onPress={() => setType('expense')}
          variant={type === 'expense' ? 'primary' : 'outline'}
          style={styles.typeButton}
        />
        <Button
          title="Ingreso"
          onPress={() => setType('income')}
          variant={type === 'income' ? 'primary' : 'outline'}
          style={styles.typeButton}
        />
      </View>

      <Input
        value={amount}
        onChangeText={setAmount}
        placeholder="Monto"
        keyboardType="numeric"
      />

      <View style={styles.categories}>
        {filteredCategories.map(category => (
          <Button
            key={category.id}
            title={`${category.icon} ${category.name}`}
            onPress={() => setCategoryId(category.id)}
            variant={categoryId === category.id ? 'primary' : 'outline'}
            style={styles.categoryButton}
          />
        ))}
      </View>

      <Input
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción (opcional)"
        multiline
      />

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
          disabled={!amount || !categoryId}
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
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    minWidth: 100,
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
