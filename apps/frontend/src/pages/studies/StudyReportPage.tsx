import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { api } from "../../services/api";
import { mapStudyToReportView, ReportMetricGauge, ReportStudy } from "./reportMapper";
import "./StudyReportPage.css";

const Gauge = ({ item }: { item: ReportMetricGauge }) => {
  const radius = 42;
  const circumference = Math.PI * radius;
  const offset = circumference - (item.percent / 100) * circumference;

  return (
    <div className="report-gauge">
      <svg viewBox="0 0 120 80" className="report-gauge__svg" aria-hidden="true">
        <path d="M18 62a42 42 0 0 1 84 0" className="report-gauge__track" />
        <path
          d="M18 62a42 42 0 0 1 84 0"
          className="report-gauge__progress"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
        <line
          x1="60"
          y1="62"
          x2={String(60 + 26 * Math.cos((Math.PI * (item.percent / 100)) - Math.PI))}
          y2={String(62 + 26 * Math.sin((Math.PI * (item.percent / 100)) - Math.PI))}
          className="report-gauge__needle"
        />
        <circle cx="60" cy="62" r="4" className="report-gauge__center" />
      </svg>
      <div className="report-gauge__value">{item.value}</div>
      <div className="report-gauge__label">{item.label}</div>
      <div className="report-gauge__caption">{item.caption}</div>
    </div>
  );
};

export const StudyReportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<ReportStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Estudio no válido.");
      setLoading(false);
      return;
    }

    const loadStudy = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.getStudyById(id);
        setStudy(result as ReportStudy);
      } catch (err) {
        console.error("Error obteniendo estudio:", err);
        setError("No se pudo cargar el informe del estudio.");
      } finally {
        setLoading(false);
      }
    };

    loadStudy();
  }, [id]);

  const report = useMemo(() => (study ? mapStudyToReportView(study) : null), [study]);

  const openPdf = () => {
    if (!report?.pdfUrl) return;
    window.open(report.pdfUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="report-page report-page--state">
        <div className="report-shell report-state">Cargando informe...</div>
      </div>
    );
  }

  if (error || !study || !report) {
    return (
      <div className="report-page report-page--state">
        <div className="report-shell report-state report-state--error">
          {error || "No se pudo cargar el informe."}
        </div>
      </div>
    );
  }

  if (study.status !== "INFORME_LISTO" || !study.normalizedJson) {
    return (
      <div className="report-page report-page--state">
        <div className="report-shell report-state">
          <button type="button" className="report-back" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <h1 className="report-title">Informe de microbiota intestinal</h1>
          <p className="report-empty">Este estudio aún no tiene un informe disponible para visualizar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      <div className="report-shell">
        <div className="report-topbar">
          <div className="report-topbar__left">
            <button type="button" className="report-back" onClick={() => navigate(-1)}>
              ←
            </button>
            <div>
              <h1 className="report-title">Informe de microbiota intestinal</h1>
              <div className="report-meta">
                <span>Paciente: <strong>{report.header.patientCode}</strong></span>
                <span>Estudio: <strong className="report-meta__code">{report.header.studyCode}</strong></span>
                <span>Análisis: <strong>{report.header.analysisDate}</strong></span>
              </div>
            </div>
          </div>

          <div className="report-actions">
            <Button type="button" className="report-actions__primary" onClick={openPdf} disabled={!report.pdfUrl}>
              + Descargar archivo original
            </Button>
            <button type="button" className="report-actions__secondary" onClick={openPdf} disabled={!report.pdfUrl}>
              Generar pdf
            </button>
          </div>
        </div>

        <div className="report-grid">
          <div className="report-column report-column--left">
            <section className="report-card report-card--hero">
              <div className="report-card__header report-card__header--success">
                <span className="report-card__icon">✓</span>
                <h2>{report.summary.title}</h2>
              </div>
              <div className="report-card__body">
                <p className="report-card__text">{report.summary.description}</p>
                <div className="report-tags">
                  {report.summary.tags.length ? (
                    report.summary.tags.map((tag) => (
                      <span key={tag} className="report-tag">{tag}</span>
                    ))
                  ) : (
                    <span className="report-empty-inline">No disponible</span>
                  )}
                </div>
              </div>
            </section>

            <section className="report-card">
              <div className="report-card__header">
                <h3>{report.generalSummary.title}</h3>
              </div>
              <div className="report-card__body report-card__body--spaced">
                <p className="report-card__text">{report.generalSummary.description}</p>
                <div className="report-tags">
                  {report.generalSummary.tags.length ? (
                    report.generalSummary.tags.map((tag) => (
                      <span key={tag} className="report-tag">{tag}</span>
                    ))
                  ) : (
                    <span className="report-empty-inline">No disponible</span>
                  )}
                </div>
                <div className="report-gauges">
                  {report.metrics.gauges.map((item) => (
                    <Gauge key={item.label} item={item} />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="report-column report-column--middle">
            <section className="report-card">
              <div className="report-card__header">
                <h3>Diversidad y riqueza</h3>
              </div>
              <div className="report-list">
                {report.diversityRows.length ? (
                  report.diversityRows.map((row) => (
                    <div key={row.headline} className="report-list__item">
                      <div className="report-list__bullet">•</div>
                      <div>
                        <p className="report-list__title">{row.headline}</p>
                        <p className="report-list__text">{row.implication}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="report-empty-block">No disponible</div>
                )}
              </div>
            </section>

            <section className="report-card">
              <div className="report-card__header">
                <h3>Microorganismos oportunistas</h3>
              </div>
              <div className="report-opportunists">
                {report.opportunists.map((item) => (
                  <div key={item.name} className="report-opportunists__item">
                    <p className="report-opportunists__title">{item.name}</p>
                    <p className="report-opportunists__text">{item.implication}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="report-column report-column--right">
            <section className="report-card">
              <div className="report-card__header">
                <h3>Composición bacteriana</h3>
              </div>
              <div className="report-table">
                <div className="report-table__head">
                  <span>Género</span>
                  <span>Presencia</span>
                  <span>Evaluación inferida</span>
                </div>
                {report.compositionRows.length ? (
                  report.compositionRows.map((row) => (
                    <div key={`${row.name}-${row.presence}`} className="report-table__row">
                      <span className="report-table__name">{row.name}</span>
                      <span>
                        <span className="report-presence">{row.presence}</span>
                      </span>
                      <span className="report-table__text">{row.implication}</span>
                    </div>
                  ))
                ) : (
                  <div className="report-empty-block">No disponible</div>
                )}
              </div>
            </section>

            <section className="report-card">
              <div className="report-card__header">
                <h3>Funciones metabólicas inferidas</h3>
              </div>
              <div className="report-functions">
                {report.metabolicFunctions.length ? (
                  report.metabolicFunctions.map((item) => (
                    <div key={item.name} className="report-function">
                      <div className="report-function__header">
                        <span className="report-function__name">{item.name}</span>
                        <span className="report-function__value">{item.value}</span>
                      </div>
                      <div className="report-function__bar">
                        <span className="report-function__fill" style={{ width: `${item.percent}%` }} />
                      </div>
                      <p className="report-function__text">{item.implication}</p>
                    </div>
                  ))
                ) : (
                  <div className="report-empty-block">No disponible</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyReportPage;