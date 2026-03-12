import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import './CreateStudy.css';

interface LaboratoryOption {
  userId: string;
  laboratory: string;
  fullName: string;
  email: string;
}

/* ---- SVG Icons ---- */
const InfoIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  </svg>
);

const WarnIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M8 15A7 7 0 108 1a7 7 0 000 14zm0-9.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 5.5zM8 11a.75.75 0 100 1.5.75.75 0 000-1.5z"
      clipRule="evenodd"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="14" height="13" rx="2" />
    <path d="M3 8h14" />
    <path d="M7 2v4M13 2v4" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14.5 3.5a7 7 0 11-9.9.7" />
    <path d="M14.5 3.5V7H11" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 14 14" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M11.78 3.22a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 011.06-1.06L6 8.44l4.97-4.97a.75.75 0 011.06 0z"
      clipRule="evenodd"
    />
  </svg>
);

// Summary icons
const SummaryDocIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="3" y="2" width="12" height="14" rx="2" />
    <path d="M6 6h6M6 9h6M6 12h3" />
  </svg>
);

const SummaryUserIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
    <circle cx="9" cy="6" r="3" />
    <path d="M3.5 16c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
  </svg>
);

const SummaryCalIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="2.5" y="3.5" width="13" height="12" rx="2" />
    <path d="M2.5 7.5h13" />
    <path d="M6 1.5v3M12 1.5v3" />
  </svg>
);

