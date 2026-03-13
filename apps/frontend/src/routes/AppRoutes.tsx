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
import RegisterComplete from "../pages/register/RegisterComplete";

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

      <Route
        path="/register-complete"
        element={
          <PublicRoute>
            <RegisterComplete />
          </PublicRoute>
        }
      />

      {/* Dashboard Nutricionista */}
      <Route
        path="/dashboardNutritionist"
        element={
          <ProtectedRoute role="nutricionista">
            <Navbar />
            <DashboardNutritionist />
          </ProtectedRoute>
        }
      />

      {/* Crear nuevo estudio (Nutricionista) */}
      <Route
        path="/studies/new"
        element={
          <ProtectedRoute role="nutricionista">
            <CreateStudyPage />
           </ProtectedRoute>
        }
      />

      {/* Otras rutas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/invitations/accept/:token" element={<AcceptInvitationPage />} />
      <Route path="/passwordRecovery" element={<PasswordRecovery />} />
      <Route path="/passwoedReset" element={<PasswordReset />} />
      <Route path="/dashboardLaboratory" element={<DashboardNutritionist/>} />
      
    </Routes>
  );
};

export default AppRoutes;