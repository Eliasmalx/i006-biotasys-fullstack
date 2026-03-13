import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { api } from "../../services/api";

type Estado =
  | "SOLICITADO"
  | "RECIBIDO"
  | "EN_ANALISIS"
  | "INFORME_LISTO"
  | "RECHAZADO";

interface StudyRow {
  id: string;
  patientCode: string;
  studyCode: string;
  patientAge: number;
  patientSex: string;
  studyDate: string;
  createdAt: string;
  status: Estado;
  pdfUrl?: string | null;
  assignee?: {
    id: string;
    fullName: string;
    email: string;
    role: string | null;
  } | null;
}

interface StudiesResponse {
  data: StudyRow[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_LABELS: Record<Estado, string> = {
  SOLICITADO: "Solicitado",
  RECIBIDO: "Recibido",
  EN_ANALISIS: "En análisis",
  INFORME_LISTO: "Informe listo",
  RECHAZADO: "Rechazado",
};

const STATUS_STYLES: Record<Estado, string> = {
  SOLICITADO: "bg-slate-100 text-slate-700",
  RECIBIDO: "bg-amber-100 text-amber-700",
  EN_ANALISIS: "bg-sky-100 text-sky-700",
  INFORME_LISTO: "bg-emerald-100 text-emerald-700",
  RECHAZADO: "bg-rose-100 text-rose-700",
};

export const DashboardNutritionist = () => {
  const [studies, setStudies] = useState<StudyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [laboratorioFilter, setLaboratorioFilter] = useState("todos");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [fechaFilter, setFechaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const loadStudies = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = (await api.listNutritionistStudies({
        page,
        limit: 10,
        search: search || undefined,
        estado: estadoFilter !== "todos" ? estadoFilter : undefined,
        date: fechaFilter || undefined,
      })) as StudiesResponse;

      setStudies(result.data ?? []);
      setTotal(result.total ?? 0);
    } catch (err) {
      console.error("Error cargando estudios:", err);
      setError("No se pudieron cargar los estudios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudies();
  }, [page, estadoFilter, fechaFilter]);

  const resetFilters = () => {
    setSearch("");
    setLaboratorioFilter("todos");
    setEstadoFilter("todos");
    setFechaFilter("");
    setPage(1);
  };

  const laboratories = useMemo(() => {
    const uniqueLabs = new Map<string, string>();

    studies.forEach((study) => {
      if (study.assignee?.fullName) {
        uniqueLabs.set(study.assignee.id, study.assignee.fullName);
      }
    });

    return Array.from(uniqueLabs.entries());
  }, [studies]);

  const filtered = studies.filter((row) => {
    const term = search.trim().toLowerCase();
    const matchSearch =
      !term ||
      row.patientCode.toLowerCase().includes(term) ||
      row.studyCode.toLowerCase().includes(term);

    const matchLab =
      laboratorioFilter === "todos" || row.assignee?.id === laboratorioFilter;

    const matchEstado =
      estadoFilter === "todos" || row.status === estadoFilter;

    const matchFecha = !fechaFilter || row.studyDate === fechaFilter;

    return matchSearch && matchLab && matchEstado && matchFecha;
  });

  const hasNextPage = page * 10 < total;

  return (
    <div className="min-h-screen w-full bg-slate-100 text-gray-900 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-semibold">Panel de estudios</h1>
            <p className="text-gray-600">
              Gestión de estudios de microbiota y generación de informe con IA
            </p>
          </div>

          <Button type="button" onClick={() => navigate("/studies/new")}>
            + Nuevo estudio
          </Button>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <input
              type="text"
              placeholder="Por paciente (PCT-...) o código de estudio (BIO-...)"
              className="w-full max-w-xl rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadStudies()}
            />

            <div className="flex flex-wrap gap-3">
              <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
                value={laboratorioFilter}
                onChange={(e) => setLaboratorioFilter(e.target.value)}
              >
                <option value="todos">Laboratorio</option>
                {laboratories.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <option value="todos">Estado</option>
                <option value="SOLICITADO">Solicitado</option>
                <option value="RECIBIDO">Recibido</option>
                <option value="EN_ANALISIS">En análisis</option>
                <option value="INFORME_LISTO">Informe listo</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>

              <input
                type="date"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800"
                value={fechaFilter}
                onChange={(e) => setFechaFilter(e.target.value)}
              />

              <button className="text-sm font-medium text-blue-600 underline" onClick={resetFilters}>
                Restablecer filtros
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-slate-50 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3">Estudio</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Análisis</th>
                <th className="px-4 py-3">Laboratorio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>

            <tbody className="text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Cargando estudios...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No hay estudios disponibles
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="px-4 py-4 font-medium">{row.patientCode}</td>
                    <td className="px-4 py-4 font-mono text-sm text-indigo-600">{row.studyCode}</td>
                    <td className="px-4 py-4">
                      {row.patientAge} años - {row.patientSex}
                    </td>
                    <td className="px-4 py-4">
                      {new Date(row.studyDate || row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">{row.assignee?.fullName || "-"}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}>
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {row.status === "INFORME_LISTO" ? (
                        <button
                          type="button"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                          onClick={() => navigate(`/studies/${row.id}/report`)}
                        >
                          Ver informe
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No disponible</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-gray-700">
          <button
            className="rounded px-2 py-1 disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            &lt;
          </button>

          <span className="font-semibold">{page}</span>

          <button
            className="rounded px-2 py-1 disabled:opacity-40"
            disabled={!hasNextPage}
            onClick={() => setPage((current) => current + 1)}
          >
            &gt;
          </button>

          <span className="ml-2 text-sm text-gray-500">{total} resultados</span>
        </div>
      </div>
    </div>
  );
};
