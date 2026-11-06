import React, { useState } from 'react';
import {
  Search,
  X,
  Filter,
  Sparkles,
  MapPin,
  EyeOff,
  CheckSquare,
  Square,
  Layers,
  Globe,
  Building2,
  ShieldCheck,
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
} from 'lucide-react';
import { ATSPlatform, FilterState, NicheCategory, SeniorityLevel, WorkplaceType } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  popularStacks: string[];
}

// Ícone SVG da Bandeira do Brasil (substituindo emoji)
export const BrazilFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} rounded-[2px] shrink-0`}>
    <rect width="24" height="16" rx="2" fill="#009B3A" />
    <path d="M12 2L21.5 8L12 14L2.5 8L12 2Z" fill="#FEDF00" />
    <circle cx="12" cy="8" r="3.6" fill="#002776" />
    <path d="M8.6 7.2C10.5 6.4 13.5 6.8 15.4 8.2" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" />
  </svg>
);

const DAY_OPTIONS = [
  { value: 3, label: '3d' },
  { value: 7, label: '7d' },
  { value: 14, label: '14d' },
  { value: 30, label: '30d' },
  { value: 45, label: 'Todas' },
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
  // Estados de recolhimento (fechados por padrão como solicitado)
  const [isAreaExpanded, setIsAreaExpanded] = useState(false);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);

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

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      maxDays: 30,
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
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Seletor de Local com Ícones (Bandeira do Brasil SVG e Globo Lucide) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
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
                  onClick={() => setFilters(prev => ({ ...prev, seniority: opt.value }))}
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

      {/* Linha 3: Toggles Principais + Plataforma e Data com Menos Destaque */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
        {/* Toggles de Triagem */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, hideExecutiveSenior: !prev.hideExecutiveSenior }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filters.hideExecutiveSenior
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Remove cargos executivos e seniores (Staff, Director, Head, Senior, Especialista, Gerente)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ocultar Cargos Sênior / Executivos</span>
            {filters.hideExecutiveSenior ? (
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => setFilters(prev => ({ ...prev, hideAffirmative: !prev.hideAffirmative }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filters.hideAffirmative
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Ocultar Afirmativas</span>
            {filters.hideAffirmative ? (
              <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() =>
              setFilters(prev => ({ ...prev, onlyMuzambinhoRadiusOrRemote: !prev.onlyMuzambinhoRadiusOrRemote }))
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filters.onlyMuzambinhoRadiusOrRemote
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Apenas Remoto ou Raio 150km (Muzambinho)</span>
            {filters.onlyMuzambinhoRadiusOrRemote ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Controles Secundários Discretos: Fonte Direta & Data de Publicação */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 bg-slate-950/50 border border-slate-800/80 rounded-lg px-2.5 py-1">
            <Database className="w-3 h-3 text-slate-500" />
            <span className="text-[11px] text-slate-500">Fonte:</span>
            <select
              value={filters.platform}
              onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value as 'todas' | ATSPlatform }))}
              className="bg-transparent text-[11px] font-medium text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="todas" className="bg-slate-900">Todas</option>
              <option value="gupy" className="bg-slate-900">Gupy</option>
              <option value="remotive_intl" className="bg-slate-900">Internacional</option>
              <option value="greenhouse" className="bg-slate-900">Greenhouse</option>
              <option value="inhire" className="bg-slate-900">InHire</option>
              <option value="empregostec" className="bg-slate-900">EmpregosTec</option>
              <option value="lever" className="bg-slate-900">Lever</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/50 border border-slate-800/80 rounded-lg px-2 py-1">
            <Clock className="w-3 h-3 text-slate-500 mr-0.5" />
            {DAY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilters(prev => ({ ...prev, maxDays: opt.value }))}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                  filters.maxDays === opt.value
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Linha 4: Seções Recolhidas (Área de Atuação & Filtro Rápido por Habilidades/Ferramentas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/60">
        {/* Botão Recolhido 1: Área de Atuação */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsAreaExpanded(prev => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Filtro por Área:</span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[11px] truncate">
                {selectedAreaLabel}
              </span>
            </div>
            {isAreaExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {isAreaExpanded && (
            <div className="p-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5 bg-slate-950/80">
              {CATEGORY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = filters.selectedNicheCategory === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilters(prev => ({ ...prev, selectedNicheCategory: opt.value }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Botão Recolhido 2: Filtro Rápido por Habilidades & Ferramentas */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsSkillsExpanded(prev => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Filtro Rápido por Habilidades & Ferramentas</span>
              {filters.selectedStacks.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                  {filters.selectedStacks.length} selecionada(s)
                </span>
              )}
            </div>
            {isSkillsExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>

          {isSkillsExpanded && (
            <div className="p-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5 bg-slate-950/80">
              {popularStacks.map(stack => {
                const isSelected = filters.selectedStacks.includes(stack);
                return (
                  <button
                    key={stack}
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
