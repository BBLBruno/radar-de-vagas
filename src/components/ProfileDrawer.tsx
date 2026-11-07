import React, { useState, useRef } from 'react';
import {
  User,
  Code2,
  Save,
  Check,
  Plus,
  X,
  Target,
  MapPin,
  Copy,
  ExternalLink,
  FileText,
  Upload,
  Trash2,
  BookmarkCheck,
  Sparkles,
  Download,
  Link2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { ApplicationPortalLink, CandidateProfile } from '../types';
import { saveStoredProfile } from '../engine/defaultProfile';

interface ProfileDrawerProps {
  profile: CandidateProfile;
  setProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>;
}

const MARKET_PRESETS = [
  {
    id: 'preset_geral',
    label: 'Padrão Completo (BizOps + Dados + Automação)',
    title: 'Analista de Operações (BizOps), Processos, Inteligência Comercial & Dados',
    education:
      'Bacharel em Ciência da Computação — base analítica sólida em bancos de dados (SQL), lógica de sistemas, integração de APIs e modelagem de processos (BPMN).',
    entrepreneurship:
      'Vivência prática em gestão e operação de negócios digitais — visão executiva sobre eficiência operacional, funil de vendas, retenção, indicadores financeiros e SLA.',
    keyMetricCase:
      'Case de Eficiência Operacional: Redução expressiva no volume de demandas manuais de atendimento através do redesenho de processos (As-Is / To-Be), automações em N8N e triagem inteligente com IA.',
    operationalPillars:
      'Mapeamento e otimização de processos (Lean / BPMN), análise de dados e construção de dashboards (SQL, Power BI, Excel Avançado), gestão de funil em CRM (HubSpot / Salesforce) e implantação/onboarding de clientes.',
  },
  {
    id: 'preset_bizops',
    label: 'Foco Operações & Processos (BizOps)',
    title: 'Analista de Operações de Negócios (BizOps) & Melhoria de Processos',
    education:
      'Formação em Ciência da Computação com foco em modelagem de processos (BPMN), arquitetura operacional, automação de fluxos e análise de indicadores (KPIs/SLAs).',
    entrepreneurship:
      'Experiência prática estruturando rotinas de operações, logística, atendimento e controle de indicadores, garantindo escalabilidade e padronização com processos enxutos.',
    keyMetricCase:
      'Eliminação de retrabalho operacional e chamados repetitivos no atendimento através do mapeamento As-Is / To-Be e automação ponta a ponta com N8N e IA.',
    operationalPillars:
      'Diagnóstico de gargalos operacionais, documentação de POPs/playbooks, padronização de rotinas, acompanhamento de OKRs/KPIs e integração entre sistemas via Webhooks/APIs.',
  },
  {
    id: 'preset_comercial_crm',
    label: 'Foco Inteligência Comercial, CRM & RevOps',
    title: 'Analista de Inteligência Comercial, CRM & Revenue Operations (RevOps)',
    education:
      'Formação analítica e técnica com domínio em estruturação de bases de dados, integrações de CRM, funil de conversão e automação de jornada do cliente.',
    entrepreneurship:
      'Experiência direta em operação comercial e digital — acompanhamento de aquisição, conversão, retenção (LTV/CAC), precificação e inteligência de mercado.',
    keyMetricCase:
      'Automação de esteira comercial e atendimento com redução significativa no tempo de resposta ao cliente, integrando CRM, canais de comunicação e enriquecimento de dados.',
    operationalPillars:
      'Gestão de pipeline e higiene de dados no CRM (HubSpot / Salesforce), estudos de mercado e concorrência, criação de relatórios de performance comercial e suporte estratégico ao time de vendas/CS.',
  },
  {
    id: 'preset_dados_bi',
    label: 'Foco Dados, BI & Indicadores (SQL / Power BI)',
    title: 'Analista de Dados, Business Intelligence (BI) & Indicadores Operacionais',
    education:
      'Bacharel em Ciência da Computação — domínio de SQL, modelagem de dados, lógica de programação (Python), ETL e estruturação de indicadores de negócio.',
    entrepreneurship:
      'Atuação orientada por dados financeiros e operacionais, análise de curva ABC, performance de funil, retenção e diagnóstico de causa-raiz.',
    keyMetricCase:
      'Estruturação de pipelines automatizados de coleta e análise de dados operacionais, reduzindo tarefas manuais em planilhas e gerando visibilidade em tempo real de KPIs.',
    operationalPillars:
      'Construção de dashboards executivos (Power BI / Looker / Excel Avançado), consultas SQL, análise exploratória de dados, acompanhamento de metas e geração de insights acionáveis.',
  },
];

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ profile, setProfile }) => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newStackInput, setNewStackInput] = useState('');
  const [newTrackerName, setNewTrackerName] = useState('');
  const [newTrackerDesc, setNewTrackerDesc] = useState('');
  const [newTrackerUrl, setNewTrackerUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (field: keyof CandidateProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleBackgroundChange = (field: keyof CandidateProfile['background'], value: any) => {
    setProfile(prev => ({
      ...prev,
      background: {
        ...prev.background,
        [field]: value,
      },
    }));
  };

  const handlePreferencesChange = (field: keyof CandidateProfile['preferences'], value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  const applyMarketPreset = (preset: (typeof MARKET_PRESETS)[number]) => {
    setProfile(prev => ({
      ...prev,
      title: preset.title,
      background: {
        ...prev.background,
        education: preset.education,
        entrepreneurship: preset.entrepreneurship,
        keyMetricCase: preset.keyMetricCase,
        operationalPillars: preset.operationalPillars,
      },
    }));
  };

  const handleClearForNewUser = () => {
    const blankProfile: CandidateProfile = {
      ...profile,
      fullName: '',
      email: '',
      phone: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      resumeExternalUrl: '',
      resumePdfName: '',
      resumePdfDataUrl: '',
      salaryExpectationClt: '',
      salaryExpectationPj: '',
      title: 'Analista de Operações (BizOps), Processos & Dados',
      background: {
        ...profile.background,
        education: '',
        entrepreneurship: '',
        keyMetricCase: '',
        operationalPillars: '',
      },
      applicationTrackers: [],
    };
    setProfile(blankProfile);
    saveStoredProfile(blankProfile);
  };

  const copyText = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddStack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStackInput.trim();
    if (trimmed && !profile.primaryStacks.includes(trimmed)) {
      setProfile(prev => ({
        ...prev,
        primaryStacks: [...prev.primaryStacks, trimmed],
      }));
      setNewStackInput('');
    }
  };

  const handleRemoveStack = (stack: string) => {
    setProfile(prev => ({
      ...prev,
      primaryStacks: prev.primaryStacks.filter(s => s !== stack),
    }));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('O arquivo PDF deve ter no máximo 4MB para armazenamento rápido no navegador.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfile(prev => {
        const updated = {
          ...prev,
          resumePdfName: file.name,
          resumePdfDataUrl: dataUrl,
        };
        saveStoredProfile(updated);
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setProfile(prev => {
      const updated = {
        ...prev,
        resumePdfName: '',
        resumePdfDataUrl: '',
      };
      saveStoredProfile(updated);
      return updated;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTracker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackerName.trim() || !newTrackerUrl.trim()) return;
    const formattedUrl = newTrackerUrl.trim().startsWith('http')
      ? newTrackerUrl.trim()
      : `https://${newTrackerUrl.trim()}`;

    const newItem: ApplicationPortalLink = {
      id: `fav_${Date.now()}`,
      name: newTrackerName.trim(),
      description: newTrackerDesc.trim(),
      url: formattedUrl,
    };

    setProfile(prev => {
      const updated = {
        ...prev,
        applicationTrackers: [...(prev.applicationTrackers || []), newItem],
      };
      saveStoredProfile(updated);
      return updated;
    });

    setNewTrackerName('');
    setNewTrackerDesc('');
    setNewTrackerUrl('');
  };

  const handleRemoveTracker = (id: string) => {
    setProfile(prev => {
      const updated = {
        ...prev,
        applicationTrackers: (prev.applicationTrackers || []).filter(t => t.id !== id),
      };
      saveStoredProfile(updated);
      return updated;
    });
  };

  const handleSave = () => {
    saveStoredProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">Meu Perfil & Kit de Aplicação Rápida</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Salvo apenas neste navegador
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure seu background no padrão STAR de mercado, anexe seu currículo PDF e gerencie seus favoritos locais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleClearForNewUser}
            title="Limpar campos para preencher um novo perfil do zero neste navegador"
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Campos</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/15"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Alterações Salvas!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Perfil</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Background Profissional Fixo (Padrão de Mercado STAR + Templates Rápidos) */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 space-y-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-base font-bold text-white">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>Background Profissional (Injetado no Copiloto)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Estruturado com base nos critérios que recrutadores de Operações, Dados, CRM e Negócios avaliam em triagens.
            </p>
          </div>
        </div>

        {/* Presets de Mercado em 1 Clique */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Modelos de Posicionamento por Área (Clique para preencher e adapte livremente):
          </span>
          <div className="flex flex-wrap gap-2">
            {MARKET_PRESETS.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyMarketPreset(preset)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950/90 hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Título Profissional Alvo */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Título / Posicionamento Profissional Principal
          </label>
          <input
            type="text"
            value={profile.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ex: Analista de Operações (BizOps), Processos & Dados"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* 4 Blocos de Texto Amplos (Padrão Mercado) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider">
              1. Formação Acadêmica & Base Analítica
            </label>
            <textarea
              rows={3}
              value={profile.background.education}
              onChange={(e) => handleBackgroundChange('education', e.target.value)}
              placeholder="Descreva sua graduação, cursos e base técnica (SQL, BI, Processos)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">
              2. Visão de Negócio & Experiência Prática
            </label>
            <textarea
              rows={3}
              value={profile.background.entrepreneurship}
              onChange={(e) => handleBackgroundChange('entrepreneurship', e.target.value)}
              placeholder="Descreva sua experiência prática com operações, clientes, funil de vendas ou projetos..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
              3. Case de Impacto Quantitativo (Método STAR)
            </label>
            <textarea
              rows={3}
              value={profile.background.keyMetricCase}
              onChange={(e) => handleBackgroundChange('keyMetricCase', e.target.value)}
              placeholder="Ex: Redução de X% em tempo/chamados através de automação e melhoria de processos..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
              4. Entregáveis de Rotina, Ferramentas & Processos
            </label>
            <textarea
              rows={3}
              value={profile.background.operationalPillars || ''}
              onChange={(e) => handleBackgroundChange('operationalPillars', e.target.value)}
              placeholder="Ex: Mapeamento BPMN, dashboards em Power BI, consultas SQL, CRM HubSpot/Salesforce..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
      </div>

      {/* 2. Grid de Identificação & Habilidades Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identificação & Contato */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3.5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Dados de Identificação, Contato & Localidade</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome Completo</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(00) 90000-0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">E-mail Principal</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                Cidade Base
              </label>
              <input
                type="text"
                value={profile.preferences.referenceCity}
                onChange={(e) => handlePreferencesChange('referenceCity', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">UF</label>
              <input
                type="text"
                value={profile.preferences.referenceState}
                onChange={(e) => handlePreferencesChange('referenceState', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Raio Híbrido (km)</label>
              <input
                type="number"
                value={profile.preferences.maxHybridDistanceKm}
                onChange={(e) => handlePreferencesChange('maxHybridDistanceKm', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Pretensão CLT</label>
              <input
                type="text"
                value={profile.salaryExpectationClt}
                onChange={(e) => handleChange('salaryExpectationClt', e.target.value)}
                placeholder="Ex: R$ 4.500 - R$ 6.500"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Pretensão PJ</label>
              <input
                type="text"
                value={profile.salaryExpectationPj}
                onChange={(e) => handleChange('salaryExpectationPj', e.target.value)}
                placeholder="Ex: R$ 6.000 - R$ 8.500"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Habilidades & Competências Principais */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Habilidades & Ferramentas do Perfil (BizOps, Dados, CRM & IA)</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
              {profile.primaryStacks.map(stack => (
                <span
                  key={stack}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5"
                >
                  <span>{stack}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStack(stack)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddStack} className="flex gap-2 pt-2 border-t border-slate-800/70">
            <input
              type="text"
              value={newStackInput}
              onChange={(e) => setNewStackInput(e.target.value)}
              placeholder="Adicionar competência (ex: Looker Studio, Pipedrive, BPMN)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Links Profissionais & Currículo em PDF (Facilitador de Aplicação) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Links Profissionais & Currículo em PDF (Acesso Rápido para Aplicar)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Copie seus links em 1 clique ou baixe seu currículo em PDF rapidamente durante o preenchimento nos ATSs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LinkedIn */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <label className="block text-xs font-bold text-slate-300">URL do LinkedIn</label>
            <input
              type="text"
              value={profile.linkedinUrl}
              onChange={(e) => handleChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/seu-perfil"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyText(profile.linkedinUrl, 'linkedin')}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedId === 'linkedin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'linkedin' ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Abrir LinkedIn"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* GitHub / Portfólio */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <label className="block text-xs font-bold text-slate-300">URL do GitHub / Portfólio</label>
            <input
              type="text"
              value={profile.githubUrl}
              onChange={(e) => handleChange('githubUrl', e.target.value)}
              placeholder="https://github.com/seu-usuario"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyText(profile.githubUrl, 'github')}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedId === 'github' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'github' ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Abrir GitHub/Portfólio"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Upload / Gerenciamento de Currículo PDF */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Arquivo do Currículo (PDF)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              {profile.resumePdfName ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-300 truncate">
                      {profile.resumePdfName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    title="Remover PDF"
                    className="text-slate-400 hover:text-rose-400 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Anexe seu currículo em PDF para tê-lo sempre pronto para download/envio rápido nas vagas.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>{profile.resumePdfName ? 'Trocar PDF' : 'Anexar PDF'}</span>
              </button>

              {profile.resumePdfDataUrl && (
                <a
                  href={profile.resumePdfDataUrl}
                  download={profile.resumePdfName || 'Curriculo.pdf'}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 transition-all"
                  title="Baixar Currículo PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Favoritos de Candidaturas & Portais (100% Manual: Apenas Nome, Descrição e Link) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
              <BookmarkCheck className="w-5 h-5 text-cyan-400" />
              <span>Meus Links & Favoritos de Candidatura</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Salve manualmente seus links úteis, portais de candidato ou processos em andamento (como favoritos do navegador).
            </p>
          </div>
        </div>

        {(profile.applicationTrackers || []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(profile.applicationTrackers || []).map(tracker => (
              <div
                key={tracker.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{tracker.name}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveTracker(tracker.id)}
                      title="Remover favorito"
                      className="text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {tracker.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tracker.description}</p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1.5 truncate">{tracker.url}</p>
                </div>

                <a
                  href={tracker.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Abrir Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-400">
            Nenhum favorito adicionado ainda. Utilize os campos abaixo para salvar seus links manualmente.
          </div>
        )}

        <form
          onSubmit={handleAddTracker}
          className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3"
        >
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Adicionar Novo Link aos Favoritos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-3">
              <input
                type="text"
                value={newTrackerName}
                onChange={(e) => setNewTrackerName(e.target.value)}
                placeholder="Nome (ex: Minhas Vagas Gupy)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-4">
              <input
                type="text"
                value={newTrackerDesc}
                onChange={(e) => setNewTrackerDesc(e.target.value)}
                placeholder="Descrição (ex: Painel de acompanhamento)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-5 flex gap-2">
              <input
                type="text"
                value={newTrackerUrl}
                onChange={(e) => setNewTrackerUrl(e.target.value)}
                placeholder="Link (https://...)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
