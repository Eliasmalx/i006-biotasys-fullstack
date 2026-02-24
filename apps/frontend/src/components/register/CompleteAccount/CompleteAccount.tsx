import React, { useState, useCallback, useEffect } from 'react';
import { usePasswordValidation } from '../../../hooks/usePasswordValidation';
import './CompleteAccount.css';

interface CompleteAccountProps {
  email: string;
  onSubmit: (data: { fullName: string; password: string }) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export const CompleteAccount: React.FC<CompleteAccountProps> = ({
  email,
  onSubmit,
  onBack,
  isLoading,
  error,
}) => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { validation, strength, strengthLabel, strengthSegments, validate } =
    usePasswordValidation();

  useEffect(() => {
    validate(password);
  }, [password, validate]);

  const isNameValid = fullName.trim().length >= 3;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const allValidationsPassed = Object.values(validation).every(Boolean);
  const canSubmit =
    isNameValid && allValidationsPassed && passwordsMatch && termsAccepted && !isLoading;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      await onSubmit({ fullName: fullName.trim(), password });
    },
    [canSubmit, fullName, password, onSubmit],
  );

  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="complete-account">
      <h1 className="complete-account__title">Completa tu cuenta</h1>
      <p className="complete-account__subtitle">
        Crea una contraseña segura para acceder{' '}
        <span className="complete-account__avatar-inline" aria-hidden="true">
          {initial}
        </span>{' '}
        cuenta.
      </p>

      {error && <div className="complete-account__error">{error}</div>}

      <form className="complete-account__form" onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="complete-account__field">
          <label className="complete-account__label complete-account__label--required">
            Nombre completo
          </label>
          <div className="complete-account__input-wrapper">
            <input
              className={`complete-account__input ${isNameValid ? 'complete-account__input--valid' : ''}`}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre completo"
              autoComplete="name"
              disabled={isLoading}
            />
            {isNameValid && (
              <span className="complete-account__check-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="complete-account__field">
          <label className="complete-account__label complete-account__label--required">
            Contraseña
          </label>
          <div className="complete-account__input-wrapper">
            <input
              className="complete-account__input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="new-password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="complete-account__input-icon"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z" />
                  <circle cx="10" cy="10" r="2.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z" />
                  <circle cx="10" cy="10" r="2.5" />
                  <line x1="3" y1="3" x2="17" y2="17" />
                </svg>
              )}
            </button>
          </div>

          {/* Strength Meter */}
          {password.length > 0 && (
            <div className="strength-meter">
              <div className="strength-meter__bars">
                {[1, 2, 3, 4].map((segment) => (
                  <div
                    key={segment}
                    className={`strength-meter__bar ${
                      segment <= strengthSegments ? 'strength-meter__bar--filled' : ''
                    }`}
                    data-strength={segment <= strengthSegments ? strength : undefined}
                  />
                ))}
                <span className="strength-meter__label">
                  Seguridad: <strong data-strength={strength}>{strengthLabel}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Validation checklist */}
          <div className="validation-list">
            {[
              { key: 'minLength' as const, label: '12 caracteres' },
              { key: 'hasUppercase' as const, label: '1 mayúscula' },
              { key: 'hasNumber' as const, label: '1 número' },
              { key: 'hasSymbol' as const, label: '1 símbolo' },
            ].map(({ key, label }) => (
              <div
                key={key}
                className={`validation-list__item ${
                  validation[key] ? 'validation-list__item--passed' : ''
                }`}
              >
                {validation[key] ? (
                  <svg className="validation-list__item-icon" viewBox="0 0 16 16" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="validation-list__item-icon" />
                )}
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="complete-account__field">
          <label className="complete-account__label complete-account__label--required">
            Repetir contraseña
          </label>
          <div className="complete-account__input-wrapper">
            <input
              className={`complete-account__input ${
                confirmPassword.length > 0 && !passwordsMatch
                  ? 'complete-account__input--error'
                  : ''
              }`}
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="new-password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="complete-account__input-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Ocultar' : 'Mostrar'}
            >
              {showConfirmPassword ? (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z" />
                  <circle cx="10" cy="10" r="2.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 10s3-6 7.5-6 7.5 6 7.5 6-3 6-7.5 6-7.5-6-7.5-6z" />
                  <circle cx="10" cy="10" r="2.5" />
                  <line x1="3" y1="3" x2="17" y2="17" />
                </svg>
              )}
            </button>
          </div>
          {confirmPassword.length > 0 && passwordsMatch && (
            <span className="complete-account__match">Coincide (respuesta tiempo real)</span>
          )}
          {confirmPassword.length > 0 && !passwordsMatch && (
            <span className="complete-account__match complete-account__match--error">
              Las contraseñas no coinciden
            </span>
          )}
        </div>

        {/* Terms */}
        <div className="complete-account__terms">
          <input
            className="complete-account__checkbox"
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            disabled={isLoading}
          />
          <label className="complete-account__terms-text" htmlFor="terms">
            He leído y acepto la{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Política de Privacidad
            </a>{' '}
            y los{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Términos de Servicio
            </a>
          </label>
        </div>

        {/* Submit */}
        <button className="complete-account__btn" type="submit" disabled={!canSubmit}>
          {isLoading && <span className="complete-account__btn-spinner" />}
          {isLoading ? 'Activando...' : 'Activar y entrar'}
        </button>
      </form>

      {/* Back link */}
      <button className="complete-account__back" onClick={onBack} type="button" disabled={isLoading}>
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z"
            clipRule="evenodd"
          />
        </svg>
        Volver a <strong>Información de cuenta</strong>
      </button>
    </div>
  );
};