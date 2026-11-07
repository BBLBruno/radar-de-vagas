import React, { useState } from 'react';
import {
  Search,
  X,
  Sparkles,
  MapPin,
  EyeOff,
  Layers,
  Globe,
  Building2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Clock,
  Database,
  TrendingUp,
  Users,
  BarChart3,
  Cpu,
  Workflow,
  RotateCcw,
  HelpCircle,
  GraduationCap,
  Rocket,
  Zap,
  Award,
  Crown,
} from 'lucide-react';
import { ATSPlatform, FilterState, NicheCategory, SeniorityLevel, WorkplaceType } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  popularStacks: string[];
}

export const BrazilFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} rounded-[2px] shrink-0`}>
    <rect width="24" height="16" rx="2" fill="#009B3A" />
    <path d="M12 2L21.5 8L12 14L2.5 8L12 2Z" fill="#FEDF00" />
    <circle cx="12" cy="8" r="3.6" fill="#002776" />
    <path d="M8.6 7.2C10.5 6.4 13.5 6.8 15.4 8.2" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" />
  </svg>
);

const DAY_OPTIONS = [
  { value: 3, label: '3 dias' },
  { value: 7, label: '7 dias' },
  { value: 14, label: '14 dias' },
  { value: 30, label: '30 dias' },
  { value: 45, label: 'Todas' },
];

// Internacional posicionado no final
const PLATFORM_OPTIONS: Array<{ value: 'todas' | ATSPlatform; label: string }> = [
  { value: 'todas', label: 'Todas as Fontes' },
  { value: 'gupy', label: 'Gupy' },
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'inhire', label: 'InHire' },
  { value: 'lever', label: 'Lever' },
  { value: 'remotive_intl', label: 'Internacional' },
];

const CATEGORY_OPTIONS: Array<{
  value: 'todas' | NicheCategory;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { value: 'todas', label: 'Todas as Áreas', icon: Layers },
  { value: 'bizops_processos', label: 'Operações & Processos (BizOps)', icon: Workflow },
  { value: 'inteligencia_mercado', label: 'Inteligência de Mercado & Comercial', icon: TrendingUp },
  { value: 'crm_revops_onboarding', label: 'CRM, RevOps & Onboarding', icon: Users },
  { value: 'dados_bi', label: 'Dados & BI (SQL / Power BI)', icon: BarChart3 },
  { value: 'automacao_ia', label: 'Automação & IA (N8N)', icon: Cpu },
];

// Símbolo de Remoto como Casa (Home) + suporte a seleção múltipla
const WORKPLACE_OPTIONS: Array<{
  value: 'todos' | WorkplaceType;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { value: 'todos', label: 'Todas Modalidades', icon: Layers },
  { value: 'remoto', label: '100% Remoto', icon: Home },
  { value: 'hibrido', label: 'Híbrido', icon: Building2 },
  { value: 'presencial', label: 'Presencial', icon: MapPin },
];

// 6 opções de Senioridade com suporte a seleção múltipla
const SENIORITY_OPTIONS: Array<{
  value: 'todos' | SeniorityLevel;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { value: 'todos', label: 'Todas', icon: Layers },
  { value: 'estagio', label: 'Estágio / Trainee', icon: GraduationCap },
  { value: 'junior', label: 'Júnior / Assistente', icon: Rocket },
  { value: 'pleno', label: 'Pleno', icon: Zap },
  { value: 'senior', label: 'Sênior', icon: Award },
  { value: 'especialista', label: 'Especialista / Liderança', icon: Crown },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, popularStacks }) => {
  const [areDrawersExpanded, setAreDrawersExpanded] = useState(false);

  const toggleStack = (stack: string) => {
    setFilters(prev => {
      const exists = prev.selectedStacks.includes(stack);
      return {
        ...prev,
        selectedStacks: exists
          ? prev.selectedStacks.filter(s => s !== stack)
          : [...prev.selectedStacks, stack],
      };
    });
  };

  // Suporte para selecionar mais de uma opção de Modalidade
  const handleSelectWorkplace = (mode: 'todos' | WorkplaceType) => {
    setFilters(prev => {
      if (mode === 'todos') {
        return {
          ...prev,
          workplaceType: 'todos',
          selectedWorkplaces: [],
        };
      }

      const current = prev.selectedWorkplaces || [];
      const exists = current.includes(mode);
      const nextSelected = exists
        ? current.filter(item => item !== mode)
        : [...current, mode];

      return {
        ...prev,
        workplaceType: nextSelected.length === 1 ? nextSelected[0] : 'todos',
        selectedWorkplaces: nextSelected,
      };
    });
  };

  // Suporte para selecionar mais de uma opção de Senioridade
  const handleSelectSeniority = (level: 'todos' | SeniorityLevel) => {
    setFilters(prev => {
      if (level === 'todos') {
        return {
          ...prev,
          seniority: 'todos',
          selectedSeniorities: [],
          hideExecutiveSenior: false,
        };
      }

      const current = prev.selectedSeniorities || [];
      const exists = current.includes(level);
      const nextSelected = exists
        ? current.filter(item => item !== level)
        : [...current, level];

      return {
        ...prev,
        seniority: nextSelected.length === 1 ? nextSelected[0] : 'todos',
        selectedSeniorities: nextSelected,
        hideExecutiveSenior: false,
      };
    });
  };

  const handleSelectScope = (scope: 'todas' | 'nacional' | 'internacional') => {
    setFilters(prev => {
      let nextPlatform = prev.platform;
      if (scope === 'nacional' && prev.platform === 'remotive_intl') {
        nextPlatform = 'todas';
      } else if (scope === 'internacional' && prev.platform !== 'todas' && prev.platform !== 'remotive_intl') {
        nextPlatform = 'todas';
      }
      return {
        ...prev,
        scopeFilter: scope,
        platform: nextPlatform,
      };
    });
  };

  const handleSelectPlatform = (platform: 'todas' | ATSPlatform) => {
    setFilters(prev => {
      let nextScope = prev.scopeFilter;
      if (platform === 'remotive_intl' && prev.scopeFilter === 'nacional') {
        nextScope = 'todas';
      } else if (platform !== 'todas' && platform !== 'remotive_intl' && prev.scopeFilter === 'internacional') {
        nextScope = 'todas';
      }
      return {
        ...prev,
        platform,
        scopeFilter: nextScope,
      };
    });
  };

  const handleToggleRadiusOrRemote = () => {
    setFilters(prev => {
      const nextActive = !prev.onlyMuzambinhoRadiusOrRemote;
      // Se ativou o filtro de Remoto + Híbrido <=150km e estava filtrado apenas em Presencial, limpa Presencial
      const cleanedWorkplaces = nextActive
        ? (prev.selectedWorkplaces || []).filter(w => w !== 'presencial')
        : prev.selectedWorkplaces || [];

      return {
        ...prev,
        onlyMuzambinhoRadiusOrRemote: nextActive,
        selectedWorkplaces: cleanedWorkplaces,
        workplaceType: cleanedWorkplaces.length === 1 ? cleanedWorkplaces[0] : 'todos',
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      maxDays: 30,
      workplaceType: 'todos',
      selectedWorkplaces: [],
      scopeFilter: 'todas',
      seniority: 'todos',
      selectedSeniorities: [],
      hideExecutiveSenior: false,
      platform: 'todas',
      selectedStacks: [],
      stateFilter: '',
      hideAffirmative: true,
      onlyMuzambinhoRadiusOrRemote: false,
      selectedNicheCategory: 'todas',
    });
  };

  const selectedAreaLabel =
    CATEGORY_OPTIONS.find(c => c.value === filters.selectedNicheCategory)?.label || 'Todas as Áreas';

  const selectedWorkplaces = filters.selectedWorkplaces || [];
  const selectedSeniorities = filters.selectedSeniorities || [];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Linha 1: Busca + Seletor de Localidade + Limpar Filtros (Todos exatamente na mesma espessura h-11) */}
      <div className="flex flex-col lg:flex-row items-stretch gap-3">
        <div className="relative flex-1 h-11">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Buscar cargo, empresa ou habilidade (ex: Operações, Processos, CRM, BI, Onboarding, Júnior)..."
            className="w-full h-11 pl-11 pr-10 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Seletor de Localidade com mesma espessura (h-11) e borda da busca e do limpar filtros */}
        <div className="min-h-11 lg:h-11 flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-700/80 shrink-0">
          <button
            type="button"
            onClick={() => handleSelectScope('todas')}
            className={`h-full px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              filters.scopeFilter === 'todas'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Brasil + Internacional</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectScope('nacional')}
            className={`h-full px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              filters.scopeFilter === 'nacional'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BrazilFlagIcon className="w-4 h-3" />
            <span>Brasil</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectScope('internacional')}
            className={`h-full px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              filters.scopeFilter === 'internacional'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${filters.scopeFilter === 'internacional' ? 'text-slate-950' : 'text-cyan-400'}`} />
            <span>Internacional (100% Remoto)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="h-11 px-4 rounded-xl text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar Filtros</span>
        </button>
      </div>

      {/* Linha 2: Separação Visual em 2 Painéis (Ambos com suporte a Múltipla Escolha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Painel Modalidade de Trabalho (Múltipla Escolha) */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800/90 border-l-4 border-l-emerald-500 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              Modalidade de Trabalho
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedWorkplaces.length > 0
                ? `${selectedWorkplaces.length} selecionada(s)`
                : 'Múltipla escolha'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {WORKPLACE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected =
                opt.value === 'todos'
                  ? selectedWorkplaces.length === 0
                  : selectedWorkplaces.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectWorkplace(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 truncate ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel Nível de Senioridade (Múltipla Escolha) */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/90 border-l-4 border-l-cyan-500 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Nível de Senioridade
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedSeniorities.length > 0
                ? `${selectedSeniorities.length} selecionada(s) • Múltipla escolha`
                : 'Pode selecionar mais de uma opção'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SENIORITY_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected =
                opt.value === 'todos'
                  ? selectedSeniorities.length === 0
                  : selectedSeniorities.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectSeniority(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 truncate ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}`} />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Linha 3: Esquerda (Fonte em cima e Publicação embaixo) | Direita (Sem Afirmativas e Raio 150km / Remoto) */}
      <div className="space-y-2 pt-1">
        {/* Sub-linha 3.1: Fonte (Esquerda) + Sem Afirmativas (Direita no mesmo padrão de container) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Esquerda: Fonte */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 px-2">
              <Database className="w-3.5 h-3.5" />
              Fonte:
            </span>
            {PLATFORM_OPTIONS.map(opt => {
              const active = filters.platform === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectPlatform(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Direita: Sem Afirmativas + Tooltip */}
          <div className="relative group flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 ml-auto">
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, hideAffirmative: !prev.hideAffirmative }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filters.hideAffirmative
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Sem Afirmativas</span>
              <HelpCircle className={`w-3.5 h-3.5 ${filters.hideAffirmative ? 'text-slate-950/80' : 'text-slate-400'}`} />
            </button>

            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full right-0 mb-2 w-72 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 shadow-2xl z-50 leading-relaxed">
              <strong className="text-emerald-400 block mb-1">Filtro Sem Vagas Afirmativas</strong>
              Oculta vagas destinadas exclusivamente a recortes afirmativos específicos (PcD, mulheres, pessoas negras, LGBTQIA+, 50+), exibindo apenas processos de ampla concorrência.
            </div>
          </div>
        </div>

        {/* Sub-linha 3.2: Publicação (Esquerda) + Raio 150km / Remoto (Direita no mesmo padrão de container) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Esquerda: Publicação */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1 px-2">
              <Clock className="w-3.5 h-3.5" />
              Publicação:
            </span>
            {DAY_OPTIONS.map(opt => {
              const active = filters.maxDays === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, maxDays: opt.value }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Direita: Raio 150km / Remoto (100% Remoto + Híbridas até 150km) */}
          <div className="relative group flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 ml-auto">
            <button
              type="button"
              onClick={handleToggleRadiusOrRemote}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filters.onlyMuzambinhoRadiusOrRemote
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Raio 150km / Remoto</span>
              <HelpCircle className={`w-3.5 h-3.5 ${filters.onlyMuzambinhoRadiusOrRemote ? 'text-slate-950/80' : 'text-slate-400'}`} />
            </button>

            <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute bottom-full right-0 mb-2 w-72 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 shadow-2xl z-50 leading-relaxed">
              <strong className="text-cyan-400 block mb-1">Raio Fixo 150km (Muzambinho-MG) + Remoto</strong>
              Filtro geográfico fixo a partir de <strong>Muzambinho - MG (150km)</strong>. Exibe apenas vagas <strong>100% Remotas</strong> e vagas <strong>Híbridas na região</strong> (Poços de Caldas, Pouso Alegre, Varginha, Alfenas, Ribeirão Preto, Franca, Campinas, Limeira, Paulínia, etc.), ocultando presenciais e híbridas distantes.
            </div>
          </div>
        </div>
      </div>

      {/* Linha 4: Seções Recolhidas Sincronizadas (Área & Habilidades expandem juntas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/60 items-stretch">
        {/* Coluna 1: Filtro por Área */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={() => setAreDrawersExpanded(prev => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Filtro por Área:</span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] truncate">
                {selectedAreaLabel}
              </span>
            </div>
            {areDrawersExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {areDrawersExpanded && (
            <div className="p-3 pt-2 border-t border-slate-800/60 flex flex-wrap content-start gap-1.5 bg-slate-950/80 flex-1">
              {CATEGORY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = filters.selectedNicheCategory === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, selectedNicheCategory: opt.value }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna 2: Filtro Rápido por Habilidades & Ferramentas */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={() => setAreDrawersExpanded(prev => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Filtro Rápido por Habilidades & Ferramentas</span>
              {filters.selectedStacks.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                  {filters.selectedStacks.length} ativa(s)
                </span>
              )}
            </div>
            {areDrawersExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {areDrawersExpanded && (
            <div className="p-3 pt-2 border-t border-slate-800/60 flex flex-wrap content-start gap-1.5 bg-slate-950/80 flex-1">
              {popularStacks.map(stack => {
                const isSelected = filters.selectedStacks.includes(stack);
                return (
                  <button
                    key={stack}
                    type="button"
                    onClick={() => toggleStack(stack)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold border border-emerald-400'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                    }`}
                  >
                    {stack}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
