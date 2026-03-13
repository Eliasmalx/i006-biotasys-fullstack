import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { api } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { FaUserMd, FaFlask } from "react-icons/fa";

const RegisterComplete: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"nutricionista" | "laboratorio" | null>(null);

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


       login(response.user, response.accessToken, response.refreshToken);


      if (selectedRole === "nutricionista") {
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
          <div className="">

            <div className="flex flex-col items-start mb-8">
              <h1 className="text-3xl font-bold text-black mb-5">¡Registro completado!</h1>
              <p className="text-slate-400 text-black">
                Tu perfil en Biotasys ya está activo. Ahora puedes acceder al sistema para gestionar tus estudios de microbiota.
              </p>
            </div>

              <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
                Iniciar sesión
              </Button>

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

export default RegisterComplete;



