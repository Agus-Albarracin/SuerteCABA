import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home";
import { CrearUsuario} from "../pages/Usuarios/CrearUsuario";
import { Movimientos } from "../pages/Movimientos";
import { Finanzas } from "../pages/FinanzasAgente"

import { Reportes } from "../pages/Reportes";
import { useAuth } from "../Context";

import  Vistas from "../pages/Usuarios/Vistas";


const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  return roles.includes(user?.rol) ? children : <Navigate to="/" />;
};

export function MyRoutesAgent() {
  const { user } = useAuth();

  return (
    <Routes>
    <Route path="/" element={<Vistas />} />

      {user && (user.rol === "Agente") && (
        <>
          <Route path="/vistas" element={<ProtectedRoute roles={['Admin', 'Agente']}><Vistas /></ProtectedRoute>} />
          <Route path="/movs" element={<ProtectedRoute roles={['Admin', 'Agente']}><Movimientos /></ProtectedRoute>} />
          <Route path="/usuarios/crear" element={<ProtectedRoute roles={['Super','Admin', 'Agente']}><CrearUsuario /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute roles={['Admin', 'Agente']}><Reportes /></ProtectedRoute>} />
          <Route path="/finanzas" element={<ProtectedRoute roles={['Admin', 'Agente']}><Finanzas /></ProtectedRoute>} />

        </>
      )}
    <Route path="*" element={<Vistas />} />

    </Routes>

  );
}