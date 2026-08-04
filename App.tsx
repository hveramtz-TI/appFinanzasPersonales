import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from './src/shared/theme';
import { RootNavigator } from './src/navigation';
import { AppInitializer } from './src/application/AppInitializer';
import { ExpoDatabaseAdapter } from './src/infrastructure/database/ExpoDatabaseAdapter';
import { DatabaseSeedAdapter } from './src/infrastructure/database/DatabaseSeedAdapter';
import { CategoryRepositoryAdapterFactory } from './src/infrastructure/database/CategoryRepositoryAdapter';
import { ConsoleLoggerAdapter } from './src/infrastructure/logging/ConsoleLoggerAdapter';

function AppContent() {
  const { theme } = useTheme();
  const [initializing, setInitializing] = useState(true);

  const initializeApp = useCallback(async () => {
    try {
      const dbFactory = new ExpoDatabaseAdapter();
      const logger = new ConsoleLoggerAdapter();
      const seedAdapter = new DatabaseSeedAdapter(logger);
      const categoryRepoFactory = new CategoryRepositoryAdapterFactory();
      
      const initializer = new AppInitializer(dbFactory, seedAdapter, categoryRepoFactory);
      await initializer.initialize();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (initializing) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
