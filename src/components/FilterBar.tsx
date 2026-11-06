import React, { useState } from 'react';
import {
  Search,
  X,
  Sparkles,
  MapPin,
  EyeOff,
  CheckSquare,
  Square,
  Layers,
  Globe,
  Building2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Wifi,
  Clock,
  Database,
  TrendingUp,
  Users,
  BarChart3,
  Cpu,
  Workflow,
  RotateCcw,
  SlidersHorizontal,
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

const PLATFORM_OPTIONS: Array<{ value: 'todas' | ATSPlatform; label: string }> = [
  { value: 'todas', label: 'Todas as Fontes' },
  { value: 'gupy', label: 'Gupy' },
  { value: 'remotive_intl', label: 'Internacional' },
  { value: 'greenhouse', label: 'Greenhouse' },
  { value: 'inhire', label: 'InHire' },
  { value: 'lever', label: 'Lever' },
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

const WORKPLACE_OPTIONS: Array<{
  value: 'todos' | WorkplaceType;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { value: 'todos', label: 'Todas Modalidades', icon: Layers },
  { value: 'remoto', label: '100% Remoto', icon: Wifi },
  { value: 'hibrido', label: 'Híbrido', icon: Building2 },
  { value: 'presencial', label: 'Presencial', icon: MapPin },
];

const SENIORITY_OPTIONS: Array<{
  value: 'todos' | SeniorityLevel;
  label: string;
}> = [
  { value: 'todos', label: 'Todas' },
  { value: 'estagio', label: 'Estágio / Trainee' },
  { value: 'junior', label: 'Júnior / Entrada' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'especialista', label: 'Especialista / Lead' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, popularStacks }) => {
  // Estado único compartilhado: quando Área ou Habilidades expande, os dois expandem juntos!
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

  const handleSelectSeniority = (level: 'todos' | SeniorityLevel) => {
    setFilters(prev => {
      // Se o usuário clicou especificamente em Sênior ou Especialista, desativa a trava que oculta Sênior/Executivo
      const shouldDisableExecLock = level === 'senior' || level === 'especialista';
      return {
        ...prev,
        seniority: level,
        hideExecutiveSenior: shouldDisableExecLock ? false : prev.hideExecutiveSenior,
      };
    });
  };

  const handleToggleExecLock = () => {
    setFilters(prev => {
      const nextLock = !prev.hideExecutiveSenior;
      // Se ativou a trava anti-sênior mas o filtro de senioridade estava em Sênior/Especialista, volta senioridade para 'todos'
      const nextSeniority =
        nextLock && (prev.seniority === 'senior' || prev.seniority === 'especialista')
          ? 'todos'
          : prev.seniority;
      return {
        ...prev,
        hideExecutiveSenior: nextLock,
        seniority: nextSeniority,
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      maxDays: 45,
      workplaceType: 'todos',
      scopeFilter: 'todas',
      seniority: 'todos',
      hideExecutiveSenior: true,
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

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Linha 1: Busca + Seletor de Local (Brasil / Internacional com Ícones) + Limpar Filtros */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Buscar cargo, empresa ou habilidade (ex: Operações, Processos, CRM, BI, Onboarding, Júnior)..."
            className="w-full pl-11 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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

        {/* Seletor de Local com Ícones (Bandeira do Brasil SVG e Globo) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, scopeFilter: 'todas' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
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
            onClick={() => setFilters(prev => ({ ...prev, scopeFilter: 'nacional' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
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
            onClick={() => setFilters(prev => ({ ...prev, scopeFilter: 'internacional' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filters.scopeFilter === 'internacional'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Internacional (100% Remoto)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpar Filtros</span>
        </button>
      </div>

      {/* Linha 2: Modalidade (Em Botões) & Senioridade (Em Botões) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-slate-800/60">
        {/* Modalidade (5 colunas) */}
        <div className="lg:col-span-5">
          <label className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            Modalidade (Remoto / Híbrido / Presencial)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1.5">
            {WORKPLACE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = filters.workplaceType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, workplaceType: opt.value }))}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 truncate ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-sm'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nível de Senioridade em Botões (7 colunas) */}
        <div className="lg:col-span-7">
          <label className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            Nível de Senioridade
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {SENIORITY_OPTIONS.map(opt => {
              const isSelected = filters.seniority === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectSeniority(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 truncate ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold shadow-sm'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Linha 3: Destaque Principal para FONTE e TEMPO DA VAGA + Menor Destaque (Discreto/Responsivo) para os 3 Toggles */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
        {/* Esquerda (MAIOR DESTAQUE): Fonte da Vaga & Tempo de Publicação */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          {/* Seletor de Fonte em Destaque */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
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
                  onClick={() => setFilters(prev => ({ ...prev, platform: opt.value }))}
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

          {/* Seletor de Tempo da Vaga em Destaque */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
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
        </div>

        {/* Direita (MENOR DESTAQUE, Discreto e Responsivo): Os 3 Toggles Auxiliares */}
        <div className="flex flex-wrap items-center gap-1.5 xl:justify-end">
          <button
            type="button"
            onClick={handleToggleExecLock}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all ${
              filters.hideExecutiveSenior
                ? 'bg-slate-800/90 text-slate-200 border-slate-700'
                : 'bg-slate-950/40 text-slate-500 border-slate-800/70 hover:text-slate-300'
            }`}
            title="Oculta cargos Sênior, Staff, Head, Director, Gerente, Supervisor e Especialista"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Ocultar Sênior/Exec</span>
            {filters.hideExecutiveSenior ? (
              <CheckSquare className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-3 h-3 text-slate-600 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, hideAffirmative: !prev.hideAffirmative }))}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all ${
              filters.hideAffirmative
                ? 'bg-slate-800/90 text-slate-200 border-slate-700'
                : 'bg-slate-950/40 text-slate-500 border-slate-800/70 hover:text-slate-300'
            }`}
            title="Oculta vagas exclusivas para ações afirmativas"
          >
            <EyeOff className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Sem Afirmativas</span>
            {filters.hideAffirmative ? (
              <CheckSquare className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-3 h-3 text-slate-600 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters(prev => ({ ...prev, onlyMuzambinhoRadiusOrRemote: !prev.onlyMuzambinhoRadiusOrRemote }))
            }
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all ${
              filters.onlyMuzambinhoRadiusOrRemote
                ? 'bg-slate-800/90 text-slate-200 border-slate-700'
                : 'bg-slate-950/40 text-slate-500 border-slate-800/70 hover:text-slate-300'
            }`}
            title="Exibe apenas vagas 100% Remotas ou presenciais/híbridas em até 150km de Muzambinho-MG"
          >
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Raio 150km / Remoto</span>
            {filters.onlyMuzambinhoRadiusOrRemote ? (
              <CheckSquare className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-3 h-3 text-slate-600 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Linha 4: Seções Recolhidas Sincronizadas (Quando uma expande, a outra expande junto!) */}
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
