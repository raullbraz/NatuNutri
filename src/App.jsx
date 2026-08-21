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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary capturou um erro:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#f8faf8',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: '#ffffff',
            padding: '36px',
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            textAlign: 'center',
            border: '1px solid #e0e6e0'
          }}>
            <div style={{ fontSize: '44px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#222222', margin: '0 0 10px 0', fontSize: '20px' }}>Ops, ocorreu um erro na exibição</h2>
            <p style={{ color: '#666666', fontSize: '14px', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              {this.state.error?.message || 'Houve uma falha ao renderizar esta página.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#2e7d32',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Recarregar Página
              </button>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/pacientes';
                }}
                style={{
                  backgroundColor: '#f0f4f0',
                  color: '#2e7d32',
                  border: '1px solid #c8d4c8',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Voltar para Pacientes
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#2e7d32', fontWeight: 600 }}>Carregando...</div>;
  }

  return signed ? children : <Navigate to="/login" />;
};

const AuthRoute = ({ children }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#2e7d32', fontWeight: 600 }}>Carregando...</div>;
  }

  return signed ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
