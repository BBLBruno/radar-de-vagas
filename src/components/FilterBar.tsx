import React from 'react';
import {
  Search,
  X,
  MapPin,
  EyeOff,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { ATSPlatform, FilterState, NicheCategory, SeniorityLevel, WorkplaceType } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const CATEGORY_OPTIONS: Array<{ value: 'todas' | NicheCategory; label: string }> = [
  { value: 'todas', label: 'Todas as Áreas' },
  { value: 'bizops_processos', label: 'Operações & Processos (BizOps)' },
  { value: 'inteligencia_mercado', label: 'Inteligência de Mercado & Comercial' },
  { value: 'crm_revops_onboarding', label: 'CRM, RevOps & Onboarding' },
  { value: 'dados_bi', label: 'Dados & BI (SQL / Power BI)' },
  { value: 'automacao_ia', label: 'Automação & IA (N8N)' },
];

const SCOPE_OPTIONS: Array<{ value: 'todas' | 'nacional' | 'internacional'; label: string }> = [
  { value: 'todas', label: 'Todas' },
  { value: 'nacional', label: '🇧🇷 Brasil' },
  { value: 'internacional', label: '🌎 Internacional' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
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

  return (
    <div className="bg-slate-900/75 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Linha 1: Busca Principal + Escopo (Brasil / Internacional) + Limpar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Buscar por cargo, empresa ou palavra-chave (ex: Operações, Processos, CRM, BI, Onboarding)..."
            className="w-full pl-12 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Seletor de Escopo Limpo */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
          {SCOPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilters(prev => ({ ...prev, scopeFilter: opt.value }))}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filters.scopeFilter === opt.value
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={resetFilters}
          title="Restaurar filtros padrão"
          className="px-4 py-3 rounded-xl text-xs sm:text-sm font-medium bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Limpar</span>
        </button>
      </div>

      {/* Linha 2: Categorias de Área (Apenas as 6 áreas de Negócios, Operações, Inteligência, CRM, Dados e Automação) */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_OPTIONS.map(opt => {
          const active = filters.selectedNicheCategory === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilters(prev => ({ ...prev, selectedNicheCategory: opt.value }))}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                active
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                  : 'bg-slate-950/60 text-slate-300 border border-slate-800/80 hover:border-slate-700 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Linha 3: Seletores Enxutos (Modalidade, Senioridade, Fonte, Data) + Toggles Inteligentes */}
      <div className="pt-4 border-t border-slate-800/70 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Dropdowns Compactos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
          <select
            value={filters.workplaceType}
            onChange={(e) => setFilters(prev => ({ ...prev, workplaceType: e.target.value as 'todos' | WorkplaceType }))}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Modalidade: Todas</option>
            <option value="remoto">🏠 100% Remoto</option>
            <option value="hibrido">🏢 Híbrido</option>
            <option value="presencial">📍 Presencial</option>
          </select>

          <select
            value={filters.seniority}
            onChange={(e) => setFilters(prev => ({ ...prev, seniority: e.target.value as 'todos' | SeniorityLevel }))}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Senioridade: Todas</option>
            <option value="estagio">Estágio / Trainee</option>
            <option value="junior">Júnior / Assistente</option>
            <option value="pleno">Pleno / Analista</option>
            <option value="senior">Sênior</option>
            <option value="especialista">Especialista / Liderança</option>
          </select>

          <select
            value={filters.platform}
            onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value as 'todas' | ATSPlatform }))}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="todas">Fonte: Todas</option>
            <option value="gupy">Gupy Brasil</option>
            <option value="remotive_intl">Remoto Internacional</option>
            <option value="greenhouse">Greenhouse</option>
            <option value="inhire">InHire</option>
            <option value="empregostec">EmpregosTec</option>
            <option value="lever">Lever</option>
          </select>

          <select
            value={filters.maxDays}
            onChange={(e) => setFilters(prev => ({ ...prev, maxDays: Number(e.target.value) }))}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value={7}>Até 7 dias</option>
            <option value={14}>Até 14 dias</option>
            <option value={30}>Até 30 dias</option>
            <option value={45}>Todas recentes (45d)</option>
          </select>
        </div>

        {/* Toggles Rápidos Enxutos */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setFilters(prev => ({ ...prev, hideExecutiveSenior: !prev.hideExecutiveSenior }))}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
              filters.hideExecutiveSenior
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Oculta cargos Sênior, Staff, Head, Director, Gerente e Especialista"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Ocultar Sênior / Executivos</span>
          </button>

          <button
            onClick={() => setFilters(prev => ({ ...prev, hideAffirmative: !prev.hideAffirmative }))}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
              filters.hideAffirmative
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <EyeOff className="w-4 h-4 text-rose-400" />
            <span>Ocultar Afirmativas</span>
          </button>

          <button
            onClick={() =>
              setFilters(prev => ({ ...prev, onlyMuzambinhoRadiusOrRemote: !prev.onlyMuzambinhoRadiusOrRemote }))
            }
            className={`px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
              filters.onlyMuzambinhoRadiusOrRemote
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Raio 150km ou Remoto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
