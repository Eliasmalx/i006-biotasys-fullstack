import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/login/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import { AcceptInvitationPage } from "../pages/AcceptInvitation";
import { PasswordRecovery } from "../pages/login/PasswordRecovery";
import { PasswordReset } from "../pages/login/PasswordReset";
import { ForgotPassword } from "../pages/login/ForgotPassword";
import { DashboardLaboratory } from "../pages/dashboard/DashboardLaboratory";
import { DashboardNutritionist } from "../pages/dashboard/DashboardNutritionist";
import { Navbar } from "../pages/Navbar";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navbar/>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/invitations/accept/:token" element={<AcceptInvitationPage />} />
      <Route path="/passwoedRecovery" element={<PasswordRecovery />} />
      <Route path="/passwoedReset" element={<PasswordReset />} />
      <Route path="/dashboardLaboratory" element={<DashboardNutritionist/>} />
      
    </Routes>
  );
};

export default AppRoutes;
