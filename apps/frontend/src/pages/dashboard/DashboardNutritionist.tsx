import { useEffect, useState } from "react";
import { Button } from "../../components/common/Button";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

type Estado =
  | "SOLICITADO"
  | "RECIBIDO"
  | "EN_ANALISIS"
  | "INFORME_LISTO"
  | "RECHAZADO";

type ResultadoIA = "equilibrada" | "alterada" | "-" | null;

interface StudyRow {
  id: string;
  patientCode: string;
  studyCode: string;
  patientAge: number;
  patientSex: string;
  createdAt: string;
  assignedUser?: { name: string };
  status: Estado;
  aiResult?: ResultadoIA;
}

export const DashboardNutritionist = () => {
  const [studies, setStudies] = useState<StudyRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [resultadoFilter, setResultadoFilter] = useState("todos");
  const [laboratorioFilter, setLaboratorioFilter] = useState("todos");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [fechaFilter, setFechaFilter] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const loadStudies = async () => {
    setLoading(true);
    try {
      const data = await api.listNutritionistStudies({
        page,
        limit: 10,
        search,
        estado: estadoFilter !== "todos" ? estadoFilter : undefined,
        date: fechaFilter || undefined,
      });

      setStudies(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("Error cargando estudios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudies();
  }, [page, estadoFilter, fechaFilter]);

  const resetFilters = () => {
    setSearch("");
    setResultadoFilter("todos");
    setLaboratorioFilter("todos");
    setEstadoFilter("todos");
    setFechaFilter("");
    setPage(1);
    loadStudies();
  };

  const filtered = studies.filter((row) => {
    const matchResultado =
      resultadoFilter === "todos" ||
      row.aiResult === resultadoFilter ||
      (resultadoFilter === "-" && !row.aiResult);

    const matchLab =
      laboratorioFilter === "todos" ||
      row.assignedUser?.name === laboratorioFilter;

    const matchEstado =
      estadoFilter === "todos" || row.status === estadoFilter;

    return matchResultado && matchLab && matchEstado;
  });

  return (
    <div className="min-h-screen w-full bg-sky-100 text-gray-900 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Panel de estudios</h1>
          <p className="text-gray-600">
            Gestión de estudios de microbiota y generación de informe con IA
          </p>
        </div>

    <Button type="button" className="ml-4" onClick={() => navigate('/studies/new')}>
      + Nuevo estudio
     </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Por paciente (PCT-...) o código de estudio (BIO-...)"
          className="flex-1 max-w-md border border-gray-300 rounded-lg px-4 py-2 shadow-sm text-gray-800 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadStudies()}
        />

        <div className="flex gap-4">
          <select
            className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800 bg-white"
            value={resultadoFilter}
            onChange={(e) => setResultadoFilter(e.target.value)}
          >
            <option value="todos">Resultado</option>
            <option value="equilibrada">Equilibrada</option>
            <option value="alterada">Alterada</option>
            <option value="-">Sin resultado</option>
          </select>

          <select
            className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800 bg-white"
            value={laboratorioFilter}
            onChange={(e) => setLaboratorioFilter(e.target.value)}
          >
            <option value="todos">Laboratorio</option>
            {studies.map((s) =>
              s.assignedUser ? (
                <option key={s.id} value={s.assignedUser.name}>
                  {s.assignedUser.name}
                </option>
              ) : null
            )}
          </select>

          <select
            className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800 bg-white"
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
            className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800 bg-white"
            value={fechaFilter}
            onChange={(e) => setFechaFilter(e.target.value)}
          />

          <button className="text-blue-600 underline" onClick={resetFilters}>
            Restablecer filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">Paciente</th>
              <th className="px-4 py-3">Estudio</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Análisis</th>
              <th className="px-4 py-3">Laboratorio</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Resultado IA</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  Cargando estudios...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No hay estudios disponibles
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">{row.patientCode}</td>
                  <td className="px-4 py-3">{row.studyCode}</td>
                  <td className="px-4 py-3">
                    {row.patientAge} años - {row.patientSex}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {row.assignedUser?.name || "-"}
                  </td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3 capitalize">
                    {row.aiResult || "-"}
                  </td>
                  <td className="px-4 py-3 cursor-pointer text-blue-600 text-lg">
                    ↗
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6 text-gray-700">
        <button
          className="px-2"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          &lt;
        </button>

        <span className="px-2 font-semibold">{page}</span>

        <button
          className="px-2"
          disabled={studies.length < 10}
          onClick={() => setPage((p) => p + 1)}
        >
          &gt;
        </button>

        <span className="text-gray-500 ml-2">{total} resultados</span>
      </div>
    </div>
  );
};

