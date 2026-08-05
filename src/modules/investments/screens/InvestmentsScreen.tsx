import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme';
import { Text, IconButton } from '../../../shared/components';
import { InvestmentList } from '../components/InvestmentList';
import { useInvestments } from '../hooks/useInvestments';

export function InvestmentsScreen() {
  const { theme } = useTheme();
  const { investments, loading, addInvestment, deleteInvestment } = useInvestments();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text variant="h2">Inversiones</Text>
        <IconButton
          name="add"
          onPress={() => {
            // TODO: navigate to investment form (Slice 5)
          }}
        />
      </View>

      {loading ? (
        <View style={styles.empty}>
          <Text variant="body" color="secondary">
            Cargando inversiones...
          </Text>
        </View>
      ) : (
        <InvestmentList
          investments={investments}
          onDelete={deleteInvestment}
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
