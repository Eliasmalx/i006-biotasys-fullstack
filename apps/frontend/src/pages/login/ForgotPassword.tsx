import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { User } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
      const { login } = useAuth();
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
    
        try {
          const response = await api.login({ email, password });
          login(response.user, response.accessToken);
          navigate("/dashboard");
        } catch (err: any) {
          setError(err.message || "An unexpected error occurred");
        } finally {
          setIsLoading(false);
        }
      };

    return(
        <>
           <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">

              {/* Columna izquierda: Login */}
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white backdrop-blur-xl border  p-8 rounded-2xl shadow-2xl">

          {/* --- LOGIN COMPLETO --- */}
          <div className="flex flex-col items-center mb-8">
            
            <h1 className="text-3xl font-bold text-black mb-5">Restablecer contraseña</h1>
            <p className="text-slate-400 text-black">
              crea una nueva contraseña para acceder a tu cuenta de manera segura.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                {error}
              </div>
            )}

            <Input
              label="Contraseña"
              placeholder="Contraseña/Credenciales"
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white text-gray-900 placeholder-gray-400 border border-gray-300"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              }
            />

            <Input
              label="Repetir contraseña"
              placeholder="Contraseña/Credenciales"
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white text-gray-900 placeholder-gray-400 border border-gray-300"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              }
            />

            <Button type="submit" className="w-full mt-4" >
              Actualizar y entrar
            </Button>
          </form>

        </div>
      </div>
    </div>

    {/* Columna derecha: Imagen */}
    <div
  className="hidden md:flex items-start justify-start p-0 
             bg-[url('https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500')] 
             bg-cover bg-center opacity-90 w-full h-full flex-col"
    >
       <div className="flex flex-col text-left max-w-md mt-20 ml-10">
         <h1 className="text-white text-5xl font-bold drop-shadow-lg">
          Biotays
         </h1>

         <h2 className="text-white text-xl mt-2 drop-shadow-md">
           Soporte a la decisión clínica
         </h2>

        <p className="text-white text-base mt-4 drop-shadow">
          El soporte digital especializado en el análisis IA de microbiota y generación de informes estructurados y consistentes.
        </p>
      </div>
    </div>

  </div>
</>
);
};