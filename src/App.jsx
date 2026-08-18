import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Dashboard from './pages/Dashboard';
import Pacientes from './pages/Pacientes';
import NovoPaciente from './pages/NovoPaciente';
import PacientePerfil from './pages/PacientePerfil';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
  }

  return signed ? children : <Navigate to="/login" />;
};

const AuthRoute = ({ children }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
  }

  return signed ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      
      <Route path="/cadastro" element={
        <AuthRoute>
          <Cadastro />
        </AuthRoute>
      } />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="/pacientes" element={
        <PrivateRoute>
          <Pacientes />
        </PrivateRoute>
      } />

      <Route path="/pacientes/novo" element={
        <PrivateRoute>
          <NovoPaciente />
        </PrivateRoute>
      } />

      <Route path="/pacientes/:id" element={
        <PrivateRoute>
          <PacientePerfil />
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
