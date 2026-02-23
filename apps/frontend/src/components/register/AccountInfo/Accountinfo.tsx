import React from 'react';
import './AccountInfo.css';

interface InvitationInfo {
  email: string;
  organizationName: string;
  organizationId: string;
  role: 'admin' | 'professional' | 'lab_operator';
  specialty?: string;
}

interface AccountInfoProps {
  invitation: InvitationInfo;
  onContinue: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador local',
  professional: 'Profesional',
  lab_operator: 'Operario de laboratorio',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: '*Como administrador local, tendrás acceso completo a la gestión del centro.',
  professional: '*Como profesional, podrás solicitar y consultar análisis clínicos.',
  lab_operator: '*Como operario de laboratorio, podrás procesar muestras y cargar resultados.',
};

export const AccountInfo: React.FC<AccountInfoProps> = ({
  invitation,
  onContinue,
}) => {
  const roleLabel = ROLE_LABELS[invitation.role] || invitation.role;
  const roleDescription = ROLE_DESCRIPTIONS[invitation.role] || '';
  const orgInitial = invitation.organizationName.charAt(0).toUpperCase();
  const orgIdFormatted = `BIO-CLIN-${invitation.organizationId.slice(0, 4).toUpperCase()}`;

  return (
    <div className="account-info">
      <h1 className="account-info__title">Información de tu cuenta</h1>
      <p className="account-info__subtitle">
        Estos datos han sido proporcionados por el sistema. Si detectas algún error,{' '}
        <a href="mailto:soporte@biotasys.com">contacta con el administrador</a>{' '}
        antes de continuar.
      </p>

      {/* Organization Card */}
      <div className="account-info__org-card">
        <div className="account-info__org-left">
          <span className="account-info__org-name">
            {invitation.organizationName}
          </span>
          {invitation.specialty && (
            <span className="account-info__org-specialty">
              {invitation.specialty}
            </span>
          )}
        </div>
        <div className="account-info__org-right">
          <span className="account-info__org-id-label">ID del centro</span>
          <span className="account-info__org-id-badge">{orgIdFormatted}</span>
          <div className="account-info__org-avatar" aria-hidden="true">
            {orgInitial}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="account-info__details">
        <div className="account-info__detail-row">
          <svg className="account-info__detail-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="2" y="4" width="16" height="12" rx="2" />
            <path d="M2 6l8 5 8-5" />
          </svg>
          <div className="account-info__detail-content">
            <span className="account-info__detail-label">Email</span>
            <span className="account-info__detail-value">{invitation.email}</span>
            <span className="account-info__detail-hint">
              *Correo asignado como identificador único de tu cuenta
            </span>
          </div>
        </div>

        <div className="account-info__detail-row">
          <svg className="account-info__detail-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="10" cy="7" r="3.5" />
            <path d="M3.5 18c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" />
          </svg>
          <div className="account-info__detail-content">
            <span className="account-info__detail-label">Rol</span>
            <span className="account-info__detail-value">{roleLabel}</span>
            <span className="account-info__detail-hint">{roleDescription}</span>
          </div>
        </div>
      </div>

      <button className="account-info__btn" onClick={onContinue} type="button">
        Continuar
      </button>
    </div>
  );
};