import { useState } from "react";

type OrderStatus = "validado" | "recibido" | "solicitado" | "rechazado";

interface OrderRow {
  paciente: string;
  estudio: string;
  nutricionista: string;
  solicitud: string;
  estado: OrderStatus;
}

const mockData: OrderRow[] = [
  { paciente: "PCT-AR-56321", estudio: "BIO-AR-56321", nutricionista: "001 · Elena Mendoza", solicitud: "12/03/2026", estado: "validado" },
  { paciente: "PCT-AR-56321", estudio: "BIO-AR-56321", nutricionista: "001 · Elena Mendoza", solicitud: "12/03/2026", estado: "recibido" },
  { paciente: "PCT-AR-56321", estudio: "BIO-AR-56321", nutricionista: "001 · Elena Mendoza", solicitud: "12/03/2026", estado: "validado" },
  { paciente: "PCT-AR-56321", estudio: "BIO-AR-56321", nutricionista: "001 · Elena Mendoza", solicitud: "12/03/2026", estado: "solicitado" },
  { paciente: "PCT-AR-56321", estudio: "BIO-AR-56321", nutricionista: "001 · Elena Mendoza", solicitud: "12/03/2026", estado: "solicitado" },
  { paciente: "PCT-AR-56321", estudio: "BIO-AR-56321", nutricionista: "001 · Elena Mendoza", solicitud: "12/03/2026", estado: "rechazado" },
  { paciente: "PCT-AR-56321", estudio: "BIO-AR-56321", nutricionista: "001 · Elena Mendoza", solicitud: "12/03/2026", estado: "recibido" },
  { paciente: "PCT-AR-56321", estudio: "BIO-AR-56321", nutricionista: "001 · Elena Mendoza", solicitud: "12/03/2026", estado: "solicitado" },
];

export const DashboardLaboratory = () => {
  return (
    <div className="min-h-screen w-full bg-sky-100 text-gray-900 p-6">
      <h1 className="text-2xl font-semibold mb-2">Panel de órdenes</h1>
      <p className="text-gray-600 mb-6">
        Gestión de estudios de microbiota para integración clínica
      </p>

      {/* Search bar */}
      {/* Search + Filters en una sola fila */}
<div className="flex items-center justify-between gap-4 mb-6 bg-white">

  {/* Search bar */}
  <input
    type="text"
    placeholder="Por paciente (PCT-...), código de estudio (BIO-...), código de origen (LAB-...)"
    className="flex-1 max-w-md border border-gray-300 rounded-lg px-4 py-2 shadow-sm text-gray-800"
  />

  {/* Filters */}
  <div className="flex gap-4">
    <select className="border border-gray-300 px-3 py-2 rounded-lg text-gray-800">
      <option>Estado</option>
      <option>Validado</option>
      <option>Recibido</option>
      <option>Solicitado</option>
      <option>Rechazado</option>
    </select>

    <div className="relative">
  <input
    type="date"
    className="peer border border-gray-300 px-3 py-2 rounded-lg text-gray-800 w-40"
  />
  <span
    className="absolute left-3 top-2 text-gray-400 pointer-events-none 
               peer-valid:hidden peer-focus:hidden"
  >
    Fecha
  </span>
</div>


    <button className="text-blue-600 underline">
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
            <tr className="border-t">
              <td className="px-4 py-3">PCT-AR-56321</td>
              <td className="px-4 py-3">BIO-AR-56321</td>
              <td className="px-4 py-3">001 · Elena Mendoza</td>
              <td className="px-4 py-3">12/03/2026</td>
              <td className="px-4 py-3">validado</td>
              <td className="px-4 py-3">-</td>
            </tr>

            <tr className="border-t">
              <td className="px-4 py-3">PCT-AR-56321</td>
              <td className="px-4 py-3">BIO-AR-56321</td>
              <td className="px-4 py-3">001 · Elena Mendoza</td>
              <td className="px-4 py-3">12/03/2026</td>
              <td className="px-4 py-3">solicitado</td>
              <td className="px-4 py-3">
                <button className="text-blue-600 underline">Cargar archivo</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6 text-gray-700">
        <button className="px-2">&lt;</button>
        <span className="px-2 font-semibold">1</span>
        <span className="px-2">...</span>
        <button className="px-2">3</button>
        <button className="px-2">4</button>
        <button className="px-2">5</button>
        <span className="px-2">...</span>
        <button className="px-2">&gt;</button>
        <span className="text-gray-500 ml-2">125</span>
      </div>
    </div>
  );
};

