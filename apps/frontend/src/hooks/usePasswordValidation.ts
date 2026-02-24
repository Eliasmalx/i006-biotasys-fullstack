import { useState, useCallback, useMemo } from 'react';

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'excellent';

interface UsePasswordValidationReturn {
  validation: PasswordValidation;
  strength: PasswordStrength;
  strengthLabel: string;
  strengthSegments: number;
  validate: (password: string) => void;
}

export function usePasswordValidation(): UsePasswordValidationReturn {
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  const validate = useCallback((password: string) => {
    setValidation({
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
    });
  }, []);

  const passedCount = useMemo(() => {
    return Object.values(validation).filter(Boolean).length;
  }, [validation]);

  const strength: PasswordStrength = useMemo(() => {
    if (passedCount === 0) return 'empty';
    if (passedCount === 1) return 'weak';
    if (passedCount === 2) return 'fair';
    if (passedCount === 3) return 'good';
    return 'excellent';
  }, [passedCount]);

  const strengthLabel = useMemo(() => {
    const labels: Record<PasswordStrength, string> = {
      empty: '',
      weak: 'Débil',
      fair: 'Regular',
      good: 'Buena',
      excellent: 'Excelente',
    };
    return labels[strength];
  }, [strength]);

  return {
    validation,
    strength,
    strengthLabel,
    strengthSegments: passedCount,
    validate,
  };
}