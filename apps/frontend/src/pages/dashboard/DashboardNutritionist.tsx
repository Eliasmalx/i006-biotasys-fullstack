import { useState } from "react";
import { Button } from "../../components/common/Button";

type Estado =
  | "Informe listo"
  | "Rechazado"
  | "Solicitado"
  | "En análisis";

type ResultadoIA = "equilibrada" | "alterada" | "-";

interface StudyRow {
  paciente: string;
  estudio: string;
  perfil: string;
  analisis: string;
  laboratorio: string;
  estado: Estado;
  resultadoIA: ResultadoIA;
}

const mockStudies: StudyRow[] = [
  {
    paciente: "PCT-AR-56321",
    estudio: "BIO-AR-56321",
    perfil: "42 años - F",
    analisis: "12/03/2026",
    laboratorio: "001-Bio Analítica",
    estado: "Informe listo",
    resultadoIA: "equilibrada",
  },
  {
    paciente: "PCT-AR-56321",
    estudio: "BIO-AR-56321",
    perfil: "42 años - F",
    analisis: "12/03/2026",
    laboratorio: "001-Bio Analítica",
    estado: "Rechazado",
    resultadoIA: "-",
  },
  {
    paciente: "PCT-AR-56321",
    estudio: "BIO-AR-56321",
    perfil: "42 años - F",
    analisis: "12/03/2026",
    laboratorio: "001-Bio Analítica",
    estado: "Solicitado",
    resultadoIA: "-",
  },
  {
    paciente: "PCT-AR-56321",
    estudio: "BIO-AR-56321",
    perfil: "42 años - F",
    analisis: "12/03/2026",
    laboratorio: "001-Bio Analítica",
    estado: "En análisis",
    resultadoIA: "-",
  },
  {
    paciente: "PCT-AR-56321",
    estudio: "BIO-AR-56321",
    perfil: "42 años - F",
    analisis: "12/03/2026",
    laboratorio: "001-Bio Analítica",
    estado: "Informe listo",
    resultadoIA: "alterada",
  },
];

export const DashboardNutritionist = () => {
  const [resultadoFilter, setResultadoFilter] = useState("todos");
  const [laboratorioFilter, setLaboratorioFilter] = useState("todos");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [fechaFilter, setFechaFilter] = useState("");

  const filtered = mockStudies.filter((row) => {
    const matchResultado =
      resultadoFilter === "todos" || row.resultadoIA === resultadoFilter;

    const matchLab =
      laboratorioFilter === "todos" || row.laboratorio === laboratorioFilter;

    const matchEstado =
      estadoFilter === "todos" || row.estado === estadoFilter;

    const matchFecha = !fechaFilter || row.analisis === fechaFilter;

    return matchResultado && matchLab && matchEstado && matchFecha;
  });

  return (
    <div className="min-h-screen w-full bg-sky-100 text-gray-900 p-6">
      <div className="flex items-start justify-between mb-6">

  {/* Título + subtítulo */}
        <div>
          <h1 className="text-2xl font-semibold mb-2">Panel de estudios</h1>
          <p className="text-gray-600">
             Gestión de estudios de microbiota y generación de informe con IA para apoyo en la decisión
          </p>
         </div>

  {/* Botón alineado a la derecha */}
         <Button 
         type="submit"
         className="ml-4"
         >
         + Nuevo estudio
         </Button>

    </div>


      {/* Search + Filters */}
      <div className="flex items-center justify-between gap-4 mb-6 bg-white">
        <input
          type="text"
          placeholder="Por paciente (PCT-...) o código de estudio (BIO-...)"
          className="flex-1 max-w-md border border-gray-300 rounded-lg px-4 py-2 shadow-sm text-gray-800"
        />

        <div className="flex gap-4">
          <select
            className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800"
            value={resultadoFilter}
            onChange={(e) => setResultadoFilter(e.target.value)}
          >
            <option value="todos">Resultado</option>
            <option value="equilibrada">Equilibrada</option>
            <option value="alterada">Alterada</option>
            <option value="-">Sin resultado</option>
          </select>

          <select
            className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800"
            value={laboratorioFilter}
            onChange={(e) => setLaboratorioFilter(e.target.value)}
          >
            <option value="todos">Laboratorio</option>
            <option value="001-Bio Analítica">001-Bio Analítica</option>
          </select>

          <select
            className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <option value="todos">Estado</option>
            <option value="Informe listo">Informe listo</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Solicitado">Solicitado</option>
            <option value="En análisis">En análisis</option>
          </select>

          <input
            type="date"
            className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800"
            value={fechaFilter}
            onChange={(e) => setFechaFilter(e.target.value)}
          />

          <button
            className="text-blue-600 underline"
            onClick={() => {
              setResultadoFilter("todos");
              setLaboratorioFilter("todos");
              setEstadoFilter("todos");
              setFechaFilter("");
            }}
          >
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
            {filtered.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-3">{row.paciente}</td>
                <td className="px-4 py-3">{row.estudio}</td>
                <td className="px-4 py-3">{row.perfil}</td>
                <td className="px-4 py-3">{row.analisis}</td>
                <td className="px-4 py-3">{row.laboratorio}</td>
                <td className="px-4 py-3">{row.estado}</td>
                <td className="px-4 py-3 capitalize">{row.resultadoIA}</td>
                <td className="px-4 py-3 cursor-pointer text-blue-600 text-lg">
                  ↗
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6 text-gray-700">
        <button className="px-2">{"<<"}</button>
        <button className="px-2">{"<"}</button>
        <span className="px-2 font-semibold">3</span>
        <button className="px-2">4</button>
        <button className="px-2">5</button>
        <button className="px-2">{">"}</button>
        <button className="px-2">{">>"}</button>
        <span className="text-gray-500 ml-2">125</span>
      </div>
    </div>
  );
};
