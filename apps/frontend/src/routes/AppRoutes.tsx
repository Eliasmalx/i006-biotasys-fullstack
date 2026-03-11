import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/login/Login";
import { RegisterPage } from "../pages/register/RegisterPage";
import { CreateStudyPage } from "../pages/studies/CreateStudy";
import { DashboardNutritionist } from "../pages/dashboard/DashboardNutritionist";
import { DashboardLaboratory } from "../pages/dashboard/DashboardLaboratory";
import { AcceptInvitationPage } from "../pages/AcceptInvitation";
import { PasswordRecovery } from "../pages/login/PasswordRecovery";
import { PasswordReset } from "../pages/login/PasswordReset";
import { ForgotPassword } from "../pages/login/ForgotPassword";
import { Navbar } from "../pages/Navbar";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Dashboard Nutricionista */}
      <Route
        path="/dashboardNutritionist"
        element={
          <ProtectedRoute role="NUTRICIONISTA">
            <Navbar />
            <DashboardNutritionist />
          </ProtectedRoute>
        }
      />

      {/* Crear nuevo estudio (Nutricionista) */}
      <Route
        path="/studies/new"
        element={
          
            <CreateStudyPage />
  
        }
      />

      {/* Otras rutas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/invitations/accept/:token" element={<AcceptInvitationPage />} />
      <Route path="/passwoedRecovery" element={<PasswordRecovery />} />
      <Route path="/passwoedReset" element={<PasswordReset />} />
      <Route path="/dashboardLaboratory" element={<DashboardNutritionist/>} />
      
    </Routes>
  );
};

export default AppRoutes;