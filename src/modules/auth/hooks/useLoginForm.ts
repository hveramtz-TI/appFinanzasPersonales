import { useState } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { isValidEmail } from '../../../shared/utils/validators';

export function useLoginForm() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al autenticar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    isSignUp,
    handleSubmit,
    toggleMode,
  };
}
