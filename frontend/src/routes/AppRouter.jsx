import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import Layout from '../components/Layout/Layout';

// Pages
import Login from '../pages/Auth/Login';
import Unauthorized from '../pages/Auth/Unauthorized';
import Dashboard from '../pages/Dashboard/Dashboard';
import Register from '../pages/Auth/Register';
// Auth Pages (NUEVAS IMPORTACIONES)
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';

// Empleados
import EmpleadosList from '../pages/Empleados/EmpleadosList';
import EmpleadoForm from '../pages/Empleados/EmpleadoForm';
import EmpleadoDetail from '../pages/Empleados/EmpleadoDetail';
import EditarEmpleado from '../pages/Empleados/EditarEmpleado';

// Permisos
import PermisosList from '../pages/Permisos/PermisosList';
import PermisoForm from '../pages/Permisos/PermisoForm';
import GestionPermisos from '../pages/Permisos/GestionPermisos';


// Asistencia
import AsistenciaRegistro from '../pages/Asistencia/AsistenciaRegistro';
import MiAsistencia from '../pages/Asistencia/MiAsistencia';
import ReporteAsistencia from '../pages/Asistencia/ReporteAsistencia';

// Evaluaciones
import EvaluacionesList from '../pages/Evaluaciones/EvaluacionesList';
import EvaluacionForm from '../pages/Evaluaciones/EvaluacionForm';
import MiEvaluaciones from '../pages/Evaluaciones/MiEvaluaciones';

// Capacitaciones
import CapacitacionesList from '../pages/Capacitaciones/CapacitacionesList';
import CapacitacionForm from '../pages/Capacitaciones/CapacitacionForm';
import MisCapacitaciones from '../pages/Capacitaciones/MisCapacitaciones';
import CapacitacionDetail from '../pages/Capacitaciones/CapacitacionDetail';
import CapacitacionEdit from '../pages/Capacitaciones/CapacitacionEdit';

// Nóminas
import NominasList from '../pages/Nominas/NominasList';
import MiNominas from '../pages/Nominas/MiNominas';
import GenerarNomina from '../pages/Nominas/GenerarNomina';

// Reportes
import ReportesAsistencia from '../pages/Reportes/ReportesAsistencia';
import ReportesNomina from '../pages/Reportes/ReportesNomina';
import ReportesDesempeno from '../pages/Reportes/ReportesDesempeno';

// Horarios
import MisHorarios from '../pages/Horarios/MisHorarios';
import PlanificacionHorarios from '../pages/Horarios/PlanificacionHorarios';

// Tareas
import MisTareas from '../pages/Tareas/MisTareas';

// Alertas
import MisAlertas from '../pages/Alertas/MisAlertas';

const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* NUEVAS RUTAS PÚBLICAS - FUERA DEL LAYOUT */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="empleados/registrar" element={
        <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
          <Register />
        </ProtectedRoute>
      } />

      {/* Rutas protegidas */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard - Accesible para todos los roles autenticados */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Empleados - SOLO ADMIN_RRHH */}
        <Route path="empleados" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <EmpleadosList />
          </ProtectedRoute>
        } />
        <Route path="empleados/nuevo" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <EmpleadoForm />
          </ProtectedRoute>
        } />
        <Route path="empleados/editar/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <EditarEmpleado />
          </ProtectedRoute>
        } />
        <Route path="empleados/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <EmpleadoDetail />
          </ProtectedRoute>
        } />

        {/* Permisos */}
        <Route path="permisos" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <PermisosList />
          </ProtectedRoute>
        } />
        <Route path="permisos/solicitar" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <PermisoForm />
          </ProtectedRoute>
        } />
        <Route path="permisos/gestion" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH', 'DIRECTIVO']}>
            <GestionPermisos />
          </ProtectedRoute>
        } />

        {/* Asistencia */}
        <Route path="asistencia" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <MiAsistencia />
          </ProtectedRoute>
        } />
        <Route path="asistencia/registrar" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <AsistenciaRegistro />
          </ProtectedRoute>
        } />
        <Route path="asistencia/reportes" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH', 'DIRECTIVO']}>
            <ReporteAsistencia />
          </ProtectedRoute>
        } />

        {/* Evaluaciones */}
        <Route path="evaluaciones" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <MiEvaluaciones />
          </ProtectedRoute>
        } />
        <Route path="evaluaciones/nueva" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH', 'DIRECTIVO']}>
            <EvaluacionForm />
          </ProtectedRoute>
        } />
        <Route path="evaluaciones/gestion" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH', 'DIRECTIVO']}>
            <EvaluacionesList />
          </ProtectedRoute>
        } />

        {/* Capacitaciones */}
        <Route path="capacitaciones" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <MisCapacitaciones />
          </ProtectedRoute>
        } />
        <Route path="capacitaciones/nueva" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <CapacitacionForm />
          </ProtectedRoute>
        } />
        <Route path="capacitaciones/gestion" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <CapacitacionesList />
          </ProtectedRoute>
        } />
        <Route path="capacitaciones/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH', 'DOCENTE', 'PERSONAL_APOYO']}>
            <CapacitacionDetail />
          </ProtectedRoute>
        } />

        <Route path="capacitaciones/editar/:id" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <CapacitacionEdit />
          </ProtectedRoute>
        } />

        {/* Nóminas */}
        <Route path="nominas" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <MiNominas />
          </ProtectedRoute>
        } />
        <Route path="nominas/gestion" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <NominasList />
          </ProtectedRoute>
        } />
        <Route path="nominas/generar" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <GenerarNomina />
          </ProtectedRoute>
        } />

        {/* Reportes Avanzados - SOLO ADMIN Y DIRECTIVOS */}
        <Route path="reportes/asistencia" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH', 'DIRECTIVO']}>
            <ReportesAsistencia />
          </ProtectedRoute>
        } />
        <Route path="reportes/nomina" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH', 'DIRECTIVO']}>
            <ReportesNomina />
          </ProtectedRoute>
        } />
        <Route path="reportes/desempeno" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH', 'DIRECTIVO']}>
            <ReportesDesempeno />
          </ProtectedRoute>
        } />

        {/* Horarios */}
        <Route path="horarios/mis-horarios" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <MisHorarios />
          </ProtectedRoute>
        } />
        <Route path="horarios/planificacion" element={
          <ProtectedRoute allowedRoles={['ADMIN_RRHH']}>
            <PlanificacionHorarios />
          </ProtectedRoute>
        } />

        {/* Tareas */}
        <Route path="tareas" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <MisTareas />
          </ProtectedRoute>
        } />

        {/* Alertas */}
        <Route path="alertas" element={
          <ProtectedRoute allowedRoles={['DOCENTE', 'PERSONAL_APOYO']}>
            <MisAlertas />
          </ProtectedRoute>
        } />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;