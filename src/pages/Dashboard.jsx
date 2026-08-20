import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getDb } from '../services/db';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [consultasSemana, setConsultasSemana] = useState(0);
  const [pacientesSemRetorno, setPacientesSemRetorno] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const sql = getDb();
        
        const [pacientesResult, consultasResult, semRetornoResult] = await Promise.all([
          sql`SELECT count(*) as total FROM pacientes WHERE nutricionista_id = ${user.id};`,
          sql`
            SELECT count(*) as total 
            FROM consultas c
            JOIN pacientes p ON p.id = c.paciente_id
            WHERE p.nutricionista_id = ${user.id} 
              AND c.data_consulta >= date_trunc('week', current_date);
          `,
          sql`
            SELECT id, nome 
            FROM pacientes 
            WHERE nutricionista_id = ${user.id}
              AND id NOT IN (
                SELECT paciente_id 
                FROM consultas 
                WHERE data_consulta >= CURRENT_DATE - INTERVAL '30 days' 
                   OR proximo_retorno >= CURRENT_DATE
              )
          `
        ]);

        setTotalPacientes(Number(pacientesResult[0]?.total || 0));
        setConsultasSemana(Number(consultasResult[0]?.total || 0));
        setPacientesSemRetorno(semRetornoResult || []);
      } catch (err) {
        console.error("Erro ao carregar dados do painel", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Olá, {user?.name || 'Nutricionista'}! Aqui está o resumo do seu consultório.</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </header>
        
        <main className="dashboard-content">
          {loading ? (
            <div className="loading-state">Carregando informações...</div>
          ) : (
            <div className="dashboard-grid">
              
              <div className="dashboard-card">
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h3>Total de Pacientes Ativos</h3>
                <div className="card-value">{totalPacientes}</div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h3>Consultas da Semana</h3>
                <div className="card-value">{consultasSemana}</div>
              </div>

              <div className="dashboard-card wide">
                <div className="card-header">
                  <h3>Pacientes sem retorno</h3>
                </div>
                <div className="card-body">
                  {pacientesSemRetorno.length === 0 ? (
                    <p className="empty-message">Nenhum paciente sem retorno no momento</p>
                  ) : (
                    <ul className="patient-list">
                      {pacientesSemRetorno.map(p => (
                        <li key={p.id}>
                          <Link to={`/pacientes/${p.id}`} className="patient-list-item">
                            <span>{p.nome}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
