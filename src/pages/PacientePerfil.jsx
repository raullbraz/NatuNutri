import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { getDb } from '../services/db';

export default function PacientePerfil() {
  const { user } = useAuth();
  const { id } = useParams();
  const location = useLocation();

  // Seção principal ativa: 'dados' | 'consultas' | 'planos'
  const [activeSection, setActiveSection] = useState('dados');

  // Sub-aba de Dados do Paciente: 'pessoal' | 'clinico' | 'habitos'
  const [activeTab, setActiveTab] = useState('pessoal');

  // Estado geral
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState(location.state?.successMessage || '');
  const [savingPaciente, setSavingPaciente] = useState(false);

  // Estados dos campos editáveis - Aba 1: Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Estados dos campos editáveis - Aba 2: Clínico
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

  // Estados dos campos editáveis - Aba 3: Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState('');
  const [horarioAcorda, setHorarioAcorda] = useState('');
  const [horarioDorme, setHorarioDorme] = useState('');
  const [litrosAgua, setLitrosAgua] = useState('');
  const [praticaAtividade, setPraticaAtividade] = useState(false);
  const [atividadeDescricao, setAtividadeDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Consultas
  const [consultas, setConsultas] = useState([]);
  const [loadingConsultas, setLoadingConsultas] = useState(false);
  const [modalConsultaAberto, setModalConsultaAberto] = useState(false);
  const [salvandoConsulta, setSalvandoConsulta] = useState(false);
  const [erroModalConsulta, setErroModalConsulta] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Formulário Nova Consulta
  const hojeStr = new Date().toISOString().split('T')[0];
  const [novaConsultaData, setNovaConsultaData] = useState(hojeStr);
  const [novaConsultaPeso, setNovaConsultaPeso] = useState('');
  const [novaConsultaCintura, setNovaConsultaCintura] = useState('');
  const [novaConsultaQuadril, setNovaConsultaQuadril] = useState('');
  const [novaConsultaGordura, setNovaConsultaGordura] = useState('');
  const [novaConsultaObs, setNovaConsultaObs] = useState('');
  const [novaConsultaProximoRetorno, setNovaConsultaProximoRetorno] = useState('');

  // Planos Alimentares
  const [planos, setPlanos] = useState([]);
  const [loadingPlanos, setLoadingPlanos] = useState(false);
  const [planoVisualizando, setPlanoVisualizando] = useState(null);

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

  // Helper para converter array/json do PostgreSQL de forma segura
  const toArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return val.split(',').map(s => s.trim().replace(/^\{|\}$|"/g, '')).filter(Boolean);
    }
    return [];
  };

  // Helper para formatar data para inputs type="date"
  const formatDateForInput = (dateVal) => {
    if (!dateVal) return '';
    try {
      if (typeof dateVal === 'object' && dateVal instanceof Date) {
        return dateVal.toISOString().split('T')[0];
      }
      return String(dateVal).split('T')[0];
    } catch {
      return '';
    }
  };

  // Helper para exibir data formatada PT-BR
  const formatarData = (dataStr) => {
    if (!dataStr) return 'Não informada';
    try {
      if (typeof dataStr === 'object' && dataStr instanceof Date) {
        dataStr = dataStr.toISOString();
      }
      const str = String(dataStr);
      const isoPart = str.split('T')[0];
      const partes = isoPart.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return str;
    } catch {
      return String(dataStr);
    }
  };

  // Auto-dismiss do Toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Helper para calcular idade a partir de uma data
  const calcularIdade = (dataStr) => {
    if (!dataStr) return null;
    try {
      const nasc = new Date(dataStr);
      if (isNaN(nasc.getTime())) return null;

      const hoje = new Date();
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const mes = hoje.getMonth() - nasc.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
        idade--;
      }
      return idade >= 0 ? idade : null;
    } catch {
      return null;
    }
  };

  // Carregar dados do paciente
  const loadPaciente = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const sql = getDb();

      let result;
      if (user?.id) {
        result = await sql`
          SELECT * FROM pacientes 
          WHERE id = ${id} 
            AND (nutricionista_id = ${user.id} OR nutricionista_id IS NULL)
          LIMIT 1;
        `;
      } else {
        result = await sql`
          SELECT * FROM pacientes 
          WHERE id = ${id} 
          LIMIT 1;
        `;
      }

      if (result && result.length > 0) {
        const p = result[0];
        setPaciente(p);
        
        // Preencher estados do formulário
        setNome(p.nome || '');
        setDataNascimento(formatDateForInput(p.data_nascimento));
        setSexo(p.sexo || '');
        setTelefone(p.telefone || '');
        setWhatsapp(p.whatsapp || '');
        setEmail(p.email || '');

        setPeso(p.peso_inicial !== null && p.peso_inicial !== undefined ? String(p.peso_inicial) : '');
        setAltura(p.altura !== null && p.altura !== undefined ? String(p.altura) : '');
        setObjetivos(toArray(p.objetivos));
        setObjetivoTexto(p.objetivo_texto || '');
        setNivelAtividade(p.nivel_atividade || '');

        // Separar chips padrão de itens extras
        const patList = toArray(p.patologias);
        const patPadrao = patList.filter(item => patologiasOpcoes.includes(item) || item === 'Nenhum');
        const patExtras = patList.filter(item => !patologiasOpcoes.includes(item) && item !== 'Nenhum');
        setPatologias(patPadrao);
        setPatologiasExtrasList(patExtras);

        const restList = toArray(p.restricoes_alimentares);
        const restPadrao = restList.filter(item => restricoesOpcoes.includes(item) || item === 'Nenhum');
        const restExtras = restList.filter(item => !restricoesOpcoes.includes(item) && item !== 'Nenhum');
        setRestricoes(restPadrao);
        setRestricoesExtrasList(restExtras);

        const alergList = toArray(p.alergias);
        const alergPadrao = alergList.filter(item => alergiasOpcoes.includes(item) || item === 'Nenhum');
        const alergExtras = alergList.filter(item => !alergiasOpcoes.includes(item) && item !== 'Nenhum');
        setAlergias(alergPadrao);
        setAlergiasExtrasList(alergExtras);

        setMedicamentos(p.medicamentos || '');
        setSuplementos(p.suplementos || '');

        setRefeicoesPorDia(p.refeicoes_por_dia ? String(p.refeicoes_por_dia) : '');
        setHorarioAcorda(p.horario_acorda || '');
        setHorarioDorme(p.horario_dorme || '');
        setLitrosAgua(p.litros_agua ? String(p.litros_agua) : '');
        setPraticaAtividade(Boolean(p.atividade_fisica));
        setAtividadeDescricao(p.atividade_fisica_descricao || '');
        setObservacoes(p.observacoes || '');

      } else {
        setError('Paciente não encontrado ou não pertence a este consultório.');
      }
    } catch (err) {
      console.error('Erro ao carregar perfil do paciente:', err);
      setError(err.message || 'Não foi possível carregar as informações do paciente.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar consultas
  const loadConsultas = async () => {
    if (!id) return;
    try {
      setLoadingConsultas(true);
      const sql = getDb();
      const result = await sql`
        SELECT * FROM consultas 
        WHERE paciente_id = ${id} 
        ORDER BY data_consulta DESC, created_at DESC;
      `;
      setConsultas(result || []);
    } catch (err) {
      console.error('Erro ao carregar consultas:', err);
      setConsultas([]);
    } finally {
      setLoadingConsultas(false);
    }
  };

  // Carregar planos alimentares
  const loadPlanos = async () => {
    if (!id) return;
    try {
      setLoadingPlanos(true);
      const sql = getDb();
      const result = await sql`
        SELECT * FROM planos_alimentares 
        WHERE paciente_id = ${id} 
        ORDER BY created_at DESC;
      `;
      setPlanos(result || []);
    } catch (err) {
      console.error('Erro ao carregar planos alimentares:', err);
      setPlanos([]);
    } finally {
      setLoadingPlanos(false);
    }
  };

  useEffect(() => {
    loadPaciente();
    loadConsultas();
    loadPlanos();
  }, [id, user?.id]);

  // Idade calculada
  const idadeCalculada = useMemo(() => {
    return calcularIdade(dataNascimento);
  }, [dataNascimento]);

  // IMC dinâmico
  const imcInfo = useMemo(() => {
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);

    if (!pesoNum || !alturaNum || alturaNum <= 0) return null;

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
      cor = '#2e7d32';
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

  // Formatadores de texto
  const formatPhone = (value) => {
    const numbers = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatTimeString = (value) => {
    if (!value) return '';
    const clean = String(value).trim().replace(':', '');
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

  const getIniciais = (nomeStr) => {
    if (!nomeStr || typeof nomeStr !== 'string') return 'P';
    const partes = nomeStr.trim().split(' ').filter(Boolean);
    if (partes.length === 0) return 'P';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  // Toggle multi-select
  const toggleMultiSelect = (item, currentList, setList) => {
    if (item === 'Nenhum') {
      if (currentList.includes('Nenhum')) {
        setList([]);
      } else {
        setList(['Nenhum']);
      }
      return;
    }
    let updated = currentList.filter(i => i !== 'Nenhum');
    if (updated.includes(item)) {
      updated = updated.filter(i => i !== item);
    } else {
      updated.push(item);
    }
    setList(updated);
  };

  const addExtraItem = (value, setValue, list, setList, parentList, setParentList) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return;
    if (!list.includes(trimmed)) {
      setList([...list, trimmed]);
      setParentList(parentList.filter(i => i !== 'Nenhum'));
    }
    setValue('');
  };

  const removeExtraItem = (item, list, setList) => {
    setList(list.filter(i => i !== item));
  };

  // Salvar alterações nos Dados do Paciente
  const handleSalvarPaciente = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('O nome completo do paciente é obrigatório.');
      setActiveTab('pessoal');
      return;
    }

    try {
      setSavingPaciente(true);
      setError('');
      const sql = getDb();

      const patologiasFinais = [...patologias.filter(p => p !== 'Nenhum'), ...patologiasExtrasList];
      const restricoesFinais = [...restricoes.filter(r => r !== 'Nenhum'), ...restricoesExtrasList];
      const alergiasFinais = [...alergias.filter(a => a !== 'Nenhum'), ...alergiasExtrasList];

      await sql`
        UPDATE pacientes SET
          nome = ${nome.trim()},
          data_nascimento = ${dataNascimento || null},
          sexo = ${sexo || null},
          telefone = ${telefone.trim() || null},
          whatsapp = ${whatsapp.trim() || null},
          email = ${email.trim() || null},
          peso_inicial = ${peso ? parseFloat(peso) : null},
          altura = ${altura ? parseFloat(altura) : null},
          objetivos = ${objetivos.length > 0 ? objetivos : null},
          objetivo_texto = ${objetivoTexto.trim() || null},
          nivel_atividade = ${nivelAtividade || null},
          patologias = ${patologiasFinais.length > 0 ? patologiasFinais : (patologias.includes('Nenhum') ? ['Nenhum'] : null)},
          restricoes_alimentares = ${restricoesFinais.length > 0 ? restricoesFinais : (restricoes.includes('Nenhum') ? ['Nenhum'] : null)},
          alergias = ${alergiasFinais.length > 0 ? alergiasFinais : (alergias.includes('Nenhum') ? ['Nenhum'] : null)},
          medicamentos = ${medicamentos.trim() || null},
          suplementos = ${suplementos.trim() || null},
          refeicoes_por_dia = ${refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null},
          horario_acorda = ${horarioAcorda.trim() || null},
          horario_dorme = ${horarioDorme.trim() || null},
          litros_agua = ${litrosAgua ? parseFloat(litrosAgua) : null},
          atividade_fisica = ${praticaAtividade},
          atividade_fisica_descricao = ${praticaAtividade ? atividadeDescricao.trim() : null},
          observacoes = ${observacoes.trim() || null}
        WHERE id = ${id};
      `;

      await loadPaciente();
      setToastMessage('Alterações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
      setError(err.message || 'Erro ao salvar alterações do paciente.');
    } finally {
      setSavingPaciente(false);
    }
  };

  // Salvar Nova Consulta
  const handleSalvarConsulta = async (e) => {
    e.preventDefault();
    setErroModalConsulta('');

    if (!novaConsultaData) {
      setErroModalConsulta('A data da consulta é obrigatória.');
      return;
    }
    if (!novaConsultaPeso || isNaN(parseFloat(novaConsultaPeso))) {
      setErroModalConsulta('Informe um peso válido para a consulta.');
      return;
    }

    try {
      setSalvandoConsulta(true);
      const sql = getDb();

      await sql`
        INSERT INTO consultas (
          paciente_id,
          data_consulta,
          peso,
          cintura,
          quadril,
          percentual_gordura,
          observacoes,
          proximo_retorno
        ) VALUES (
          ${id},
          ${novaConsultaData},
          ${parseFloat(novaConsultaPeso)},
          ${novaConsultaCintura ? parseFloat(novaConsultaCintura) : null},
          ${novaConsultaQuadril ? parseFloat(novaConsultaQuadril) : null},
          ${novaConsultaGordura ? parseFloat(novaConsultaGordura) : null},
          ${novaConsultaObs.trim() || null},
          ${novaConsultaProximoRetorno || null}
        );
      `;

      // Resetar form do modal
      setNovaConsultaData(hojeStr);
      setNovaConsultaPeso('');
      setNovaConsultaCintura('');
      setNovaConsultaQuadril('');
      setNovaConsultaGordura('');
      setNovaConsultaObs('');
      setNovaConsultaProximoRetorno('');
      setModalConsultaAberto(false);

      await loadConsultas();
      setToastMessage('Consulta registrada com sucesso!');
    } catch (err) {
      console.error('Erro ao registrar consulta:', err);
      setErroModalConsulta(err.message || 'Falha ao salvar consulta.');
    } finally {
      setSalvandoConsulta(false);
    }
  };

  // Preparação de dados para o Gráfico de Evolução de Peso
  const chartPoints = useMemo(() => {
    const points = [];

    // Incluir peso inicial do cadastro caso exista
    if (paciente?.peso_inicial && paciente?.created_at) {
      points.push({
        data: formatDateForInput(paciente.created_at),
        peso: Number(paciente.peso_inicial),
        label: 'Início',
        tipo: 'inicial'
      });
    }

    // Consultas ordenadas cronologicamente (crescente)
    const consultasValidas = (consultas || []).filter(
      c => c.peso !== null && c.peso !== undefined && c.peso !== ''
    );

    const consultasOrdenadas = [...consultasValidas].sort(
      (a, b) => new Date(a.data_consulta) - new Date(b.data_consulta)
    );

    consultasOrdenadas.forEach((c, idx) => {
      points.push({
        data: formatDateForInput(c.data_consulta),
        peso: Number(c.peso),
        label: `C${idx + 1}`,
        tipo: 'consulta',
        cintura: c.cintura,
        quadril: c.quadril,
        gordura: c.percentual_gordura
      });
    });

    return points;
  }, [paciente, consultas]);

  // Cálculos de dimensões SVG para o Gráfico
  const chartSvgData = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) return null;

    const width = 640;
    const height = 220;
    const padding = { top: 25, right: 35, bottom: 40, left: 55 };

    const pesos = chartPoints.map(p => p.peso).filter(p => !isNaN(p));
    if (pesos.length === 0) return null;

    const minPeso = Math.floor(Math.min(...pesos) - 2);
    const maxPeso = Math.ceil(Math.max(...pesos) + 2);
    const rangePeso = maxPeso - minPeso || 1;

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const coords = chartPoints.map((pt, i) => {
      const x = chartPoints.length === 1 
        ? padding.left + innerWidth / 2 
        : padding.left + (i / (chartPoints.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - ((pt.peso - minPeso) / rangePeso) * innerHeight;
      return { ...pt, x: isNaN(x) ? padding.left : x, y: isNaN(y) ? padding.top : y };
    });

    // Path da linha
    let pathD = '';
    if (coords.length === 1) {
      pathD = `M ${coords[0].x - 30} ${coords[0].y} L ${coords[0].x + 30} ${coords[0].y}`;
    } else {
      pathD = coords.reduce((acc, pt, i) => {
        return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
      }, '');
    }

    // Path da área sombreada
    let areaD = '';
    const baseY = padding.top + innerHeight;
    if (coords.length > 1) {
      areaD = `${pathD} L ${coords[coords.length - 1].x} ${baseY} L ${coords[0].x} ${baseY} Z`;
    } else if (coords.length === 1) {
      areaD = `M ${coords[0].x - 30} ${coords[0].y} L ${coords[0].x + 30} ${coords[0].y} L ${coords[0].x + 30} ${baseY} L ${coords[0].x - 30} ${baseY} Z`;
    }

    // Linhas de grade Y (4 linhas)
    const gridY = [];
    for (let step = 0; step <= 3; step++) {
      const val = minPeso + (rangePeso * step) / 3;
      const y = padding.top + innerHeight - (step / 3) * innerHeight;
      gridY.push({ val: val.toFixed(1), y });
    }

    return { width, height, padding, minPeso, maxPeso, coords, pathD, areaD, gridY };
  }, [chartPoints]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {/* Toast Notificação */}
        {toastMessage && (
          <div className="toast-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>{toastMessage}</span>
            <button className="toast-close" onClick={() => setToastMessage('')}>×</button>
          </div>
        )}

        {/* Cabeçalho */}
        <header className="dashboard-header">
          <div>
            <div className="breadcrumb">
              <Link to="/pacientes" className="breadcrumb-link">Pacientes</Link>
              <span className="breadcrumb-separator">/</span>
              <span>{paciente ? paciente.nome : 'Perfil do Paciente'}</span>
            </div>
            <h1 className="page-title">{paciente ? paciente.nome : (loading ? 'Carregando...' : 'Perfil do Paciente')}</h1>
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
          ) : !paciente ? (
            <div className="empty-state-card">
              <h2>Paciente não encontrado</h2>
              <p>O paciente solicitado não foi encontrado ou não está cadastrado em seu consultório.</p>
              <Link to="/pacientes" className="btn-primary-action" style={{ marginTop: '16px' }}>
                Voltar para Lista de Pacientes
              </Link>
            </div>
          ) : (
            <div className="paciente-perfil-container">
              {/* Header Hero Card do Paciente */}
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

                {/* Métricas rápidas no topo do perfil */}
                <div className="perfil-quick-metrics">
                  <div className="metric-pill">
                    <span className="metric-label">Peso Inicial</span>
                    <span className="metric-val">{paciente.peso_inicial ? `${paciente.peso_inicial} kg` : '-'}</span>
                  </div>
                  <div className="metric-pill">
                    <span className="metric-label">Altura</span>
                    <span className="metric-val">{paciente.altura ? `${paciente.altura} cm` : '-'}</span>
                  </div>
                  {imcInfo && (
                    <div className="metric-pill" style={{ borderLeft: `3px solid ${imcInfo.cor}` }}>
                      <span className="metric-label">IMC Atual</span>
                      <span className="metric-val" style={{ color: imcInfo.cor }}>{imcInfo.valor}</span>
                    </div>
                  )}
                  <div className="metric-pill">
                    <span className="metric-label">Consultas</span>
                    <span className="metric-val">{consultas.length}</span>
                  </div>
                </div>
              </div>

              {/* Barra de Navegação das 3 Seções Principais */}
              <div className="section-tabs-nav">
                <button
                  type="button"
                  className={`section-tab-btn ${activeSection === 'dados' ? 'active' : ''}`}
                  onClick={() => setActiveSection('dados')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Dados do Paciente
                </button>
                <button
                  type="button"
                  className={`section-tab-btn ${activeSection === 'consultas' ? 'active' : ''}`}
                  onClick={() => setActiveSection('consultas')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Consultas ({consultas.length})
                </button>
                <button
                  type="button"
                  className={`section-tab-btn ${activeSection === 'planos' ? 'active' : ''}`}
                  onClick={() => setActiveSection('planos')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Planos Alimentares ({planos.length})
                </button>
              </div>

              {/* ========================================================================= */}
              {/* SEÇÃO 1: DADOS DO PACIENTE (EDITÁVEL)                                    */}
              {/* ========================================================================= */}
              {activeSection === 'dados' && (
                <div className="section-content-card">
                  {/* Navegação entre as 3 sub-abas */}
                  <div className="subtabs-nav">
                    <button
                      type="button"
                      className={`subtab-btn ${activeTab === 'pessoal' ? 'active' : ''}`}
                      onClick={() => setActiveTab('pessoal')}
                    >
                      <span>1</span> Informações Pessoais
                    </button>
                    <button
                      type="button"
                      className={`subtab-btn ${activeTab === 'clinico' ? 'active' : ''}`}
                      onClick={() => setActiveTab('clinico')}
                    >
                      <span>2</span> Avaliação Clínica
                    </button>
                    <button
                      type="button"
                      className={`subtab-btn ${activeTab === 'habitos' ? 'active' : ''}`}
                      onClick={() => setActiveTab('habitos')}
                    >
                      <span>3</span> Hábitos & Rotina
                    </button>
                  </div>

                  <form onSubmit={handleSalvarPaciente}>
                    {/* Sub-Aba 1: Pessoal */}
                    {activeTab === 'pessoal' && (
                      <div className="tab-pane-content">
                        <div className="form-grid-2">
                          <div className="form-group-custom full-width">
                            <label className="form-label-custom">
                              Nome Completo <span className="required-star">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-input-custom"
                              placeholder="Nome completo do paciente"
                              value={nome}
                              onChange={(e) => setNome(e.target.value)}
                              required
                            />
                          </div>

                          <div className="form-group-custom">
                            <label className="form-label-custom">
                              Data de Nascimento
                              {idadeCalculada !== null && (
                                <span className="badge-idade">{idadeCalculada} anos</span>
                              )}
                            </label>
                            <input
                              type="date"
                              className="form-input-custom"
                              value={dataNascimento}
                              onChange={(e) => setDataNascimento(e.target.value)}
                            />
                          </div>

                          <div className="form-group-custom">
                            <label className="form-label-custom">Sexo</label>
                            <div className="radio-group-chips">
                              {['Feminino', 'Masculino', 'Outro'].map((item) => (
                                <button
                                  key={item}
                                  type="button"
                                  className={`chip-btn ${sexo === item ? 'active' : ''}`}
                                  onClick={() => setSexo(sexo === item ? '' : item)}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="form-group-custom">
                            <label className="form-label-custom">Telefone</label>
                            <input
                              type="text"
                              className="form-input-custom"
                              placeholder="(00) 0000-0000"
                              value={telefone}
                              onChange={(e) => setTelefone(formatPhone(e.target.value))}
                            />
                          </div>

                          <div className="form-group-custom">
                            <label className="form-label-custom">WhatsApp</label>
                            <input
                              type="text"
                              className="form-input-custom"
                              placeholder="(00) 00000-0000"
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                            />
                          </div>

                          <div className="form-group-custom full-width">
                            <label className="form-label-custom">E-mail</label>
                            <input
                              type="email"
                              className="form-input-custom"
                              placeholder="paciente@exemplo.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-Aba 2: Clínico */}
                    {activeTab === 'clinico' && (
                      <div className="tab-pane-content">
                        <div className="form-grid-3">
                          <div className="form-group-custom">
                            <label className="form-label-custom">Peso Inicial (kg)</label>
                            <div className="input-with-unit">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                className="form-input-custom"
                                placeholder="Ex: 70.5"
                                value={peso}
                                onChange={(e) => setPeso(e.target.value)}
                              />
                              <span className="unit-label">kg</span>
                            </div>
                          </div>

                          <div className="form-group-custom">
                            <label className="form-label-custom">Altura (cm)</label>
                            <div className="input-with-unit">
                              <input
                                type="number"
                                step="1"
                                min="0"
                                className="form-input-custom"
                                placeholder="Ex: 175"
                                value={altura}
                                onChange={(e) => setAltura(e.target.value)}
                              />
                              <span className="unit-label">cm</span>
                            </div>
                          </div>

                          <div className="form-group-custom">
                            <label className="form-label-custom">IMC Calculado</label>
                            <div className="imc-display-box">
                              {imcInfo ? (
                                <div className="imc-content">
                                  <span className="imc-value" style={{ color: imcInfo.cor }}>
                                    {imcInfo.valor}
                                  </span>
                                  <span className="imc-class" style={{ color: imcInfo.cor }}>
                                    {imcInfo.classificacao}
                                  </span>
                                </div>
                              ) : (
                                <span className="imc-placeholder">Informe peso e altura</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group-custom full-width">
                          <label className="form-label-custom">Objetivos do Acompanhamento</label>
                          <div className="chips-container">
                            {objetivosOpcoes.map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`chip-btn ${objetivos.includes(item) ? 'active' : ''}`}
                                onClick={() => toggleMultiSelect(item, objetivos, setObjetivos)}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            className="form-input-custom"
                            style={{ marginTop: '10px' }}
                            placeholder="Outro objetivo específico ou detalhes..."
                            value={objetivoTexto}
                            onChange={(e) => setObjetivoTexto(e.target.value)}
                          />
                        </div>

                        <div className="form-group-custom full-width">
                          <label className="form-label-custom">Nível de Atividade Física</label>
                          <div className="chips-container">
                            {niveisAtividadeOpcoes.map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`chip-btn ${nivelAtividade === item ? 'active' : ''}`}
                                onClick={() => setNivelAtividade(nivelAtividade === item ? '' : item)}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Patologias */}
                        <div className="form-group-custom full-width">
                          <label className="form-label-custom">Patologias ou Condições de Saúde</label>
                          <div className="chips-container">
                            <button
                              type="button"
                              className={`chip-btn ${patologias.includes('Nenhum') ? 'active neutral' : ''}`}
                              onClick={() => {
                                setPatologias(patologias.includes('Nenhum') ? [] : ['Nenhum']);
                                setPatologiasExtrasList([]);
                              }}
                            >
                              Nenhum
                            </button>
                            {patologiasOpcoes.map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`chip-btn ${patologias.includes(item) ? 'active' : ''}`}
                                onClick={() => toggleMultiSelect(item, patologias, setPatologias)}
                              >
                                {item}
                              </button>
                            ))}
                            {patologiasExtrasList.map((item) => (
                              <span key={item} className="chip-badge-extra">
                                {item}
                                <button type="button" onClick={() => removeExtraItem(item, patologiasExtrasList, setPatologiasExtrasList)}>×</button>
                              </span>
                            ))}
                          </div>
                          <div className="add-extra-wrapper">
                            <input
                              type="text"
                              className="form-input-custom"
                              placeholder="Adicionar outra patologia..."
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
                              className="btn-add-extra"
                              onClick={() => addExtraItem(patologiaExtra, setPatologiaExtra, patologiasExtrasList, setPatologiasExtrasList, patologias, setPatologias)}
                            >
                              + Adicionar
                            </button>
                          </div>
                        </div>

                        {/* Restrições */}
                        <div className="form-group-custom full-width">
                          <label className="form-label-custom">Restrições Alimentares</label>
                          <div className="chips-container">
                            <button
                              type="button"
                              className={`chip-btn ${restricoes.includes('Nenhum') ? 'active neutral' : ''}`}
                              onClick={() => {
                                setRestricoes(restricoes.includes('Nenhum') ? [] : ['Nenhum']);
                                setRestricoesExtrasList([]);
                              }}
                            >
                              Nenhum
                            </button>
                            {restricoesOpcoes.map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`chip-btn ${restricoes.includes(item) ? 'active' : ''}`}
                                onClick={() => toggleMultiSelect(item, restricoes, setRestricoes)}
                              >
                                {item}
                              </button>
                            ))}
                            {restricoesExtrasList.map((item) => (
                              <span key={item} className="chip-badge-extra">
                                {item}
                                <button type="button" onClick={() => removeExtraItem(item, restricoesExtrasList, setRestricoesExtrasList)}>×</button>
                              </span>
                            ))}
                          </div>
                          <div className="add-extra-wrapper">
                            <input
                              type="text"
                              className="form-input-custom"
                              placeholder="Adicionar outra restrição alimentar..."
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
                              className="btn-add-extra"
                              onClick={() => addExtraItem(restricaoExtra, setRestricaoExtra, restricoesExtrasList, setRestricoesExtrasList, restricoes, setRestricoes)}
                            >
                              + Adicionar
                            </button>
                          </div>
                        </div>

                        {/* Alergias */}
                        <div className="form-group-custom full-width">
                          <label className="form-label-custom">Alergias Alimentares</label>
                          <div className="chips-container">
                            <button
                              type="button"
                              className={`chip-btn ${alergias.includes('Nenhum') ? 'active neutral' : ''}`}
                              onClick={() => {
                                setAlergias(alergias.includes('Nenhum') ? [] : ['Nenhum']);
                                setAlergiasExtrasList([]);
                              }}
                            >
                              Nenhum
                            </button>
                            {alergiasOpcoes.map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`chip-btn ${alergias.includes(item) ? 'active' : ''}`}
                                onClick={() => toggleMultiSelect(item, alergias, setAlergias)}
                              >
                                {item}
                              </button>
                            ))}
                            {alergiasExtrasList.map((item) => (
                              <span key={item} className="chip-badge-extra">
                                {item}
                                <button type="button" onClick={() => removeExtraItem(item, alergiasExtrasList, setAlergiasExtrasList)}>×</button>
                              </span>
                            ))}
                          </div>
                          <div className="add-extra-wrapper">
                            <input
                              type="text"
                              className="form-input-custom"
                              placeholder="Adicionar outra alergia..."
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
                              className="btn-add-extra"
                              onClick={() => addExtraItem(alergiaExtra, setAlergiaExtra, alergiasExtrasList, setAlergiasExtrasList, alergias, setAlergias)}
                            >
                              + Adicionar
                            </button>
                          </div>
                        </div>

                        <div className="form-grid-2">
                          <div className="form-group-custom">
                            <label className="form-label-custom">Medicamentos Contínuos</label>
                            <textarea
                              className="form-textarea-custom"
                              placeholder="Informe medicamentos em uso contínuo..."
                              value={medicamentos}
                              onChange={(e) => setMedicamentos(e.target.value)}
                              rows="3"
                            />
                          </div>

                          <div className="form-group-custom">
                            <label className="form-label-custom">Suplementos em Uso</label>
                            <textarea
                              className="form-textarea-custom"
                              placeholder="Informe suplementos, vitaminas ou fitoterápicos..."
                              value={suplementos}
                              onChange={(e) => setSuplementos(e.target.value)}
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-Aba 3: Hábitos */}
                    {activeTab === 'habitos' && (
                      <div className="tab-pane-content">
                        <div className="form-grid-3">
                          <div className="form-group-custom">
                            <label className="form-label-custom">Refeições / Dia</label>
                            <input
                              type="number"
                              min="1"
                              max="12"
                              className="form-input-custom"
                              placeholder="Ex: 5"
                              value={refeicoesPorDia}
                              onChange={(e) => setRefeicoesPorDia(e.target.value)}
                            />
                          </div>

                          <div className="form-group-custom">
                            <label className="form-label-custom">Horário que Acorda</label>
                            <input
                              type="text"
                              className="form-input-custom"
                              placeholder="Ex: 06:30"
                              value={horarioAcorda}
                              onChange={(e) => setHorarioAcorda(e.target.value)}
                              onBlur={(e) => setHorarioAcorda(formatTimeString(e.target.value))}
                            />
                          </div>

                          <div className="form-group-custom">
                            <label className="form-label-custom">Horário que Dorme</label>
                            <input
                              type="text"
                              className="form-input-custom"
                              placeholder="Ex: 22:30"
                              value={horarioDorme}
                              onChange={(e) => setHorarioDorme(e.target.value)}
                              onBlur={(e) => setHorarioDorme(formatTimeString(e.target.value))}
                            />
                          </div>
                        </div>

                        <div className="form-group-custom">
                          <label className="form-label-custom">Quantidade de Água por Dia</label>
                          <div className="input-with-unit" style={{ maxWidth: '280px' }}>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              className="form-input-custom"
                              placeholder="Ex: 2.5"
                              value={litrosAgua}
                              onChange={(e) => setLitrosAgua(e.target.value)}
                            />
                            <span className="unit-label">litros</span>
                          </div>
                        </div>

                        <div className="form-group-custom full-width">
                          <label className="form-label-custom">Pratica Atividade Física?</label>
                          <div className="radio-group-chips">
                            <button
                              type="button"
                              className={`chip-btn ${!praticaAtividade ? 'active' : ''}`}
                              onClick={() => {
                                setPraticaAtividade(false);
                                setAtividadeDescricao('');
                              }}
                            >
                              Não
                            </button>
                            <button
                              type="button"
                              className={`chip-btn ${praticaAtividade ? 'active' : ''}`}
                              onClick={() => setPraticaAtividade(true)}
                            >
                              Sim
                            </button>
                          </div>

                          {praticaAtividade && (
                            <div style={{ marginTop: '12px' }}>
                              <label className="form-label-custom" style={{ fontSize: '13px' }}>
                                Qual atividade e frequência semanal?
                              </label>
                              <input
                                type="text"
                                className="form-input-custom"
                                placeholder="Ex: Musculação 4x na semana, Corrida aos sábados"
                                value={atividadeDescricao}
                                onChange={(e) => setAtividadeDescricao(e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        <div className="form-group-custom full-width">
                          <label className="form-label-custom">Observações Gerais</label>
                          <textarea
                            className="form-textarea-custom"
                            placeholder="Anotações adicionais, rotinas específicas ou preferências..."
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            rows="4"
                          />
                        </div>
                      </div>
                    )}

                    {/* Botão de Salvar Alterações */}
                    <div className="form-actions-footer">
                      <button
                        type="submit"
                        className="btn-primary-action"
                        disabled={savingPaciente}
                      >
                        {savingPaciente ? (
                          <>
                            <span className="spinner-icon-sm"></span>
                            Salvando alterações...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                            Salvar alterações
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SEÇÃO 2: CONSULTAS & EVOLUÇÃO DE PESO                                    */}
              {/* ========================================================================= */}
              {activeSection === 'consultas' && (
                <div className="consultas-section-container">
                  {/* Topo da seção de consultas: Header e Botão Nova Consulta */}
                  <div className="consultas-section-header">
                    <div>
                      <h2>Acompanhamento e Consultas</h2>
                      <p>Histórico clínico de avaliações antropométricas e evolução corporal.</p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary-action"
                      onClick={() => setModalConsultaAberto(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      Nova Consulta
                    </button>
                  </div>

                  {/* Card do Gráfico de Evolução de Peso */}
                  <div className="dashboard-card chart-card">
                    <div className="card-header">
                      <div className="chart-title-group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <h3>Gráfico de Evolução de Peso</h3>
                      </div>
                      {chartPoints.length > 0 && (
                        <div className="chart-legend-metrics">
                          <span className="legend-tag">
                            Primeiro registro: <strong>{chartPoints[0].peso} kg</strong>
                          </span>
                          <span className="legend-tag highlight">
                            Último peso: <strong>{chartPoints[chartPoints.length - 1].peso} kg</strong>
                          </span>
                          {chartPoints.length > 1 && (
                            <span className={`legend-tag ${chartPoints[chartPoints.length - 1].peso - chartPoints[0].peso <= 0 ? 'success' : 'alert'}`}>
                              Variação: <strong>{(chartPoints[chartPoints.length - 1].peso - chartPoints[0].peso).toFixed(1)} kg</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="chart-body">
                      {chartSvgData && chartPoints.length > 0 ? (
                        <div className="chart-svg-wrapper">
                          <svg
                            viewBox={`0 0 ${chartSvgData.width} ${chartSvgData.height}`}
                            className="chart-svg"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.28" />
                                <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Linhas de Grade Horizontais */}
                            {chartSvgData.gridY.map((g, idx) => (
                              <g key={idx}>
                                <line
                                  x1={chartSvgData.padding.left}
                                  y1={g.y}
                                  x2={chartSvgData.width - chartSvgData.padding.right}
                                  y2={g.y}
                                  stroke="#e0e0e0"
                                  strokeDasharray="3 3"
                                  strokeWidth="1"
                                />
                                <text
                                  x={chartSvgData.padding.left - 10}
                                  y={g.y + 4}
                                  textAnchor="end"
                                  className="chart-axis-label"
                                >
                                  {g.val} kg
                                </text>
                              </g>
                            ))}

                            {/* Área sombreada */}
                            {chartSvgData.areaD && (
                              <path d={chartSvgData.areaD} fill="url(#weightGradient)" />
                            )}

                            {/* Linha principal */}
                            <path
                              d={chartSvgData.pathD}
                              fill="none"
                              stroke="#2e7d32"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Pontos de dados */}
                            {chartSvgData.coords.map((pt, i) => (
                              <g key={i}>
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="6"
                                  fill="#ffffff"
                                  stroke="#2e7d32"
                                  strokeWidth="3"
                                  className="chart-data-circle"
                                  onMouseEnter={() => setHoveredPoint(pt)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                                <text
                                  x={pt.x}
                                  y={chartSvgData.height - 12}
                                  textAnchor="middle"
                                  className="chart-date-label"
                                >
                                  {formatarData(pt.data)}
                                </text>
                              </g>
                            ))}
                          </svg>

                          {/* Tooltip interativo */}
                          {hoveredPoint && (
                            <div
                              className="chart-tooltip-floating"
                              style={{
                                left: `${(hoveredPoint.x / chartSvgData.width) * 100}%`,
                                top: `${(hoveredPoint.y / chartSvgData.height) * 100}%`
                              }}
                            >
                              <strong>{hoveredPoint.peso} kg</strong>
                              <span>{formatarData(hoveredPoint.data)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="empty-chart-box">
                          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#a0a89f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                          <p>Nenhuma consulta registrada ainda</p>
                          <span>Clique em "+ Nova Consulta" acima para registrar a primeira avaliação e acompanhar a evolução.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista de Consultas */}
                  <div className="consultas-list-card">
                    <div className="card-header">
                      <h3>📋 Histórico de Consultas Realizadas</h3>
                      <span className="badge-counter">{consultas.length} registro(s)</span>
                    </div>

                    {loadingConsultas ? (
                      <div className="loading-state">
                        <span className="spinner-icon"></span>
                        Carregando consultas...
                      </div>
                    ) : consultas.length === 0 ? (
                      <div className="empty-state-card">
                        <p>Nenhuma consulta registrada ainda.</p>
                      </div>
                    ) : (
                      <div className="consultas-table-wrapper">
                        <table className="consultas-table">
                          <thead>
                            <tr>
                              <th>Data</th>
                              <th>Peso</th>
                              <th>Cintura</th>
                              <th>Quadril</th>
                              <th>% Gordura</th>
                              <th>Próximo Retorno</th>
                              <th>Observações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {consultas.map((c) => (
                              <tr key={c.id}>
                                <td className="font-semibold text-primary">
                                  {formatarData(c.data_consulta)}
                                </td>
                                <td>
                                  {c.peso ? (
                                    <span className="peso-badge">{c.peso} kg</span>
                                  ) : '-'}
                                </td>
                                <td>{c.cintura ? `${c.cintura} cm` : '-'}</td>
                                <td>{c.quadril ? `${c.quadril} cm` : '-'}</td>
                                <td>{c.percentual_gordura ? `${c.percentual_gordura}%` : '-'}</td>
                                <td>
                                  {c.proximo_retorno ? (
                                    <span className="tag-retorno">📅 {formatarData(c.proximo_retorno)}</span>
                                  ) : '-'}
                                </td>
                                <td className="obs-cell">
                                  {c.observacoes || <span className="text-muted">Sem observações</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SEÇÃO 3: PLANOS ALIMENTARES                                               */}
              {/* ========================================================================= */}
              {activeSection === 'planos' && (
                <div className="planos-section-container">
                  <div className="planos-section-header">
                    <div>
                      <h2>Planos Alimentares</h2>
                      <p>Dietas, prescrições e planejamentos nutricionais para este paciente.</p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary-action btn-ia-action"
                      onClick={() => alert('A geração de Planos Alimentares com IA será ativada no próximo prompt!')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                      Gerar Plano Alimentar
                    </button>
                  </div>

                  {loadingPlanos ? (
                    <div className="loading-state">
                      <span className="spinner-icon"></span>
                      Carregando planos alimentares...
                    </div>
                  ) : planos.length === 0 ? (
                    <div className="empty-state-card planos-empty-box">
                      <div className="empty-icon-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                      </div>
                      <h3>Nenhum plano alimentar gerado ainda</h3>
                      <p>Utilize o botão acima para criar e prescrever um novo plano alimentar personalizado.</p>
                    </div>
                  ) : (
                    <div className="planos-grid">
                      {planos.map((plano, idx) => (
                        <div
                          key={plano.id}
                          className="plano-card-item"
                          onClick={() => setPlanoVisualizando(plano)}
                        >
                          <div className="plano-card-header">
                            <span className="plano-tag">Plano #{planos.length - idx}</span>
                            <span className="plano-date">📅 {formatarData(plano.created_at)}</span>
                          </div>
                          <h4 className="plano-card-title">
                            {plano.conteudo?.titulo || `Plano Nutricional — ${formatarData(plano.created_at)}`}
                          </h4>
                          <p className="plano-card-desc">
                            {plano.conteudo?.descricao || plano.conteudo?.resumo || 'Clique para visualizar todos os detalhes deste plano.'}
                          </p>
                          <div className="plano-card-footer">
                            <span>Ver conteúdo completo →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ========================================================================= */}
        {/* MODAL: NOVA CONSULTA                                                      */}
        {/* ========================================================================= */}
        {modalConsultaAberto && (
          <div className="modal-backdrop" onClick={() => setModalConsultaAberto(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🩺 Registrar Nova Consulta</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setModalConsultaAberto(false)}
                >
                  ✕
                </button>
              </div>

              {erroModalConsulta && (
                <div className="error-message" style={{ margin: '16px 24px 0' }}>
                  <span>⚠️</span> {erroModalConsulta}
                </div>
              )}

              <form onSubmit={handleSalvarConsulta}>
                <div className="modal-body">
                  <div className="form-grid-2">
                    <div className="form-group-custom">
                      <label className="form-label-custom">
                        Data da Consulta <span className="required-star">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-input-custom"
                        value={novaConsultaData}
                        onChange={(e) => setNovaConsultaData(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group-custom">
                      <label className="form-label-custom">
                        Peso Atual (kg) <span className="required-star">*</span>
                      </label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          className="form-input-custom"
                          placeholder="Ex: 72.3"
                          value={novaConsultaPeso}
                          onChange={(e) => setNovaConsultaPeso(e.target.value)}
                          required
                        />
                        <span className="unit-label">kg</span>
                      </div>
                    </div>

                    <div className="form-group-custom">
                      <label className="form-label-custom">Cintura (cm)</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          className="form-input-custom"
                          placeholder="Ex: 82"
                          value={novaConsultaCintura}
                          onChange={(e) => setNovaConsultaCintura(e.target.value)}
                        />
                        <span className="unit-label">cm</span>
                      </div>
                    </div>

                    <div className="form-group-custom">
                      <label className="form-label-custom">Quadril (cm)</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          className="form-input-custom"
                          placeholder="Ex: 101"
                          value={novaConsultaQuadril}
                          onChange={(e) => setNovaConsultaQuadril(e.target.value)}
                        />
                        <span className="unit-label">cm</span>
                      </div>
                    </div>

                    <div className="form-group-custom">
                      <label className="form-label-custom">% de Gordura Corporal</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="form-input-custom"
                          placeholder="Ex: 18.5"
                          value={novaConsultaGordura}
                          onChange={(e) => setNovaConsultaGordura(e.target.value)}
                        />
                        <span className="unit-label">%</span>
                      </div>
                    </div>

                    <div className="form-group-custom">
                      <label className="form-label-custom">Próximo Retorno</label>
                      <input
                        type="date"
                        className="form-input-custom"
                        value={novaConsultaProximoRetorno}
                        onChange={(e) => setNovaConsultaProximoRetorno(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group-custom full-width" style={{ marginTop: '12px' }}>
                    <label className="form-label-custom">Observações da Consulta</label>
                    <textarea
                      className="form-textarea-custom"
                      placeholder="Evolução, alterações no plano, queixas ou feedbacks do paciente..."
                      value={novaConsultaObs}
                      onChange={(e) => setNovaConsultaObs(e.target.value)}
                      rows="3"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setModalConsultaAberto(false)}
                    disabled={salvandoConsulta}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-action"
                    disabled={salvandoConsulta}
                  >
                    {salvandoConsulta ? (
                      <>
                        <span className="spinner-icon-sm"></span>
                        Salvando consulta...
                      </>
                    ) : (
                      'Salvar Consulta'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: VISUALIZADOR DE PLANO ALIMENTAR                                    */}
        {/* ========================================================================= */}
        {planoVisualizando && (
          <div className="modal-backdrop" onClick={() => setPlanoVisualizando(null)}>
            <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>📄 Plano Alimentar</h3>
                  <span className="text-muted" style={{ fontSize: '13px' }}>
                    Gerado em {formatarData(planoVisualizando.created_at)}
                  </span>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setPlanoVisualizando(null)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="plano-detalhe-view">
                  {typeof planoVisualizando.conteudo === 'string' ? (
                    <div className="plano-conteudo-formatado">
                      <pre>{planoVisualizando.conteudo}</pre>
                    </div>
                  ) : (
                    <div className="plano-conteudo-formatado">
                      <pre>{JSON.stringify(planoVisualizando.conteudo, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setPlanoVisualizando(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
