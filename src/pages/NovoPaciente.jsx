import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { getDb } from '../services/db';

export default function NovoPaciente() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Aba ativa: 'pessoal' | 'clinico' | 'habitos'
  const [activeTab, setActiveTab] = useState('pessoal');

  // Estado do formulário - Aba 1: Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Estado do formulário - Aba 2: Clínico
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivos, setObjetivos] = useState([]);
  const [objetivoTexto, setObjetivoTexto] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  
  const [patologias, setPatologias] = useState([]);
  const [patologiaExtra, setPatologiaExtra] = useState('');
  const [patologiasExtrasList, setPatologiasExtrasList] = useState([]);

  const [restricoes, setRestricoes] = useState([]);
  const [restricaoExtra, setRestricaoExtra] = useState('');
  const [restricoesExtrasList, setRestricoesExtrasList] = useState([]);

  const [alergias, setAlergias] = useState([]);
  const [alergiaExtra, setAlergiaExtra] = useState('');
  const [alergiasExtrasList, setAlergiasExtrasList] = useState([]);

  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // Estado do formulário - Aba 3: Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState('');
  const [horarioAcorda, setHorarioAcorda] = useState('');
  const [horarioDorme, setHorarioDorme] = useState('');
  const [litrosAgua, setLitrosAgua] = useState('');
  const [praticaAtividade, setPraticaAtividade] = useState(false);
  const [atividadeDescricao, setAtividadeDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Estado de controle
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Opções pré-definidas
  const objetivosOpcoes = [
    'Emagrecer',
    'Ganhar massa',
    'Controlar diabetes',
    'Saúde geral',
    'Performance esportiva',
    'Reeducação alimentar'
  ];

  const niveisAtividadeOpcoes = [
    'Sedentário',
    'Levemente ativo',
    'Moderadamente ativo',
    'Muito ativo',
    'Extremamente ativo'
  ];

  const patologiasOpcoes = [
    'Diabetes',
    'Hipertensão',
    'Hipotireoidismo',
    'Hipertireoidismo',
    'Síndrome do ovário policístico',
    'Doença celíaca',
    'Colesterol alto'
  ];

  const restricoesOpcoes = [
    'Lactose',
    'Glúten',
    'Açúcar',
    'Carne vermelha',
    'Frutos do mar'
  ];

  const alergiasOpcoes = [
    'Amendoim',
    'Leite',
    'Ovo',
    'Soja',
    'Trigo',
    'Frutos do mar'
  ];

  // Cálculo automático da idade
  const idadeCalculada = useMemo(() => {
    if (!dataNascimento) return null;
    const nasc = new Date(dataNascimento);
    if (isNaN(nasc.getTime())) return null;

    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade >= 0 ? idade : null;
  }, [dataNascimento]);

  // Cálculo automático do IMC
  const imcInfo = useMemo(() => {
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);

    if (!pesoNum || !alturaNum || alturaNum <= 0) return null;

    // Altura é em cm, converter para metros
    const alturaMetros = alturaNum / 100;
    const imc = pesoNum / (alturaMetros * alturaMetros);
    const valor = imc.toFixed(1);

    let classificacao = '';
    let cor = '';

    if (imc < 18.5) {
      classificacao = 'Abaixo do peso';
      cor = '#f57c00';
    } else if (imc < 25) {
      classificacao = 'Peso normal';
      cor = 'var(--color-primary, #2e7d32)';
    } else if (imc < 30) {
      classificacao = 'Sobrepeso';
      cor = '#f57c00';
    } else if (imc < 35) {
      classificacao = 'Obesidade Grau I';
      cor = '#d32f2f';
    } else if (imc < 40) {
      classificacao = 'Obesidade Grau II';
      cor = '#c2185b';
    } else {
      classificacao = 'Obesidade Grau III';
      cor = '#7b1fa2';
    }

    return { valor, classificacao, cor };
  }, [peso, altura]);

  // Formatador de telefone/whatsapp
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Formatador inteligente de horário (ex: 6 -> 06:00, 630 -> 06:30, 23 -> 23:00)
  const formatTimeString = (value) => {
    if (!value) return '';
    const clean = value.trim().replace(':', '');
    
    // Se for apenas números
    if (/^\d+$/.test(clean)) {
      if (clean.length === 1 || clean.length === 2) {
        let h = parseInt(clean, 10);
        if (h > 23) h = 23;
        return `${String(h).padStart(2, '0')}:00`;
      } else if (clean.length === 3) {
        let h = parseInt(clean.slice(0, 1), 10);
        let m = parseInt(clean.slice(1), 10);
        if (m > 59) m = 59;
        return `0${h}:${String(m).padStart(2, '0')}`;
      } else if (clean.length >= 4) {
        let h = parseInt(clean.slice(0, 2), 10);
        let m = parseInt(clean.slice(2, 4), 10);
        if (h > 23) h = 23;
        if (m > 59) m = 59;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    }
    return value;
  };

  // Toggle de seleção múltipla com opção "Nenhum"
  const toggleMultiSelect = (item, currentList, setList) => {
    if (item === 'Nenhum') {
      if (currentList.includes('Nenhum')) {
        setList([]);
      } else {
        setList(['Nenhum']);
      }
      return;
    }

    // Se selecionar outro item, remover "Nenhum"
    let updated = currentList.filter(i => i !== 'Nenhum');
    if (updated.includes(item)) {
      updated = updated.filter(i => i !== item);
    } else {
      updated.push(item);
    }
    setList(updated);
  };

  // Adicionar item customizado a uma lista de chips extras
  const addExtraItem = (value, setValue, list, setList, parentList, setParentList) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!list.includes(trimmed)) {
      setList([...list, trimmed]);
      // Remove "Nenhum" se houver
      setParentList(parentList.filter(i => i !== 'Nenhum'));
    }
    setValue('');
  };

  const removeExtraItem = (item, list, setList) => {
    setList(list.filter(i => i !== item));
  };

  // Submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nome.trim()) {
      setError('O nome completo do paciente é obrigatório.');
      setActiveTab('pessoal');
      return;
    }

    try {
      setLoading(true);
      const sql = getDb();

      // Consolidar listas
      const patologiasFinais = [...patologias.filter(p => p !== 'Nenhum'), ...patologiasExtrasList];
      const restricoesFinais = [...restricoes.filter(r => r !== 'Nenhum'), ...restricoesExtrasList];
      const alergiasFinais = [...alergias.filter(a => a !== 'Nenhum'), ...alergiasExtrasList];

      const result = await sql`
        INSERT INTO pacientes (
          nutricionista_id,
          nome,
          data_nascimento,
          sexo,
          telefone,
          whatsapp,
          email,
          peso_inicial,
          altura,
          objetivos,
          objetivo_texto,
          nivel_atividade,
          patologias,
          restricoes_alimentares,
          alergias,
          medicamentos,
          suplementos,
          refeicoes_por_dia,
          horario_acorda,
          horario_dorme,
          litros_agua,
          atividade_fisica,
          atividade_fisica_descricao,
          observacoes
        ) VALUES (
          ${user?.id},
          ${nome.trim()},
          ${dataNascimento || null},
          ${sexo || null},
          ${telefone.trim() || null},
          ${whatsapp.trim() || null},
          ${email.trim() || null},
          ${peso ? parseFloat(peso) : null},
          ${altura ? parseFloat(altura) : null},
          ${objetivos.length > 0 ? objetivos : null},
          ${objetivoTexto.trim() || null},
          ${nivelAtividade || null},
          ${patologiasFinais.length > 0 ? patologiasFinais : (patologias.includes('Nenhum') ? ['Nenhum'] : null)},
          ${restricoesFinais.length > 0 ? restricoesFinais : (restricoes.includes('Nenhum') ? ['Nenhum'] : null)},
          ${alergiasFinais.length > 0 ? alergiasFinais : (alergias.includes('Nenhum') ? ['Nenhum'] : null)},
          ${medicamentos.trim() || null},
          ${suplementos.trim() || null},
          ${refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null},
          ${horarioAcorda.trim() || null},
          ${horarioDorme.trim() || null},
          ${litrosAgua ? parseFloat(litrosAgua) : null},
          ${praticaAtividade},
          ${praticaAtividade ? atividadeDescricao.trim() : null},
          ${observacoes.trim() || null}
        ) RETURNING id;
      `;

      const novoPacienteId = result[0]?.id;

      // Redirecionar para o perfil do paciente recém-cadastrado com mensagem de sucesso
      navigate(`/pacientes/${novoPacienteId}`, { 
        state: { successMessage: 'Paciente cadastrado com sucesso!' } 
      });

    } catch (err) {
      console.error('Erro ao salvar paciente:', err);
      setError(err.message || 'Ocorreu um erro ao salvar o paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <div>
            <div className="breadcrumb">
              <Link to="/pacientes" className="breadcrumb-link">Pacientes</Link>
              <span className="breadcrumb-separator">/</span>
              <span>Novo Paciente</span>
            </div>
            <h1 className="page-title">Cadastrar Novo Paciente</h1>
            <p className="page-subtitle">Preencha as informações pessoais, clínicas e hábitos de rotina do paciente.</p>
          </div>
          <Link to="/pacientes" className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Cancelar
          </Link>
        </header>

        <main className="dashboard-content">
          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-card">
            {/* Navegação por Abas */}
            <div className="tabs-header">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'pessoal' ? 'active' : ''}`}
                onClick={() => setActiveTab('pessoal')}
              >
                <span className="tab-number">1</span>
                <span className="tab-title">Pessoal</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === 'clinico' ? 'active' : ''}`}
                onClick={() => setActiveTab('clinico')}
              >
                <span className="tab-number">2</span>
                <span className="tab-title">Clínico</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === 'habitos' ? 'active' : ''}`}
                onClick={() => setActiveTab('habitos')}
              >
                <span className="tab-number">3</span>
                <span className="tab-title">Hábitos</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="patient-form">
              {/* ABA 1: PESSOAL */}
              {activeTab === 'pessoal' && (
                <div className="tab-content">
                  <div className="form-section-title">
                    <h3>Dados Pessoais</h3>
                    <p>Identificação e formas de contato direto com o paciente.</p>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group full-width">
                      <label htmlFor="nome">
                        Nome completo <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        id="nome"
                        className="form-input"
                        placeholder="Ex: Maria da Silva"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="dataNascimento">
                        Data de nascimento
                        {idadeCalculada !== null && (
                          <span className="badge-helper">{idadeCalculada} {idadeCalculada === 1 ? 'ano' : 'anos'}</span>
                        )}
                      </label>
                      <input
                        type="date"
                        id="dataNascimento"
                        className="form-input"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="sexo">Sexo</label>
                      <select
                        id="sexo"
                        className="form-select"
                        value={sexo}
                        onChange={(e) => setSexo(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefone">Telefone</label>
                      <input
                        type="text"
                        id="telefone"
                        className="form-input"
                        placeholder="(11) 3456-7890"
                        value={telefone}
                        onChange={(e) => setTelefone(formatPhone(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="whatsapp">WhatsApp</label>
                      <input
                        type="text"
                        id="whatsapp"
                        className="form-input"
                        placeholder="(11) 98765-4321"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="email">E-mail</label>
                      <input
                        type="email"
                        id="email"
                        className="form-input"
                        placeholder="paciente@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-actions-tabs">
                    <div></div>
                    <button
                      type="button"
                      className="btn-primary-tab"
                      onClick={() => setActiveTab('clinico')}
                    >
                      Avançar para Clínico →
                    </button>
                  </div>
                </div>
              )}

              {/* ABA 2: CLÍNICO */}
              {activeTab === 'clinico' && (
                <div className="tab-content">
                  <div className="form-section-title">
                    <h3>Avaliação Clínica e Objetivos</h3>
                    <p>Métricas antropométricas, histórico de saúde, restrições e metas.</p>
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group">
                      <label htmlFor="peso">Peso atual</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="peso"
                          step="0.1"
                          min="1"
                          max="500"
                          className="form-input"
                          placeholder="Ex: 72.5"
                          value={peso}
                          onChange={(e) => setPeso(e.target.value)}
                        />
                        <span className="input-unit">kg</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="altura">Altura</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="altura"
                          step="1"
                          min="30"
                          max="280"
                          className="form-input"
                          placeholder="Ex: 170"
                          value={altura}
                          onChange={(e) => setAltura(e.target.value)}
                        />
                        <span className="input-unit">cm</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>IMC Calculado (somente leitura)</label>
                      <div className="imc-display-box">
                        {imcInfo ? (
                          <div className="imc-result">
                            <span className="imc-value">{imcInfo.valor}</span>
                            <span className="imc-tag" style={{ backgroundColor: `${imcInfo.cor}18`, color: imcInfo.cor, borderColor: imcInfo.cor }}>
                              {imcInfo.classificacao}
                            </span>
                          </div>
                        ) : (
                          <span className="imc-placeholder">Informe peso e altura</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nível de Atividade */}
                  <div className="form-group full-width" style={{ marginTop: '16px' }}>
                    <label>Nível de atividade física</label>
                    <div className="chips-group">
                      {niveisAtividadeOpcoes.map(opcao => (
                        <button
                          type="button"
                          key={opcao}
                          className={`chip-btn ${nivelAtividade === opcao ? 'active' : ''}`}
                          onClick={() => setNivelAtividade(opcao === nivelAtividade ? '' : opcao)}
                        >
                          {opcao}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Objetivos */}
                  <div className="form-group full-width" style={{ marginTop: '20px' }}>
                    <label>Objetivos do paciente (múltipla escolha)</label>
                    <div className="chips-group">
                      {objetivosOpcoes.map(opcao => (
                        <button
                          type="button"
                          key={opcao}
                          className={`chip-btn ${objetivos.includes(opcao) ? 'active' : ''}`}
                          onClick={() => {
                            if (objetivos.includes(opcao)) {
                              setObjetivos(objetivos.filter(o => o !== opcao));
                            } else {
                              setObjetivos([...objetivos, opcao]);
                            }
                          }}
                        >
                          {objetivos.includes(opcao) ? '✓ ' : '+ '}{opcao}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Adicionar detalhes ou objetivo livre adicional..."
                        value={objetivoTexto}
                        onChange={(e) => setObjetivoTexto(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Patologias */}
                  <div className="form-group full-width" style={{ marginTop: '24px' }}>
                    <label>Patologias ou condições de saúde</label>
                    <div className="chips-group">
                      <button
                        type="button"
                        className={`chip-btn ${patologias.includes('Nenhum') && patologiasExtrasList.length === 0 ? 'active neutral' : ''}`}
                        onClick={() => {
                          toggleMultiSelect('Nenhum', patologias, setPatologias);
                          setPatologiasExtrasList([]);
                        }}
                      >
                        Nenhum
                      </button>
                      {patologiasOpcoes.map(opcao => (
                        <button
                          type="button"
                          key={opcao}
                          className={`chip-btn ${patologias.includes(opcao) ? 'active' : ''}`}
                          onClick={() => toggleMultiSelect(opcao, patologias, setPatologias)}
                        >
                          {patologias.includes(opcao) ? '✓ ' : '+ '}{opcao}
                        </button>
                      ))}
                      {patologiasExtrasList.map(extra => (
                        <span key={extra} className="chip-btn active custom-chip">
                          {extra}
                          <button
                            type="button"
                            className="chip-remove"
                            onClick={() => removeExtraItem(extra, patologiasExtrasList, setPatologiasExtrasList)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="chip-add-inline" style={{ marginTop: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Outra patologia ou condição (pressione Enter ou clique em Adicionar)..."
                        value={patologiaExtra}
                        onChange={(e) => setPatologiaExtra(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExtraItem(patologiaExtra, setPatologiaExtra, patologiasExtrasList, setPatologiasExtrasList, patologias, setPatologias);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-inline-add"
                        onClick={() => addExtraItem(patologiaExtra, setPatologiaExtra, patologiasExtrasList, setPatologiasExtrasList, patologias, setPatologias)}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Restrições Alimentares */}
                  <div className="form-group full-width" style={{ marginTop: '24px' }}>
                    <label>Restrições alimentares</label>
                    <div className="chips-group">
                      <button
                        type="button"
                        className={`chip-btn ${restricoes.includes('Nenhum') && restricoesExtrasList.length === 0 ? 'active neutral' : ''}`}
                        onClick={() => {
                          toggleMultiSelect('Nenhum', restricoes, setRestricoes);
                          setRestricoesExtrasList([]);
                        }}
                      >
                        Nenhum
                      </button>
                      {restricoesOpcoes.map(opcao => (
                        <button
                          type="button"
                          key={opcao}
                          className={`chip-btn ${restricoes.includes(opcao) ? 'active' : ''}`}
                          onClick={() => toggleMultiSelect(opcao, restricoes, setRestricoes)}
                        >
                          {restricoes.includes(opcao) ? '✓ ' : '+ '}{opcao}
                        </button>
                      ))}
                      {restricoesExtrasList.map(extra => (
                        <span key={extra} className="chip-btn active custom-chip">
                          {extra}
                          <button
                            type="button"
                            className="chip-remove"
                            onClick={() => removeExtraItem(extra, restricoesExtrasList, setRestricoesExtrasList)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="chip-add-inline" style={{ marginTop: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Outra restrição alimentar..."
                        value={restricaoExtra}
                        onChange={(e) => setRestricaoExtra(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExtraItem(restricaoExtra, setRestricaoExtra, restricoesExtrasList, setRestricoesExtrasList, restricoes, setRestricoes);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-inline-add"
                        onClick={() => addExtraItem(restricaoExtra, setRestricaoExtra, restricoesExtrasList, setRestricoesExtrasList, restricoes, setRestricoes)}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Alergias Alimentares */}
                  <div className="form-group full-width" style={{ marginTop: '24px' }}>
                    <label>Alergias alimentares</label>
                    <div className="chips-group">
                      <button
                        type="button"
                        className={`chip-btn ${alergias.includes('Nenhum') && alergiasExtrasList.length === 0 ? 'active neutral' : ''}`}
                        onClick={() => {
                          toggleMultiSelect('Nenhum', alergias, setAlergias);
                          setAlergiasExtrasList([]);
                        }}
                      >
                        Nenhum
                      </button>
                      {alergiasOpcoes.map(opcao => (
                        <button
                          type="button"
                          key={opcao}
                          className={`chip-btn ${alergias.includes(opcao) ? 'active' : ''}`}
                          onClick={() => toggleMultiSelect(opcao, alergias, setAlergias)}
                        >
                          {alergias.includes(opcao) ? '✓ ' : '+ '}{opcao}
                        </button>
                      ))}
                      {alergiasExtrasList.map(extra => (
                        <span key={extra} className="chip-btn active custom-chip">
                          {extra}
                          <button
                            type="button"
                            className="chip-remove"
                            onClick={() => removeExtraItem(extra, alergiasExtrasList, setAlergiasExtrasList)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="chip-add-inline" style={{ marginTop: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Outra alergia alimentar..."
                        value={alergiaExtra}
                        onChange={(e) => setAlergiaExtra(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExtraItem(alergiaExtra, setAlergiaExtra, alergiasExtrasList, setAlergiasExtrasList, alergias, setAlergias);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-inline-add"
                        onClick={() => addExtraItem(alergiaExtra, setAlergiaExtra, alergiasExtrasList, setAlergiasExtrasList, alergias, setAlergias)}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Medicamentos e Suplementos */}
                  <div className="form-grid-2" style={{ marginTop: '24px' }}>
                    <div className="form-group">
                      <label htmlFor="medicamentos">Medicamentos contínuos</label>
                      <textarea
                        id="medicamentos"
                        className="form-textarea"
                        rows="2"
                        placeholder="Ex: Losartana 50mg pela manhã"
                        value={medicamentos}
                        onChange={(e) => setMedicamentos(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="suplementos">Suplementos em uso</label>
                      <textarea
                        id="suplementos"
                        className="form-textarea"
                        rows="2"
                        placeholder="Ex: Whey protein, Creatina 5g, Vitamina D"
                        value={suplementos}
                        onChange={(e) => setSuplementos(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-actions-tabs">
                    <button
                      type="button"
                      className="btn-secondary-tab"
                      onClick={() => setActiveTab('pessoal')}
                    >
                      ← Voltar para Pessoal
                    </button>
                    <button
                      type="button"
                      className="btn-primary-tab"
                      onClick={() => setActiveTab('habitos')}
                    >
                      Avançar para Hábitos →
                    </button>
                  </div>
                </div>
              )}

              {/* ABA 3: HÁBITOS */}
              {activeTab === 'habitos' && (
                <div className="tab-content">
                  <div className="form-section-title">
                    <h3>Hábitos e Rotina Diária</h3>
                    <p>Horários, hidratação, exercícios e notas de acompanhamento.</p>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="refeicoesPorDia">Quantas refeições faz por dia</label>
                      <input
                        type="number"
                        id="refeicoesPorDia"
                        min="1"
                        max="12"
                        className="form-input"
                        placeholder="Ex: 4"
                        value={refeicoesPorDia}
                        onChange={(e) => setRefeicoesPorDia(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="litrosAgua">Quantidade de água por dia</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          id="litrosAgua"
                          step="0.1"
                          min="0"
                          max="15"
                          className="form-input"
                          placeholder="Ex: 2.5"
                          value={litrosAgua}
                          onChange={(e) => setLitrosAgua(e.target.value)}
                        />
                        <span className="input-unit">litros</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="horarioAcorda">Horário que acorda</label>
                      <input
                        type="text"
                        id="horarioAcorda"
                        className="form-input"
                        placeholder="Ex: 6 → 06:00 ou 630 → 06:30"
                        value={horarioAcorda}
                        onChange={(e) => setHorarioAcorda(e.target.value)}
                        onBlur={(e) => setHorarioAcorda(formatTimeString(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="horarioDorme">Horário que dorme</label>
                      <input
                        type="text"
                        id="horarioDorme"
                        className="form-input"
                        placeholder="Ex: 23 → 23:00 ou 2230 → 22:30"
                        value={horarioDorme}
                        onChange={(e) => setHorarioDorme(e.target.value)}
                        onBlur={(e) => setHorarioDorme(formatTimeString(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Prática de atividade física */}
                  <div className="form-group full-width" style={{ marginTop: '20px' }}>
                    <label>Pratica atividade física?</label>
                    <div className="chips-group">
                      <button
                        type="button"
                        className={`chip-btn ${praticaAtividade === false ? 'active neutral' : ''}`}
                        onClick={() => {
                          setPraticaAtividade(false);
                          setAtividadeDescricao('');
                        }}
                      >
                        Não
                      </button>
                      <button
                        type="button"
                        className={`chip-btn ${praticaAtividade === true ? 'active' : ''}`}
                        onClick={() => setPraticaAtividade(true)}
                      >
                        Sim
                      </button>
                    </div>

                    {praticaAtividade && (
                      <div className="conditional-box" style={{ marginTop: '12px' }}>
                        <label htmlFor="atividadeDescricao">Qual atividade e frequência semanal?</label>
                        <input
                          type="text"
                          id="atividadeDescricao"
                          className="form-input"
                          placeholder="Ex: Musculação 4x na semana e corrida aos sábados"
                          value={atividadeDescricao}
                          onChange={(e) => setAtividadeDescricao(e.target.value)}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  {/* Observações Gerais */}
                  <div className="form-group full-width" style={{ marginTop: '20px' }}>
                    <label htmlFor="observacoes">Observações gerais</label>
                    <textarea
                      id="observacoes"
                      className="form-textarea"
                      rows="4"
                      placeholder="Anotações adicionais, histórico comportamental, rotinas específicas ou preferências..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                    />
                  </div>

                  <div className="form-actions-tabs">
                    <button
                      type="button"
                      className="btn-secondary-tab"
                      onClick={() => setActiveTab('clinico')}
                    >
                      ← Voltar para Clínico
                    </button>
                    <button
                      type="submit"
                      className="btn-save-paciente"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-icon"></span>
                          Salvando paciente...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                          Salvar Paciente
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