const SummaryLabIcon = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M7 2v5l-4 7h12l-4-7V2" />
    <path d="M5.5 2h7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const CreateStudyPage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [patientCode, setPatientCode] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState<'MASCULINO' | 'FEMENINO' | ''>('');
  const [studyDate, setStudyDate] = useState('');
  const [assigneeUserId, setAssigneeUserId] = useState('');

  // Lab options
  const [labOptions, setLabOptions] = useState<LaboratoryOption[]>([]);
  const [labLoading, setLabLoading] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-generated study code placeholder
  const studyCodePlaceholder = useMemo(() => {
    const year = new Date().getFullYear();
    const randomNum = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
    return `BIO-${year}-AR-${randomNum}`;
  }, []);

  // Load lab options on mount
  useEffect(() => {
    const loadLabs = async () => {
      setLabLoading(true);
      try {
        const options = await api.listLaboratoryOptions();
        setLabOptions(options);
      } catch (err) {
        console.error('Error loading laboratory options:', err);
      } finally {
        setLabLoading(false);
      }
    };
    loadLabs();
  }, []);

  // Validation
  const isPatientCodeValid = patientCode.trim().length >= 3;
  const isAgeValid = patientAge !== '' && Number(patientAge) >= 1 && Number(patientAge) <= 130;
  const isSexSelected = patientSex !== '';
  const isDateValid = studyDate !== '';
  const isLabSelected = assigneeUserId !== '';

  const canSubmit =
    isPatientCodeValid && isAgeValid && isSexSelected && isDateValid && isLabSelected && !isSubmitting;

  // Selected lab info for summary
  const selectedLab = useMemo(
    () => labOptions.find((l) => l.userId === assigneeUserId),
    [labOptions, assigneeUserId],
  );

  // Format date for display
  const displayDate = useMemo(() => {
    if (!studyDate) return '';
    const parts = studyDate.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return studyDate;
  }, [studyDate]);

  // Sex label for summary
  const sexLabel = useMemo(() => {
    if (patientSex === 'MASCULINO') return 'Masculino';
    if (patientSex === 'FEMENINO') return 'Femenino';
    return '';
  }, [patientSex]);

  // Profile summary text
  const profileSummary = useMemo(() => {
    const parts: string[] = [];
    if (isAgeValid) parts.push(`${patientAge} años`);
    if (sexLabel) parts.push(sexLabel);
    return parts.join(' · ') || '';
  }, [isAgeValid, patientAge, sexLabel]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setServerError(null);

    try {
      await api.createStudy({
        patientCode: patientCode.trim(),
        patientAge: Number(patientAge),
        patientSex: patientSex as 'MASCULINO' | 'FEMENINO',
        studyDate,
        assigneeUserId,
      });

      setSuccess(true);
      // Navigate after brief delay to show success
      setTimeout(() => {
        navigate('/dashboardNutritionist');
      }, 1500);
    } catch (err: any) {
      setServerError(err?.message || 'Error al crear el estudio. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, patientCode, patientAge, patientSex, studyDate, assigneeUserId, navigate]);

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="create-study-page">
      {/* Navbar */}
      <nav className="cs-navbar">
        <a href="#/" className="cs-navbar__logo">
          <svg
            className="cs-navbar__logo-icon"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="#1a2b6d" />
            <circle cx="16" cy="12" r="4" fill="#fff" opacity="0.9" />
            <circle cx="10" cy="20" r="3" fill="#fff" opacity="0.7" />
            <circle cx="22" cy="20" r="3" fill="#fff" opacity="0.7" />
            <circle cx="16" cy="24" r="2" fill="#fff" opacity="0.5" />
          </svg>
          <span className="cs-navbar__logo-text">Biotasys</span>
        </a>

        <div className="cs-navbar__profile">
          <div className="cs-navbar__avatar">EM</div>
          <div className="cs-navbar__user-info">
            <span className="cs-navbar__user-name">Elena Mendoza</span>
            <span className="cs-navbar__user-role">Nutricionista</span>
          </div>
          <svg className="cs-navbar__chevron" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.427 6.427a.75.75 0 011.06-.073L8 8.574l2.513-2.22a.75.75 0 11.994 1.123l-3 2.651a.75.75 0 01-.994 0l-3-2.651a.75.75 0 01-.086-1.077z" />
          </svg>
        </div>
      </nav>

      {/* Content */}
      <div className="cs-content">
        {/* Title */}
        <div className="cs-title-row">
          <button className="cs-back-btn" onClick={handleCancel} aria-label="Volver">
            <ArrowLeftIcon />
          </button>
          <h1 className="cs-page-title">Registro de nuevo estudio</h1>
        </div>

        {/* Error / Success banners */}
        {serverError && <div className="cs-error-banner">{serverError}</div>}
        {success && (
          <div className="cs-success-banner">
            <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.78-8.22a.75.75 0 00-1.06-1.06L7 9.44 5.28 7.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z"
                clipRule="evenodd"
              />
            </svg>
            Estudio creado exitosamente. Redirigiendo...
          </div>
        )}

        {/* Two-column layout */}
        <div className="cs-layout">
          {/* Left: Form */}
          <div className="cs-form-col">
            {/* Section 1: Datos del paciente */}
            <div className="cs-section">
              <h2 className="cs-section__title">Datos del paciente</h2>
              <p className="cs-section__subtitle">
                Datos necesarios para identificar al paciente y asignarlo al profesional responsable
              </p>

              {/* GDPR info banner */}
              <div className="cs-info-banner">
                <div className="cs-info-banner__icon">
                  <InfoIcon />
                </div>
                <p className="cs-info-banner__text">
                  Los datos identificativos del paciente (nombre, apellidos o DNI) deben gestionarse
                  exclusivamente en tu CRM. Biotasys almacena únicamente información clínica
                  seudonimizada, cumpliendo con la normativa GDPR vigente.
                </p>
              </div>

              {/* Row: Patient ID + Age */}
              <div className="cs-form-row">
                <div className="cs-field">
                  <label className="cs-field__label cs-field__label--required">ID de paciente</label>
                  <div className="cs-field__input-wrap">
                    <input
                      className={`cs-field__input ${!isPatientCodeValid && patientCode.length > 0 ? 'cs-field__input--error' : ''}`}
                      type="text"
                      value={patientCode}
                      onChange={(e) => setPatientCode(e.target.value)}
                      placeholder="Ej. PAC-00123"
                      disabled={isSubmitting}
                    />
                  </div>
                  <span className="cs-field__hint">
                    <WarnIcon />
                    Introduce el código del paciente
                  </span>
                </div>

                <div className="cs-field">
                  <label className="cs-field__label cs-field__label--required">Edad del paciente</label>
                  <div className="cs-field__input-wrap">
                    <input
                      className={`cs-field__input ${!isAgeValid && patientAge !== '' ? 'cs-field__input--error' : ''}`}
                      type="number"
                      min="1"
                      max="130"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Ej. 34"
                      disabled={isSubmitting}
                    />
                  </div>
                  <span className="cs-field__hint">
                    <WarnIcon />
                    Dato obligatorio para análisis microbiótico
                  </span>
                </div>
              </div>

              {/* Sex */}
              <div className="cs-field" style={{ marginBottom: 0 }}>
                <label className="cs-field__label cs-field__label--required">Sexo del paciente</label>
                <div className="cs-checkbox-group">
                  <label className="cs-checkbox-item">
                    <span
                      className={`cs-checkbox-item__box ${patientSex === 'MASCULINO' ? 'cs-checkbox-item__box--checked' : ''}`}
                      onClick={() => !isSubmitting && setPatientSex('MASCULINO')}
                    >
                      {patientSex === 'MASCULINO' && <CheckIcon />}
                    </span>
                    <span onClick={() => !isSubmitting && setPatientSex('MASCULINO')}>Masculino</span>
                  </label>
                  <label className="cs-checkbox-item">
                    <span
                      className={`cs-checkbox-item__box ${patientSex === 'FEMENINO' ? 'cs-checkbox-item__box--checked' : ''}`}
                      onClick={() => !isSubmitting && setPatientSex('FEMENINO')}
                    >
                      {patientSex === 'FEMENINO' && <CheckIcon />}
                    </span>
                    <span onClick={() => !isSubmitting && setPatientSex('FEMENINO')}>Femenino</span>
                  </label>
                </div>
                <span className="cs-field__hint" style={{ marginTop: 6 }}>
                  <WarnIcon />
                  Dato obligatorio para análisis microbiótico
                </span>
              </div>
            </div>

            {/* Section 2: Información del estudio */}
            <div className="cs-section">
              <h2 className="cs-section__title">Información del estudio</h2>
              <p className="cs-section__subtitle">
                Carga el archivo exportado desde el equipo de secuenciación con los resultados del análisis
              </p>

              {/* Row: Date + Laboratory */}
              <div className="cs-form-row">
                <div className="cs-field">
                  <label className="cs-field__label cs-field__label--required">Fecha del estudio</label>
                  <div className="cs-field__input-wrap">
                    <input
                      className={`cs-field__input cs-field__input--with-icon ${!isDateValid && studyDate !== '' ? 'cs-field__input--error' : ''}`}
                      type="date"
                      value={studyDate}
                      onChange={(e) => setStudyDate(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <span className="cs-field__icon">
                      <CalendarIcon />
                    </span>
                  </div>
                  <span className="cs-field__hint">
                    <WarnIcon />
                    Selecciona una fecha válida
                  </span>
                </div>

                <div className="cs-field">
                  <label className="cs-field__label cs-field__label--required">Laboratorio responsable</label>
                  <select
                    className={`cs-field__select ${assigneeUserId === '' ? 'cs-field__select--placeholder' : ''} ${!isLabSelected && assigneeUserId === '' ? '' : ''}`}
                    value={assigneeUserId}
                    onChange={(e) => setAssigneeUserId(e.target.value)}
                    disabled={isSubmitting || labLoading}
                  >
                    <option value="">
                      {labLoading ? 'Cargando laboratorios...' : 'Selecciona un laboratorio'}
                    </option>
                    {labOptions.map((lab) => (
                      <option key={lab.userId} value={lab.userId}>
                        {lab.laboratory} — {lab.fullName}
                      </option>
                    ))}
                  </select>
                  <span className="cs-field__hint">
                    <WarnIcon />
                    Selecciona un laboratorio en la lista desplegable
                  </span>
                </div>
              </div>

              {/* Study Code (read-only) */}
              <div className="cs-field">
                <label className="cs-field__label">ID de estudio</label>
                <div className="cs-field__input-wrap">
                  <input
                    className="cs-field__input cs-field__input--readonly cs-field__input--with-icon"
                    type="text"
                    value={studyCodePlaceholder}
                    readOnly
                    tabIndex={-1}
                  />
                  <span className="cs-field__icon cs-field__icon--clickable" title="Adjudicado por el sistema">
                    <RefreshIcon />
                  </span>
                </div>
                <span className="cs-field__hint cs-field__hint--info">(Adjudicado por el sistema)</span>
              </div>
            </div>
          </div>

          {/* Right: Summary Sidebar */}
          <div className="cs-sidebar">
            <div className="cs-summary">
              <h3 className="cs-summary__title">Resumen de estudio</h3>
              <p className="cs-summary__subtitle">
                Los cambios en el formulario se reflejan aquí automáticamente
              </p>

              <div className="cs-summary__list">
                {/* ID de paciente */}
                <div className="cs-summary__item">
                  <span className="cs-summary__item-icon"><SummaryDocIcon /></span>
                  <span className="cs-summary__item-label">ID de paciente</span>
                  <span className={`cs-summary__item-value ${!isPatientCodeValid ? 'cs-summary__item-value--empty' : ''}`}>
                    {isPatientCodeValid ? patientCode.trim() : '—'}
                  </span>
                </div>

                {/* Perfil del paciente */}
                <div className="cs-summary__item">
                  <span className="cs-summary__item-icon"><SummaryUserIcon /></span>
                  <span className="cs-summary__item-label">Perfil del paciente</span>
                  <span className={`cs-summary__item-value ${!profileSummary ? 'cs-summary__item-value--empty' : ''}`}>
                    {profileSummary || '—'}
                  </span>
                </div>

                {/* Fecha del estudio */}
                <div className="cs-summary__item">
                  <span className="cs-summary__item-icon"><SummaryCalIcon /></span>
                  <span className="cs-summary__item-label">Fecha del estudio</span>
                  <span className={`cs-summary__item-value ${!displayDate ? 'cs-summary__item-value--empty' : ''}`}>
                    {displayDate || '—'}
                  </span>
                </div>

                {/* Laboratorio */}
                <div className="cs-summary__item">
                  <span className="cs-summary__item-icon"><SummaryLabIcon /></span>
                  <span className="cs-summary__item-label">Laboratorio</span>
                  <span className={`cs-summary__item-value ${!selectedLab ? 'cs-summary__item-value--empty' : ''}`}>
                    {selectedLab?.laboratory || '—'}
                  </span>
                </div>

                {/* Estudio */}
                <div className="cs-summary__item">
                  <span className="cs-summary__item-icon"><SummaryDocIcon /></span>
                  <span className="cs-summary__item-label">Estudio</span>
                  <span className="cs-summary__item-value cs-summary__item-value--empty" style={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {studyCodePlaceholder}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="cs-summary__actions">
                <button
                  className="cs-btn-cancel"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="cs-btn-submit"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  type="button"
                >
                  {isSubmitting && <span className="cs-btn-submit__spinner" />}
                  {isSubmitting ? 'Creando...' : 'Crear estudio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudyPage;