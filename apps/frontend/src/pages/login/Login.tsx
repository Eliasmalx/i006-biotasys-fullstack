import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { api } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { FaUserMd, FaFlask } from "react-icons/fa";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"NUTRICIONISTA" | "LABORATORIO" | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    if (!selectedRole) {
      setError("Por favor selecciona tu perfil antes de iniciar sesión");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.login({
        email,
        password,
        role: selectedRole,
      });

      login(response.user, response.accessToken);

      if (selectedRole === "NUTRICIONISTA") {
        navigate("/dashboardNutritionist");
      } else {
        navigate("/dashboardLaboratory");
      }

    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">

      {/* Columna izquierda */}
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white backdrop-blur-xl border p-8 rounded-2xl shadow-2xl">

            <div className="flex flex-col items-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-5">Acceder a tu cuenta</h1>
              <p className="text-slate-400 text-black">
                Empieza a gestionar y unificar datos de microbiota intestinal
              </p>
            </div>

            {/* Selector de rol */}
            <div className="grid grid-cols-2 gap-4 mb-6">

              {/* Nutricionista */}
              <div
                onClick={() => setSelectedRole("NUTRICIONISTA")}
                className={`cursor-pointer border rounded-xl p-4 text-center transition flex flex-col items-center
                  ${selectedRole === "NUTRICIONISTA" ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
              >
                <FaUserMd className="text-3xl text-indigo-600 mb-2" />
                <h3 className="font-semibold text-black">Nutricionista</h3>
                <p className="text-sm text-gray-500">Alta de pacientes y generación de informes</p>
              </div>

              {/* Laboratorista */}
              <div
                onClick={() => setSelectedRole("LABORATORIO")}
                className={`cursor-pointer border rounded-xl p-4 text-center transition flex flex-col items-center
                  ${selectedRole === "LABORATORIO" ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}`}
              >
                <FaFlask className="text-3xl text-indigo-600 mb-2" />
                <h3 className="font-semibold text-black">Laboratorista</h3>
                <p className="text-sm text-gray-500">Carga de resultados para el nutricionista</p>
              </div>

            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Input
                placeholder="Email corporativo"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-gray-900 placeholder-gray-400 border border-gray-300"
              />

              <Input
                placeholder="Contraseña / Credenciales"
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-gray-900 placeholder-gray-400 border border-gray-300"
              />

              <div className="flex items-center justify-between">
                <Link
                  to="/passwordRecovery"
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  ¿Has olvidado tu contraseña?
                </Link>
              </div>

              <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
                Iniciar sesión
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-slate-400 text-sm">
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/dashboardLaboratory"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div
        className="hidden md:flex items-start justify-start p-0 
        bg-[url('https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500')] 
        bg-cover bg-center opacity-90 w-full h-full flex-col"
      >
        <div className="flex flex-col text-left max-w-md mt-20 ml-10">
          <h1 className="text-white text-5xl font-bold drop-shadow-lg">Biotays</h1>
          <h2 className="text-white text-xl mt-2 drop-shadow-md">Soporte a la decisión clínica</h2>
          <p className="text-white text-base mt-4 drop-shadow">
            El soporte digital especializado en el análisis IA de microbiota y generación de informes.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;



