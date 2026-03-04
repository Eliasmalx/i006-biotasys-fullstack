import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/register/Header/Header';
import { Stepper } from '../components/register/Stepper/Stepper';
import { AccountInfo } from '../components/register/AccountInfo/AccountInfo';
import { CompleteAccount } from '../components/register/CompleteAccount/CompleteAccount';
import { Footer } from '../components/register/Footer/Footer';
import { authService } from '../services/authService';
import './AcceptInvitation.css';

// TODO: En producción, obtener estos datos de un GET al backend con el token
const MOCK_INVITATION = {
  email: 'dr.martin@clinicaprivada.es',
  organizationName: 'Clínica Santa María',
  organizationId: '0234',
  role: 'admin' as const,
  specialty: 'Gastroenterología',
};

export const AcceptInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invitation = MOCK_INVITATION;

  const handleContinue = useCallback(() => {
    setCurrentStep(2);
    setError(null);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep(1);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (data: { fullName: string; password: string }) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.acceptInvitation({
          token,
          fullName: data.fullName,
          password: data.password,
        });

        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/dashboard');
      } catch (err: any) {
        setError(err?.message || 'Ha ocurrido un error al activar tu cuenta.');
      } finally {
        setIsLoading(false);
      }
    },
    [token, navigate],
  );

  // Token inválido
  if (!token || token.length < 64) {
    return (
      <div className="accept-invitation">
        <Header />
        <div className="accept-invitation__content">
          <div className="accept-invitation__card">
            <div className="accept-invitation__error-state">
              <h2>Enlace de invitación no válido</h2>
              <p>
                El enlace que has utilizado no es válido o ha expirado.
                Contacta con tu administrador para recibir una nueva invitación.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="accept-invitation">
      <Header />
      <div className="accept-invitation__content">
        <div className="accept-invitation__card">
          <Stepper currentStep={currentStep} />

          {currentStep === 1 && (
            <AccountInfo invitation={invitation} onContinue={handleContinue} />
          )}

          {currentStep === 2 && (
            <CompleteAccount
              email={invitation.email}
              onSubmit={handleSubmit}
              onBack={handleBack}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};