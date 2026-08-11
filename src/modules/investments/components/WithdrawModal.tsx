import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Button, Input } from '../../../shared/components';
import { Investment } from '../../../domain/entities/Investment';
import { formatCurrency } from '../../../shared/utils/formatters';

interface WithdrawModalProps {
  visible: boolean;
  investment: Investment | null;
  onClose: () => void;
  onWithdraw: (amount: number, isFull: boolean) => void;
  loading?: boolean;
}

export function WithdrawModal({
  visible,
  investment,
  onClose,
  onWithdraw,
  loading = false,
}: WithdrawModalProps) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [isFull, setIsFull] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount) || 0;
  const maxAmount = investment?.currentValue ?? 0;

  const handleWithdraw = () => {
    setError(null);

    if (isFull) {
      onWithdraw(maxAmount, true);
      return;
    }

    if (parsedAmount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (parsedAmount > maxAmount) {
      setError('El monto no puede exceder el valor actual');
      return;
    }

    onWithdraw(parsedAmount, false);
  };

  const handleClose = () => {
    setAmount('');
    setIsFull(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          <Text variant="h3" style={styles.title}>
            Retirar inversión
          </Text>

          {investment && (
            <View style={styles.info}>
              <Text variant="body" style={{ color: theme.text }}>
                {investment.name}
              </Text>
              <Text variant="caption" color="secondary" style={styles.valueLabel}>
                Valor actual: {formatCurrency(investment.currentValue)}
              </Text>
            </View>
          )}

          <View style={styles.toggleRow}>
            <Text variant="body" style={{ color: theme.text }}>
              Retiro total
            </Text>
            <Switch
              value={isFull}
              onValueChange={(value) => {
                setIsFull(value);
                setError(null);
                if (value) setAmount('');
              }}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={isFull ? theme.primary : theme.surface}
            />
          </View>

          {!isFull && (
            <View style={styles.amountInput}>
              <Text variant="caption" color="secondary" style={styles.inputLabel}>
                Monto a retirar
              </Text>
              <Input
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  setError(null);
                }}
                placeholder="0"
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
          )}

          {isFull && (
            <View style={[styles.fullInfo, { backgroundColor: theme.surface }]}>
              <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
                Se retirará el valor completo ({formatCurrency(maxAmount)}) y la inversión se marcará como inactiva.
              </Text>
            </View>
          )}

          {error && (
            <Text variant="caption" color="error" style={styles.error}>
              {error}
            </Text>
          )}

          <View style={styles.buttons}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleClose}
              disabled={loading}
              style={styles.button}
            />
            <Button
              title={loading ? 'Procesando...' : 'Retirar'}
              onPress={handleWithdraw}
              disabled={loading || (!isFull && parsedAmount <= 0)}
              style={styles.button}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  info: {
    alignItems: 'center',
    gap: 4,
  },
  valueLabel: {
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountInput: {
    gap: 4,
  },
  inputLabel: {
    marginBottom: 2,
  },
  fullInfo: {
    borderRadius: 8,
    padding: 12,
  },
  error: {
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
