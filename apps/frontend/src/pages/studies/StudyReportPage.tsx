import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { api } from "../../services/api";
import { mapStudyToReportView, ReportStudy } from "./reportMapper";

const sectionCard = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const tagStyle = "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600";

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
      <div className="min-h-[calc(100vh-80px)] bg-slate-100 px-6 py-10 text-slate-700">
        <div className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          Cargando informe...
        </div>
      </div>
    );
  }

  if (error || !study || !report) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-xl border border-rose-200 bg-white p-8 text-center text-rose-600 shadow-sm">
          {error || "No se pudo cargar el informe."}
        </div>
      </div>
    );
  }

  if (study.status !== "INFORME_LISTO" || !study.normalizedJson) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500"
              onClick={() => navigate(-1)}
            >
              ← Volver
            </button>
          </div>
          <h1 className="mb-3 text-2xl font-semibold text-slate-900">Informe de microbiota intestinal</h1>
          <p className="text-slate-600">
            Este estudio aún no tiene un informe disponible para visualizar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <button
              type="button"
              className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              onClick={() => navigate(-1)}
            >
              ← Volver
            </button>
            <h1 className="mb-3 text-3xl font-semibold">Informe de microbiota intestinal</h1>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
              <span>
                Paciente: <strong className="text-slate-900">{report.header.patientCode}</strong>
              </span>
              <span>
                Estudio: <strong className="font-mono text-slate-900">{report.header.studyCode}</strong>
              </span>
              <span>
                Análisis: <strong className="text-slate-900">{report.header.analysisDate}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={openPdf} disabled={!report.pdfUrl}>
              Descargar archivo original
            </Button>
            <Button type="button" variant="outline" onClick={openPdf} disabled={!report.pdfUrl} className="border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50">
              Generar pdf
            </Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.8fr_1.2fr]">
          <div className="space-y-5">
            <section className={sectionCard}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-600">✓</div>
                <div>
                  <h2 className="text-2xl font-semibold text-emerald-700">{report.summary.title}</h2>
                  <p className="text-sm text-slate-500">Estado global del informe</p>
                </div>
              </div>

              <p className="mb-4 text-sm leading-6 text-slate-700">{report.summary.conclusions}</p>

              <div className="flex flex-wrap gap-2">
                {report.summary.tags.length ? (
                  report.summary.tags.map((tag) => (
                    <span key={tag} className={tagStyle}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No disponible</span>
                )}
              </div>
            </section>

            <section className={sectionCard}>
              <h3 className="mb-4 text-lg font-semibold">Resumen general</h3>
              <p className="mb-4 text-sm leading-6 text-slate-700">{report.generalSummary.summary}</p>
              <div className="flex flex-wrap gap-2">
                {report.generalSummary.summaryTags.length ? (
                  report.generalSummary.summaryTags.map((tag) => (
                    <span key={tag} className={tagStyle}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No disponible</span>
                )}
              </div>
            </section>

            <section className={sectionCard}>
              <h3 className="mb-4 text-lg font-semibold">Métricas destacadas</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-indigo-600">{report.metrics.fbRatio}</div>
                  <div className="mt-1 text-sm text-slate-600">Ratio F/B</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-indigo-600">{report.metrics.shannon}</div>
                  <div className="mt-1 text-sm text-slate-600">Índice Shannon</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-indigo-600">{report.metrics.riskScore}</div>
                  <div className="mt-1 text-sm text-slate-600">Riesgo</div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className={sectionCard}>
              <h3 className="mb-4 text-lg font-semibold">Diversidad y riqueza</h3>
              <div className="space-y-4">
                {report.diversityRows.length ? (
                  report.diversityRows.map((row) => (
                    <div key={row.headline} className="rounded-lg bg-slate-50 p-4">
                      <p className="font-medium text-slate-900">{row.headline}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{row.implication}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No disponible</p>
                )}
              </div>
            </section>

            <section className={sectionCard}>
              <h3 className="mb-4 text-lg font-semibold">Microorganismos oportunistas</h3>
              <div className="space-y-4">
                {report.opportunists.length ? (
                  report.opportunists.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="mt-2 text-sm text-slate-600">{item.implication}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No se detectaron microorganismos oportunistas relevantes.</p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className={sectionCard}>
              <h3 className="mb-4 text-lg font-semibold">Composición bacteriana</h3>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="grid grid-cols-[1fr_130px_1.4fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Género</span>
                  <span>Presencia</span>
                  <span>Evaluación inferida</span>
                </div>
                {report.compositionRows.length ? (
                  report.compositionRows.map((row) => (
                    <div key={`${row.name}-${row.presence}`} className="grid grid-cols-[1fr_130px_1.4fr] gap-4 border-t border-slate-200 px-4 py-4 text-sm">
                      <span className="font-medium text-slate-900">{row.name}</span>
                      <span>
                        <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                          {row.presence}
                        </span>
                      </span>
                      <span className="text-slate-600">{row.implication}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-slate-500">No disponible</div>
                )}
              </div>
            </section>

            <section className={sectionCard}>
              <h3 className="mb-4 text-lg font-semibold">Funciones metabólicas inferidas</h3>
              <div className="space-y-4">
                {report.metabolicFunctions.length ? (
                  report.metabolicFunctions.map((item) => (
                    <div key={item.name} className="rounded-lg bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <span className="text-sm font-medium text-indigo-600">{item.value}</span>
                      </div>
                      <p className="text-sm text-slate-600">{item.implication}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No disponible</p>
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
