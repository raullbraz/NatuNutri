import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { getDb } from '../services/db';

export default function Pacientes() {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPacientes() {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError('');
        const sql = getDb();

        const result = await sql`
          SELECT 
            p.id,
            p.nome,
            p.email,
            p.whatsapp,
            p.objetivos,
            p.objetivo_texto,
            p.created_at,
            MAX(c.data_consulta) as ultima_consulta
          FROM pacientes p
          LEFT JOIN consultas c ON c.paciente_id = p.id
          WHERE p.nutricionista_id = ${user.id}
          GROUP BY p.id, p.nome, p.email, p.whatsapp, p.objetivos, p.objetivo_texto, p.created_at
          ORDER BY p.nome ASC;
        `;

        setPacientes(result);
      } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
        setError('Não foi possível carregar a lista de pacientes.');
      } finally {
        setLoading(false);
      }
    }

    loadPacientes();
  }, [user?.id]);

  // Filtragem de pacientes por nome
  const pacientesFiltrados = useMemo(() => {
    if (!busca.trim()) return pacientes;
    const termo = busca.toLowerCase().trim();
    return pacientes.filter(p => p.nome && p.nome.toLowerCase().includes(termo));
  }, [pacientes, busca]);

  // Formatação de data
  const formatarData = (dataStr) => {
    if (!dataStr) return 'Nenhuma consulta';
    try {
      const [ano, mes, dia] = dataStr.split('T')[0].split('-');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dataStr;
    }
  };

  // Helper para gerar iniciais do nome
  const getIniciais = (nome) => {
    if (!nome) return 'P';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <div>
            <h1 className="page-title">Pacientes</h1>
            <p className="page-subtitle">Gerencie e acompanhe todos os pacientes do seu consultório.</p>
          </div>
          <Link to="/pacientes/novo" className="btn-primary-action">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Novo Paciente
          </Link>
        </header>

        <main className="dashboard-content">
          {/* Barra de Busca e Filtro */}
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar paciente por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              {busca && (
                <button 
                  className="search-clear-btn" 
                  onClick={() => setBusca('')}
                  title="Limpar busca"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
            <div className="patient-count-badge">
              {pacientesFiltrados.length} {pacientesFiltrados.length === 1 ? 'paciente' : 'pacientes'}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <span className="spinner-icon"></span>
              Carregando pacientes...
            </div>
          ) : pacientes.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h2>Nenhum paciente cadastrado ainda</h2>
              <p>Cadastre seu primeiro paciente para começar a acompanhar objetivos, consultas e planos alimentares.</p>
              <Link to="/pacientes/novo" className="btn-primary-action" style={{ marginTop: '16px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Cadastrar Primeiro Paciente
              </Link>
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h2>Nenhum paciente encontrado</h2>
              <p>Não encontramos nenhum paciente correspondente ao termo "{busca}".</p>
              <button 
                className="btn-secondary" 
                onClick={() => setBusca('')}
                style={{ marginTop: '12px' }}
              >
                Limpar filtro
              </button>
            </div>
          ) : (
            <div className="pacientes-table-card">
              <div className="pacientes-table-header">
                <div className="col-paciente">Nome do Paciente</div>
                <div className="col-objetivo">Objetivo</div>
                <div className="col-consulta">Última Consulta</div>
                <div className="col-action"></div>
              </div>

              <div className="pacientes-list">
                {pacientesFiltrados.map((paciente) => (
                  <div
                    key={paciente.id}
                    className="paciente-row"
                    onClick={() => navigate(`/pacientes/${paciente.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/pacientes/${paciente.id}`);
                      }
                    }}
                  >
                    {/* Coluna 1: Nome + Avatar */}
                    <div className="col-paciente">
                      <div className="paciente-avatar">
                        {getIniciais(paciente.nome)}
                      </div>
                      <div className="paciente-info">
                        <span className="paciente-nome">{paciente.nome}</span>
                        {paciente.email && (
                          <span className="paciente-email">{paciente.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Coluna 2: Objetivo */}
                    <div className="col-objetivo">
                      {paciente.objetivos && paciente.objetivos.length > 0 ? (
                        <div className="objetivo-tags">
                          {paciente.objetivos.slice(0, 2).map((obj, idx) => (
                            <span key={idx} className="objetivo-badge">
                              {obj}
                            </span>
                          ))}
                          {paciente.objetivos.length > 2 && (
                            <span className="objetivo-badge more">
                              +{paciente.objetivos.length - 2}
                            </span>
                          )}
                        </div>
                      ) : paciente.objetivo_texto ? (
                        <span className="objetivo-text-truncate">{paciente.objetivo_texto}</span>
                      ) : (
                        <span className="text-muted">Não informado</span>
                      )}
                    </div>

                    {/* Coluna 3: Data da Última Consulta */}
                    <div className="col-consulta">
                      <div className="consulta-date-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>{formatarData(paciente.ultima_consulta)}</span>
                      </div>
                    </div>

                    {/* Coluna 4: Ícone de navegação */}
                    <div className="col-action">
                      <span className="row-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
