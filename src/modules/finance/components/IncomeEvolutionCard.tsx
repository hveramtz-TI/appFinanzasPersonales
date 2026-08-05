import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';

interface IncomeEvolutionCardProps {
  onPress: () => void;
}

export function IncomeEvolutionCard({ onPress }: IncomeEvolutionCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text variant="h3" style={styles.title}>
              Ver evolución de ingresos
            </Text>
            <Text variant="caption" color="secondary">
              Analiza tus ingresos a lo largo del tiempo
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={theme.textSecondary}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    marginBottom: 4,
  },
});
