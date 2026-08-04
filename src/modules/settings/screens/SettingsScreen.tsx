import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme';
import { Text } from '../../../shared/components';
import { ThemeSelector } from '../components/ThemeSelector';
import { SyncSettings } from '../components/SyncSettings';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Button } from '../../../shared/components';

export function SettingsScreen() {
  const { theme } = useTheme();
  const { signOut, user } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text variant="h2">Configuración</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ThemeSelector />
        <SyncSettings />

        {user && (
          <View style={styles.account}>
            <Text variant="caption" color="secondary">
              Conectado como: {user.email}
            </Text>
            <Button
              title="Cerrar sesión"
              onPress={signOut}
              variant="outline"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  account: {
    gap: 12,
    padding: 16,
    alignItems: 'center',
  },
});
