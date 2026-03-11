import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { User } from "../../types";
import { api } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export const PasswordReset: React.FC = () => {
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

  return (
  <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">


    {/* Columna izquierda: Login */}
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white backdrop-blur-xl border  p-8 rounded-2xl shadow-2xl">

          {/* --- LOGIN COMPLETO --- */}
          <div className="flex flex-col items-center mb-8">
            
            <h1 className="text-3xl font-bold text-black mb-5">¡Correo enviado!</h1>
            <p className="text-slate-400 text-black">
              Revisa tu bandeja de entrada. Hemos enviado un acceso temporal a {} utiliza el boton del correo
              para restablecer tu contraseña.
            </p>

            <p className="text-slate-400 text-black mt-4 mb-10">
              Por seguridad el enlace es de un solo uso y caduca en breve. Si no lo recibes puedes solicitar 
              otro en 59 segundos.
            </p>


          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <Button type="submit" className="w-full mt-4">
                          Reenviar codigo
             </Button>
            
          </div>

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
);


};