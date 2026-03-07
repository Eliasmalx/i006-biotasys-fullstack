import { useState, useRef, useEffect } from "react";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between">

      {/* Logo + nombre */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">B</span>
        </div>

        <h1 className="text-xl font-bold text-black">Biotasys</h1>
      </div>

      {/* Perfil con dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {/* Iniciales */}
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-semibold">EM</span>
          </div>

          {/* Nombre + rol */}
          <div className="flex flex-col leading-tight">
            <span className="text-black font-semibold text-sm">Elena Mendoza</span>
            <span className="text-gray-500 text-xs">Nutricionista</span>
          </div>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-3 w-56 bg-white shadow-lg rounded-xl border p-4 z-50">

            <div className="mb-3">
              <p className="text-sm font-semibold text-black">Elena Mendoza</p>
              <p className="text-xs text-gray-500">elena.mendoza@clinica.es</p>
            </div>

            <button className="w-full text-left px-3 py-2 text-sm text-black hover:bg-gray-100 rounded-lg flex items-center gap-2">
              <span>👤</span> Mi perfil
            </button>

            <button className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 mt-1">
              <span>🔓</span> Cerrar sesión
            </button>

          </div>
        )}
      </div>
    </nav>
  );
};

