import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getDb } from '../services/db';

export default function PacientePerfil() {
  const { id } = useParams();
  const location = useLocation();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(location.state?.successMessage || '');

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    async function loadPaciente() {
      try {
        setLoading(true);
        setError('');
        const sql = getDb();

        const result = await sql`
          SELECT * FROM pacientes WHERE id = ${id}::uuid LIMIT 1;
        `;

        if (result.length > 0) {
          setPaciente(result[0]);
        } else {
          setError('Paciente não encontrado.');
        }
      } catch (err) {
        console.error('Erro ao carregar perfil do paciente:', err);
        setError('Não foi possível carregar as informações do paciente.');
      } finally {
        setLoading(false);
      }
    }

    loadPaciente();
  }, [id]);

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return null;
    try {
      const nasc = new Date(dataNasc);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const mes = hoje.getMonth() - nasc.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
        idade--;
      }
      return idade;
    } catch {
      return null;
    }
  };

  const getIniciais = (nome) => {
    if (!nome) return 'P';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return 'Não informada';
    try {
      const [ano, mes, dia] = dataStr.split('T')[0].split('-');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dataStr;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {toastMessage && (
          <div className="toast-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>{toastMessage}</span>
            <button className="toast-close" onClick={() => setToastMessage('')}>×</button>
          </div>
        )}

        <header className="dashboard-header">
          <div>
            <div className="breadcrumb">
              <Link to="/pacientes" className="breadcrumb-link">Pacientes</Link>
              <span className="breadcrumb-separator">/</span>
              <span>{paciente ? paciente.nome : 'Perfil do Paciente'}</span>
            </div>
            <h1 className="page-title">{paciente ? paciente.nome : 'Carregando...'}</h1>
            <p className="page-subtitle">Prontuário e histórico de acompanhamento nutricional.</p>
          </div>
          <Link to="/pacientes" className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Voltar para Pacientes
          </Link>
        </header>

        <main className="dashboard-content">
          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <span className="spinner-icon"></span>
              Carregando dados do paciente...
            </div>
          ) : paciente ? (
            <div className="paciente-perfil-container">
              {/* Header Card do Paciente */}
              <div className="perfil-hero-card">
                <div className="perfil-hero-left">
                  <div className="perfil-large-avatar">
                    {getIniciais(paciente.nome)}
                  </div>
                  <div className="perfil-hero-details">
                    <h2>{paciente.nome}</h2>
                    <div className="perfil-meta-tags">
                      {paciente.data_nascimento && (
                        <span className="meta-tag">
                          🎂 {calcularIdade(paciente.data_nascimento)} anos ({formatarData(paciente.data_nascimento)})
                        </span>
                      )}
                      {paciente.sexo && (
                        <span className="meta-tag">👤 {paciente.sexo}</span>
                      )}
                      {paciente.whatsapp && (
                        <span className="meta-tag">📱 {paciente.whatsapp}</span>
                      )}
                      {paciente.email && (
                        <span className="meta-tag">✉️ {paciente.email}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid com Resumo dos Dados */}
              <div className="perfil-sections-grid">
                {/* Card Dados Pessoais & Contato */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>📋 Informações Pessoais</h3>
                  </div>
                  <div className="card-details-list">
                    <div className="detail-item">
                      <span className="detail-label">Nome Completo:</span>
                      <span className="detail-value">{paciente.nome}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Data de Nascimento:</span>
                      <span className="detail-value">{formatarData(paciente.data_nascimento)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Sexo:</span>
                      <span className="detail-value">{paciente.sexo || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Telefone:</span>
                      <span className="detail-value">{paciente.telefone || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">WhatsApp:</span>
                      <span className="detail-value">{paciente.whatsapp || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">E-mail:</span>
                      <span className="detail-value">{paciente.email || 'Não informado'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Dados Clínicos */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>🩺 Avaliação Clínica</h3>
                  </div>
                  <div className="card-details-list">
                    <div className="detail-item">
                      <span className="detail-label">Peso Inicial:</span>
                      <span className="detail-value">{paciente.peso_inicial ? `${paciente.peso_inicial} kg` : 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Altura:</span>
                      <span className="detail-value">{paciente.altura ? `${paciente.altura} cm` : 'Não informada'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Nível de Atividade:</span>
                      <span className="detail-value">{paciente.nivel_atividade || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Objetivos:</span>
                      <span className="detail-value">
                        {paciente.objetivos && paciente.objetivos.length > 0
                          ? paciente.objetivos.join(', ')
                          : paciente.objetivo_texto || 'Não informado'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Patologias:</span>
                      <span className="detail-value">
                        {paciente.patologias && paciente.patologias.length > 0
                          ? paciente.patologias.join(', ')
                          : 'Nenhuma'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Restrições Alimentares:</span>
                      <span className="detail-value">
                        {paciente.restricoes_alimentares && paciente.restricoes_alimentares.length > 0
                          ? paciente.restricoes_alimentares.join(', ')
                          : 'Nenhuma'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Alergias:</span>
                      <span className="detail-value">
                        {paciente.alergias && paciente.alergias.length > 0
                          ? paciente.alergias.join(', ')
                          : 'Nenhuma'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Hábitos & Rotina */}
                <div className="dashboard-card wide">
                  <div className="card-header">
                    <h3>⏰ Hábitos & Rotina</h3>
                  </div>
                  <div className="form-grid-3">
                    <div className="detail-box">
                      <span className="detail-label">Refeições / Dia</span>
                      <span className="detail-highlight">{paciente.refeicoes_por_dia || '-'}</span>
                    </div>
                    <div className="detail-box">
                      <span className="detail-label">Água / Dia</span>
                      <span className="detail-highlight">{paciente.litros_agua ? `${paciente.litros_agua} L` : '-'}</span>
                    </div>
                    <div className="detail-box">
                      <span className="detail-label">Horários (Acorda / Dorme)</span>
                      <span className="detail-highlight">
                        {paciente.horario_acorda || '--:--'} às {paciente.horario_dorme || '--:--'}
                      </span>
                    </div>
                  </div>

                  {paciente.atividade_fisica && (
                    <div className="highlight-note" style={{ marginTop: '16px' }}>
                      <strong>Atividade Física:</strong> {paciente.atividade_fisica_descricao || 'Sim (pratica)'}
                    </div>
                  )}

                  {paciente.observacoes && (
                    <div className="highlight-note" style={{ marginTop: '12px' }}>
                      <strong>Observações:</strong> {paciente.observacoes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
