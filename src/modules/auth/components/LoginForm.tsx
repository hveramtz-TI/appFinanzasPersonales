import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Input, Button } from '../../../shared/components';
import { useLoginForm } from '../hooks/useLoginForm';

export function LoginForm() {
  const { theme } = useTheme();
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    isSignUp,
    handleSubmit,
    toggleMode,
  } = useLoginForm();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text variant="h1" style={styles.title}>
        {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
      </Text>

      <Text variant="body" color="secondary" style={styles.subtitle}>
        {isSignUp
          ? 'Regístrate para comenzar a gestionar tus finanzas'
          : 'Ingresa tus credenciales para continuar'}
      </Text>

      <View style={styles.form}>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />

        {error && (
          <Text variant="caption" color="error" style={styles.error}>
            {error}
          </Text>
        )}

        <Button
          title={isSignUp ? 'Registrarse' : 'Iniciar sesión'}
          onPress={handleSubmit}
          loading={loading}
        />

        <Button
          title={isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          onPress={toggleMode}
          variant="outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  error: {
    textAlign: 'center',
  },
});
