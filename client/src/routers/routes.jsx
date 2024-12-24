import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Finanzas } from "../pages/Finanzas"
import { Settings } from "../pages/Settings"
import { CrearUsuario } from "../pages/Usuarios/CrearUsuario";
import { Reportes } from "../pages/Reportes";
import { Movimientos } from "../pages/Movimientos";
import { useAuth } from "../Context";
import { LoginHome} from "../components/HomeComponents/LoginHome"

import  Vistas from "../pages/Usuarios/Vistas";

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  return roles.includes(user?.rol) ? children : <Navigate to="/" />;
};

export function MyRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
        
    <Route path="/Admin" element={<Finanzas />} />
          {/* Rutas específicas para Admin */}
          {user && user.rol === 'Super' && (
        <>
          <Route path="/finanzas" element={<ProtectedRoute roles={['Super','Admin', 'Agente']}><Finanzas /></ProtectedRoute>} />
          <Route path="/vistas" element={<ProtectedRoute roles={['Super','Admin']}><Vistas /></ProtectedRoute>} />
          <Route path="/usuarios/crear" element={<ProtectedRoute roles={['Super','Admin']}><CrearUsuario /></ProtectedRoute>} />
          <Route path="/movs" element={<ProtectedRoute roles={['Super','Admin', 'Agente']}><Movimientos /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute roles={['Super','Admin', 'Agente']}><Reportes /></ProtectedRoute>} />
          <Route path="/set" element={<ProtectedRoute roles={['Super','Admin', 'Agente']}><Settings /></ProtectedRoute>} />

        </>
      )}

      {/* Rutas específicas para Admin */}
      {user && user.rol === 'Admin' && (
        <>
          <Route path="/finanzas" element={<ProtectedRoute roles={['Admin', 'Agente']}><Finanzas /></ProtectedRoute>} />
          <Route path="/vistas" element={<ProtectedRoute roles={['Admin']}><Vistas /></ProtectedRoute>} />
          <Route path="/usuarios/crear" element={<ProtectedRoute roles={['Admin']}><CrearUsuario /></ProtectedRoute>} />
          <Route path="/movs" element={<ProtectedRoute roles={['Admin', 'Agente']}><Movimientos /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute roles={['Admin', 'Agente']}><Reportes /></ProtectedRoute>} />
        </>
      )}

      {/* Rutas específicas para Agente */}
      {user && user.rol === 'Agente' && (
        <>
          <Route path="/vistas" element={<ProtectedRoute roles={['Admin', 'Agente']}><Vistas /></ProtectedRoute>} />
          <Route path="/movs" element={<ProtectedRoute roles={['Admin', 'Agente']}><Movimientos /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute roles={['Admin', 'Agente']}><Reportes /></ProtectedRoute>} />
          <Route path="/finanzas" element={<ProtectedRoute roles={['Admin', 'Agente']}><Finanzas /></ProtectedRoute>} />

        </>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
