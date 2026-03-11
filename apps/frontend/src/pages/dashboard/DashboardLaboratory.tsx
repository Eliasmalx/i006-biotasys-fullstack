import { useEffect, useState } from "react";
import { api } from "../../services/api";

type OrderStatus = "SOLICITADO" | "RECIBIDO" | "EN_ANALISIS" | "INFORME_LISTO" | "RECHAZADO";

interface StudyRow {
  id: string;
  patientCode: string;
  studyCode: string;
  assignedUser?: { name: string };
  createdAt: string;
  status: OrderStatus;
}

export const DashboardLaboratory = () => {
  const [orders, setOrders] = useState<StudyRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [date, setDate] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.listLaboratoryOrders({
        page,
        limit: 10,
        search,
        estado,
        date,
      });

      setOrders(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, estado, date]);

  const resetFilters = () => {
    setSearch("");
    setEstado("");
    setDate("");
    setPage(1);
    loadOrders();
  };

  return (
    <div className="min-h-screen w-full bg-sky-100 text-gray-900 p-6">
      <h1 className="text-2xl font-semibold mb-2">Panel de órdenes</h1>
      <p className="text-gray-600 mb-6">
        Gestión de estudios de microbiota para integración clínica
      </p>

      {/* Search + Filters */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Por paciente (PCT-...), código de estudio (BIO-...), código de origen (LAB-...)"
          className="flex-1 max-w-md border border-gray-300 rounded-lg px-4 py-2 shadow-sm text-gray-800 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadOrders()}
        />

        <div className="flex gap-4">
          <select
            className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800 bg-white"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Estado</option>
            <option value="SOLICITADO">Solicitado</option>
            <option value="RECIBIDO">Recibido</option>
            <option value="EN_ANALISIS">En análisis</option>
            <option value="INFORME_LISTO">Informe listo</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>

          <div className="relative">
            <input
              type="date"
              className="peer border border-gray-300 px-3 py-2 rounded-lg text-gray-800 w-40 bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <span className="absolute left-3 top-2 text-gray-400 pointer-events-none peer-valid:hidden peer-focus:hidden">
              Fecha
            </span>
          </div>

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
              <th className="px-4 py-3">Nutricionista</th>
              <th className="px-4 py-3">Solicitud</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Cargando órdenes...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No hay órdenes disponibles
                </td>
              </tr>
            ) : (
              orders.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">{row.patientCode}</td>
                  <td className="px-4 py-3">{row.studyCode}</td>
                  <td className="px-4 py-3">{row.assignedUser?.name || "-"}</td>
                  <td className="px-4 py-3">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">
                    {row.status === "SOLICITADO" ? (
                      <button className="text-blue-600 underline">
                        Cargar archivo
                      </button>
                    ) : (
                      "-"
                    )}
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
          disabled={orders.length < 10}
          onClick={() => setPage((p) => p + 1)}
        >
          &gt;
        </button>

        <span className="text-gray-500 ml-2">{total} resultados</span>
      </div>
    </div>
  );
};


