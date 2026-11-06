import React from 'react';
import { Search, X, Filter, Sparkles, MapPin, EyeOff, CheckSquare, Square, Bot } from 'lucide-react';
import { ATSPlatform, FilterState, NicheCategory, SeniorityLevel, WorkplaceType } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  popularStacks: string[];
}

const DAY_OPTIONS = [
  { value: 1, label: '24h' },
  { value: 3, label: '3 dias' },
  { value: 7, label: '7 dias (Recomendado)' },
  { value: 14, label: '14 dias' },
  { value: 30, label: '30 dias' },
];

const NICHE_OPTIONS: Array<{ value: 'todas' | NicheCategory; label: string }> = [
  { value: 'todas', label: 'Todos do Nicho' },
  { value: 'ai_ops', label: '🤖 AI Ops' },
  { value: 'revops', label: '📈 RevOps & Sales Ops' },
  { value: 'automacao', label: '⚡ N8N & Automação' },
  { value: 'produto', label: '🎯 Produto & Requisitos' },
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
      hideAffirmative: true,
      onlyMuzambinhoRadiusOrRemote: true,
      selectedNicheCategory: 'todas',
    });
  };

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
            placeholder="Buscar por N8N, RevOps, AI Ops, Product Owner, CRM, HubSpot..."
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

        <button
          onClick={resetFilters}
          className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5"
        >
          Redefinir
        </button>
      </div>

      {/* Niche Categories Pill Row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          Nicho:
        </span>
        {NICHE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilters(prev => ({ ...prev, selectedNicheCategory: opt.value }))}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filters.selectedNicheCategory === opt.value
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Primary Filter Row: Max Days & Geo Checkboxes */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        
        {/* Controle Rigoroso de Dias em Aberto */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Abertura:
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

        {/* Toggles Especiais: Ocultar Afirmativas & Raio Muzambinho */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Toggle: Ocultar vagas afirmativas */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, hideAffirmative: !prev.hideAffirmative }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filters.hideAffirmative
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Oculta vagas destinadas exclusivamente a ações afirmativas (PCD, gênero, etc)"
          >
            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Ocultar Afirmativas</span>
            {filters.hideAffirmative ? <CheckSquare className="w-3.5 h-3.5 text-rose-400" /> : <Square className="w-3.5 h-3.5" />}
          </button>

          {/* Toggle: Raio Muzambinho (150km) ou Remoto */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, onlyMuzambinhoRadiusOrRemote: !prev.onlyMuzambinhoRadiusOrRemote }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filters.onlyMuzambinhoRadiusOrRemote
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Apenas vagas 100% Remotas ou Híbridas em raio de 150km de Muzambinho (<= 2 dias)"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Remoto ou Raio Muzambinho (150km)</span>
            {filters.onlyMuzambinhoRadiusOrRemote ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Tech Stacks Tags */}
      <div className="pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-slate-400">Stacks do seu Nicho:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {popularStacks.map(stack => {
            const isSelected = filters.selectedStacks.includes(stack);
            return (
              <button
                key={stack}
                onClick={() => toggleStack(stack)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-all ${
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
