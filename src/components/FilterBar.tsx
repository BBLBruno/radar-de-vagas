import React from 'react';
import { Search, X, Filter, Sparkles } from 'lucide-react';
import { ATSPlatform, FilterState, SeniorityLevel, WorkplaceType } from '../types';
import { BRAZIL_STATES } from '../engine/normalizer';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  popularStacks: string[];
}

const DAY_OPTIONS = [
  { value: 1, label: 'Últimas 24h' },
  { value: 3, label: 'Até 3 dias' },
  { value: 7, label: 'Até 7 dias (Recomendado)' },
  { value: 14, label: 'Até 14 dias' },
  { value: 30, label: 'Até 30 dias' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, popularStacks }) => {
  const toggleStack = (stack: string) => {
    setFilters(prev => {
      const exists = prev.selectedStacks.includes(stack);
      return {
        ...prev,
        selectedStacks: exists 
          ? prev.selectedStacks.filter(s => s !== stack)
          : [...prev.selectedStacks, stack]
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      maxDays: 7,
      workplaceType: 'todos',
      seniority: 'todos',
      platform: 'todas',
      selectedStacks: [],
      stateFilter: '',
    });
  };

  const isFiltered = 
    filters.searchQuery !== '' || 
    filters.maxDays !== 7 || 
    filters.workplaceType !== 'todos' || 
    filters.seniority !== 'todos' || 
    filters.platform !== 'todas' || 
    filters.selectedStacks.length > 0 || 
    filters.stateFilter !== '';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      
      {/* Search Input & Reset */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Buscar por cargo (ex: Full Stack, Frontend), empresa (Nubank, iFood) ou stack..."
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

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Primary Filter Row: Max Days & Workplace */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
        
        {/* Controle Rigoroso de Dias em Aberto */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Dias em aberto:
          </span>
          {DAY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilters(prev => ({ ...prev, maxDays: opt.value }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filters.maxDays === opt.value
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Modalidade */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1">Modelo:</span>
          {(['todos', 'remoto', 'hibrido', 'presencial'] as Array<'todos' | WorkplaceType>).map(type => (
            <button
              key={type}
              onClick={() => setFilters(prev => ({ ...prev, workplaceType: type }))}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize font-medium transition-all ${
                filters.workplaceType === type
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              {type === 'todos' ? 'Todos' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Row: Seniority, Platform, State */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
        
        {/* Senioridade */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Senioridade</label>
          <select
            value={filters.seniority}
            onChange={(e) => setFilters(prev => ({ ...prev, seniority: e.target.value as SeniorityLevel }))}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Todas as senioridades</option>
            <option value="estagio">Estágio</option>
            <option value="junior">Júnior</option>
            <option value="pleno">Pleno</option>
            <option value="senior">Sênior</option>
            <option value="especialista">Especialista / Lead</option>
          </select>
        </div>

        {/* Plataforma de ATS */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Plataforma ATS</label>
          <select
            value={filters.platform}
            onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value as 'todas' | ATSPlatform }))}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="todas">Todos os ATSs (Gupy, Lever, etc.)</option>
            <option value="gupy">Gupy</option>
            <option value="lever">Lever</option>
            <option value="greenhouse">Greenhouse</option>
            <option value="inhire">InHire</option>
          </select>
        </div>

        {/* Estado Brasileiro */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Estado (Filtro Brasil)</label>
          <select
            value={filters.stateFilter}
            onChange={(e) => setFilters(prev => ({ ...prev, stateFilter: e.target.value }))}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todo o Brasil (inclui 100% Remotas)</option>
            {BRAZIL_STATES.map(uf => (
              <option key={uf} value={uf}>{uf} - {uf === 'SP' ? 'São Paulo' : uf === 'RJ' ? 'Rio de Janeiro' : uf === 'MG' ? 'Minas Gerais' : uf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tech Stacks Tags */}
      <div className="pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-slate-400">Filtrar por Stacks em Alta:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {popularStacks.map(stack => {
            const isSelected = filters.selectedStacks.includes(stack);
            return (
              <button
                key={stack}
                onClick={() => toggleStack(stack)}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
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
      </div>

    </div>
  );
};
