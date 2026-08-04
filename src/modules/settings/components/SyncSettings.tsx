import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { useSync, useOnlineStatus } from '../../../shared/hooks';
import { Text, Card, Button } from '../../../shared/components';

export function SyncSettings() {
  const { theme } = useTheme();
  const { sync, syncing } = useSync();
  const { isOnline } = useOnlineStatus();

  return (
    <Card>
      <Text variant="h3" style={styles.title}>
        Sincronización
      </Text>
      
      <View style={styles.status}>
        <View style={[styles.indicator, { backgroundColor: isOnline ? theme.success : theme.error }]} />
        <Text variant="body">
          {isOnline ? 'En línea' : 'Sin conexión'}
        </Text>
      </View>

      <Button
        title={syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
        onPress={sync}
        loading={syncing}
        disabled={!isOnline}
        variant="outline"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
