import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/login/Login";
import Register from "../pages/Register";
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
            <Register />
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

      {/* Dashboard Laboratorio */}
      <Route
        path="/dashboardLaboratory"
        element={
          <ProtectedRoute role="LABORATORIO">
            <Navbar />
            <DashboardLaboratory />
          </ProtectedRoute>
        }
      />

      {/* Otras rutas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/invitations/accept/:token" element={<AcceptInvitationPage />} />
      <Route path="/passwordRecovery" element={<PasswordRecovery />} />
      <Route path="/passwordReset" element={<PasswordReset />} />

    </Routes>
  );
};

export default AppRoutes;

