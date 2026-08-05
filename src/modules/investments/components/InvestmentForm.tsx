import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Input, Button } from '../../../shared/components';
import {
  CreateInvestment,
  Investment,
  InvestmentType,
  RenewalType,
} from '../../../domain/entities/Investment';

interface InvestmentFormProps {
  investment?: Investment;
  onSubmit: (data: CreateInvestment) => Promise<Investment | undefined>;
  onCancel: () => void;
}

const investmentTypeLabels: Record<InvestmentType, string> = {
  DP: 'Plazo Fijo',
  FM: 'Fondo Mutuo',
};

const renewalTypeLabels: Record<RenewalType, string> = {
  fixed: 'Fijo',
  renewable: 'Renovable',
};

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date | undefined {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

export function InvestmentForm({ investment, onSubmit, onCancel }: InvestmentFormProps) {
  const { theme } = useTheme();
  const [type, setType] = useState<InvestmentType>(investment?.type ?? 'DP');
  const [name, setName] = useState(investment?.name ?? '');
  const [initialAmount, setInitialAmount] = useState(
    investment ? String(investment.initialAmount) : ''
  );
  const [currentValue, setCurrentValue] = useState(
    investment ? String(investment.currentValue) : ''
  );
  const [purchaseDate, setPurchaseDate] = useState(
    investment ? formatDateForInput(investment.purchaseDate) : formatDateForInput(new Date())
  );
  const [notes, setNotes] = useState(investment?.notes ?? '');

  // DP-specific fields
  const [maturityDate, setMaturityDate] = useState(
    investment?.type === 'DP' && investment.maturityDate
      ? formatDateForInput(investment.maturityDate)
      : ''
  );
  const [interestRate, setInterestRate] = useState(
    investment?.type === 'DP' && investment.interestRate !== undefined
      ? String(investment.interestRate)
      : ''
  );
  const [renewalType, setRenewalType] = useState<RenewalType>(
    investment?.type === 'DP' && investment.renewalType ? investment.renewalType : 'fixed'
  );

  // FM-specific fields
  const [installmentCount, setInstallmentCount] = useState(
    investment?.type === 'FM' && investment.installmentCount
      ? String(investment.installmentCount)
      : ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear type-specific fields when switching type
    if (type === 'DP') {
      setInstallmentCount('');
    } else {
      setMaturityDate('');
      setInterestRate('');
      setRenewalType('fixed');
    }
  }, [type]);

  const isValid = () => {
    if (!name.trim()) return false;
    const initial = parseFloat(initialAmount);
    const current = parseFloat(currentValue);
    if (Number.isNaN(initial) || initial <= 0) return false;
    if (Number.isNaN(current) || current < 0) return false;
    if (!parseDateInput(purchaseDate)) return false;

    if (type === 'DP') {
      if (!maturityDate || !parseDateInput(maturityDate)) return false;
      const rate = parseFloat(interestRate);
      if (Number.isNaN(rate) || rate < 0) return false;
      if (!renewalType) return false;
    }

    if (type === 'FM') {
      const count = parseInt(installmentCount, 10);
      if (Number.isNaN(count) || count <= 0) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!isValid()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const baseData = {
        name: name.trim(),
        type,
        initialAmount: parseFloat(initialAmount),
        currentValue: parseFloat(currentValue),
        purchaseDate: parseDateInput(purchaseDate)!,
        notes: notes.trim() || undefined,
        isActive: true,
      };

      let data: CreateInvestment;

      if (type === 'DP') {
        data = {
          ...baseData,
          maturityDate: parseDateInput(maturityDate)!,
          interestRate: parseFloat(interestRate),
          renewalType,
        };
      } else {
        data = {
          ...baseData,
          installmentCount: parseInt(installmentCount, 10),
        };
      }

      await onSubmit(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la inversión';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text variant="h2" style={styles.title}>
        {investment ? 'Editar inversión' : 'Nueva inversión'}
      </Text>

      <View style={styles.typeSelector}>
        <Button
          title={investmentTypeLabels.DP}
          onPress={() => setType('DP')}
          variant={type === 'DP' ? 'primary' : 'outline'}
          style={styles.typeButton}
        />
        <Button
          title={investmentTypeLabels.FM}
          onPress={() => setType('FM')}
          variant={type === 'FM' ? 'primary' : 'outline'}
          style={styles.typeButton}
        />
      </View>

      <Input
        value={name}
        onChangeText={setName}
        placeholder="Nombre de la inversión"
        autoCapitalize="sentences"
      />

      <Input
        value={initialAmount}
        onChangeText={setInitialAmount}
        placeholder="Monto inicial"
        keyboardType="numeric"
      />

      <Input
        value={currentValue}
        onChangeText={setCurrentValue}
        placeholder="Valor actual"
        keyboardType="numeric"
      />

      <Input
        value={purchaseDate}
        onChangeText={setPurchaseDate}
        placeholder="Fecha de compra (AAAA-MM-DD)"
      />

      <Input
        value={notes}
        onChangeText={setNotes}
        placeholder="Notas (opcional)"
        multiline
        numberOfLines={3}
      />

      {type === 'DP' && (
        <View style={styles.typeFields}>
          <Input
            value={maturityDate}
            onChangeText={setMaturityDate}
            placeholder="Fecha de vencimiento (AAAA-MM-DD)"
          />

          <Input
            value={interestRate}
            onChangeText={setInterestRate}
            placeholder="Tasa de interés anual (%)"
            keyboardType="numeric"
          />

          <View style={styles.renewalSelector}>
            <Button
              title={renewalTypeLabels.fixed}
              onPress={() => setRenewalType('fixed')}
              variant={renewalType === 'fixed' ? 'primary' : 'outline'}
              style={styles.renewalButton}
            />
            <Button
              title={renewalTypeLabels.renewable}
              onPress={() => setRenewalType('renewable')}
              variant={renewalType === 'renewable' ? 'primary' : 'outline'}
              style={styles.renewalButton}
            />
          </View>
        </View>
      )}

      {type === 'FM' && (
        <View style={styles.typeFields}>
          <Input
            value={installmentCount}
            onChangeText={setInstallmentCount}
            placeholder="Cantidad de cuotas"
            keyboardType="numeric"
          />
        </View>
      )}

      {error ? (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
        </Text>
      ) : null}

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
          disabled={!isValid()}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
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
  typeFields: {
    gap: 16,
  },
  renewalSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  renewalButton: {
    flex: 1,
  },
  error: {
    marginTop: 8,
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
