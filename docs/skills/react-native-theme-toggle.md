# Skill Propuesta: react-native-theme-toggle

## Descripción

Sistema de toggle de tema con tres estados (sistema/claro/oscuro) usando Zustand para persistencia, integración con `useColorScheme` de React Native, paletas de colores completas, y StatusBar dinámica.

## Cuándo usar

- Cualquier proyecto React Native/Expo que necesite dark mode
- Cuando se requiere que el usuario pueda forzar un tema específico
- Para apps que deben respetar la configuración del sistema pero permitir override
- Proyectos que necesitan un sistema de temas extensible y mantenible

## Qué contendría

### Arquitectura

```
┌─────────────────┐
│   React App     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useThemeMode   │ ◄── Hook para cambiar tema
│     (hook)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  themeStore     │ ◄── Zustand store (persist)
│   (zustand)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ThemeProvider   │ ◄── Context provider
│   (context)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useColorScheme │ ◄── React Native hook
│    (RN API)     │
└─────────────────┘
```

### Componentes principales

1. **Theme Mode Types**
   ```typescript
   type ThemeMode = 'system' | 'light' | 'dark';
   type ResolvedTheme = 'light' | 'dark';
   ```

2. **Theme Palette**
   ```typescript
   interface ThemePalette {
     // Backgrounds
     background: string;
     surface: string;
     card: string;
     
     // Text
     text: string;
     textSecondary: string;
     textDisabled: string;
     
     // Primary
     primary: string;
     primaryLight: string;
     primaryDark: string;
     
     // Semantic
     success: string;
     warning: string;
     error: string;
     info: string;
     
     // Borders
     border: string;
     divider: string;
     
     // Shadows
     shadow: string;
   }
   ```

3. **Zustand Store**
   ```typescript
   interface ThemeStore {
     mode: ThemeMode;
     setMode: (mode: ThemeMode) => void;
   }
   ```

4. **ThemeProvider**
   - Resuelve tema final (system → light/dark)
   - Provee paleta de colores via Context
   - Actualiza StatusBar dinámicamente

### Código de ejemplo

```typescript
// shared/theme/types.ts
export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemePalette {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  divider: string;
  shadow: string;
}

// shared/theme/palettes.ts
export const lightPalette: ThemePalette = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textDisabled: '#9E9E9E',
  primary: '#2196F3',
  primaryLight: '#64B5F6',
  primaryDark: '#1976D2',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkPalette: ThemePalette = {
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textDisabled: '#6B6B6B',
  primary: '#64B5F6',
  primaryLight: '#90CAF9',
  primaryDark: '#2196F3',
  success: '#81C784',
  warning: '#FFB74D',
  error: '#E57373',
  info: '#64B5F6',
  border: '#3C3C3C',
  divider: '#2C2C2C',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// shared/theme/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from './types';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// shared/theme/ThemeProvider.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { useThemeStore } from './store';
import { lightPalette, darkPalette } from './palettes';
import { ThemePalette, ResolvedTheme } from './types';

interface ThemeContextValue {
  theme: ThemePalette;
  resolvedTheme: ResolvedTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { mode, setMode } = useThemeStore();

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  const theme = resolvedTheme === 'dark' ? darkPalette : lightPalette;

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      mode,
      setMode,
    }),
    [theme, resolvedTheme, mode, setMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// shared/theme/useThemeMode.ts
export function useThemeMode() {
  const { mode, setMode, resolvedTheme } = useTheme();

  return {
    mode,
    setMode,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    toggleMode: () => {
      const modes: ThemeMode[] = ['system', 'light', 'dark'];
      const currentIndex = modes.indexOf(mode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      setMode(nextMode);
    },
  };
}
```

### Uso en componentes

```typescript
// presentation/screens/SettingsScreen.tsx
import { useThemeMode } from '@/shared/theme';

export function SettingsScreen() {
  const { mode, setMode, isDark } = useThemeMode();
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Tema</Text>
      
      <SegmentedControl
        values={['Sistema', 'Claro', 'Oscuro']}
        selectedIndex={['system', 'light', 'dark'].indexOf(mode)}
        onChange={(index) => {
          const modes: ThemeMode[] = ['system', 'light', 'dark'];
          setMode(modes[index]);
        }}
      />
    </View>
  );
}

// presentation/components/ThemedCard.tsx
export function ThemedCard({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      {children}
    </View>
  );
}
```

### Configuración de app.json

```json
{
  "expo": {
    "userInterfaceStyle": "automatic",
    "ios": {
      "userInterfaceStyle": "automatic"
    },
    "android": {
      "userInterfaceStyle": "automatic"
    }
  }
}
```

## Dependencias

- `zustand` (estado global con persistencia)
- `@react-native-async-storage/async-storage` (persistencia del tema)
- `expo-system-ui` (opcional, para system bars en Android)

## Notas de implementación

- **Tres estados**: 'system' respeta el dispositivo, 'light'/'dark' fuerzan el tema
- **Persistencia**: Zustand con AsyncStorage guarda la preferencia del usuario
- **StatusBar dinámica**: Cambia automáticamente según el tema resuelto
- **Paletas extensibles**: Fácil agregar más colores o variantes
- **Type-safe**: TypeScript para todas las paletas y tipos
- **No requiere restart**: El cambio de tema es instantáneo

## Edge cases a manejar

1. **Primer lanzamiento**: Default a 'system' para respetar preferencia del dispositivo
2. **Cambio de sistema**: Si mode='system', actualizar automáticamente cuando el usuario cambia el tema del dispositivo
3. **AsyncStorage no disponible**: Fallback a memoria (se pierde al cerrar app)
4. **Colores de gráficos**: Los charts deben usar colores de la paleta actual
5. **Imágenes/iconos**: Considerar versiones light/dark de assets si es necesario

## Ventajas sobre alternativas

- **vs React Context solo**: Zustand es más performante y tiene persistencia built-in
- **vs styled-components**: Más simple, sin runtime overhead
- **vs React Navigation theme**: Más flexible, no atado a navegación

## Estado

**Propuesta** - Pendiente de implementación después del MVP de appFinanzasPersonales
