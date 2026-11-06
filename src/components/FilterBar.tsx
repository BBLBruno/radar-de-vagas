import React from 'react';
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
  Globe2,
  Building,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { ATSPlatform, FilterState, NicheCategory, SeniorityLevel, WorkplaceType } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  popularStacks: string[];
}

const DAY_OPTIONS = [
  { value: 3, label: '3 dias' },
  { value: 7, label: '7 dias' },
  { value: 14, label: '14 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: 'Todas (90d)' },
];

const CATEGORY_OPTIONS: Array<{ value: 'todas' | NicheCategory; label: string }> = [
  { value: 'todas', label: '🌐 Todas as Áreas' },
  { value: 'implantacao', label: '🚀 Implantação & Onboarding' },
  { value: 'suporte', label: '🛠️ Suporte Técnico / N2' },
  { value: 'dados_bi', label: '📊 Dados & BI (SQL / Power BI)' },
  { value: 'crm_revops', label: '📈 CRM, RevOps & Operações' },
  { value: 'automacao_ia', label: '⚡ Automação & IA (N8N)' },
  { value: 'produto', label: '🎯 Produto & Negócios' },
  { value: 'desenvolvimento', label: '💻 Desenvolvimento' },
  { value: 'qa_infra', label: '🛡️ QA, DevOps & Cloud' },
];

const WORKPLACE_OPTIONS: Array<{ value: 'todos' | WorkplaceType; label: string }> = [
  { value: 'todos', label: 'Todas Modalidades' },
  { value: 'remoto', label: '🏠 100% Remoto' },
  { value: 'hibrido', label: '🏢 Híbrido' },
  { value: 'presencial', label: '📍 Presencial' },
];

const SCOPE_OPTIONS: Array<{ value: 'todas' | 'nacional' | 'internacional'; label: string }> = [
  { value: 'todas', label: '🌎 Brasil + Internacional' },
  { value: 'nacional', label: '🇧🇷 Brasil' },
  { value: 'internacional', label: '🌐 Internacional (100% Remoto)' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, popularStacks }) => {
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
      hideExecutiveSenior: false,
      platform: 'todas',
      selectedStacks: [],
      stateFilter: '',
      hideAffirmative: false,
      onlyMuzambinhoRadiusOrRemote: false,
      selectedNicheCategory: 'todas',
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Row 1: Search Input + Scope + Reset */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Buscar cargo, empresa ou tecnologia (ex: Implantação, Suporte, SQL, N8N, Java, Analista, Júnior)..."
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

        {/* Scope Selector (Brasil / Internacional 100% Remoto) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {SCOPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilters(prev => ({ ...prev, scopeFilter: opt.value }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.scopeFilter === opt.value
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={resetFilters}
          className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Row 2: Career / Area Categories */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Área:
        </span>
        {CATEGORY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilters(prev => ({ ...prev, selectedNicheCategory: opt.value }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filters.selectedNicheCategory === opt.value
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Row 3: Workplace Type + Seniority + Platform + Days Open */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60">
        {/* Modalidade (Remoto, Híbrido, Presencial) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Building className="w-3 h-3 text-emerald-400" />
            Modalidade (Remoto / Híbrido / Presencial)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1">
            {WORKPLACE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilters(prev => ({ ...prev, workplaceType: opt.value }))}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all truncate ${
                  filters.workplaceType === opt.value
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Senioridade */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-cyan-400" />
            Nível de Senioridade
          </label>
          <select
            value={filters.seniority}
            onChange={(e) => setFilters(prev => ({ ...prev, seniority: e.target.value as 'todos' | SeniorityLevel }))}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Todas as Senioridades</option>
            <option value="estagio">🌱 Estágio / Trainee</option>
            <option value="junior">🚀 Júnior / Assistente / Entrada</option>
            <option value="pleno">⚡ Pleno / Analista</option>
            <option value="senior">🔥 Sênior</option>
            <option value="especialista">👑 Especialista / Staff / Liderança</option>
          </select>
        </div>

        {/* Fonte / Plataforma ATS */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-indigo-400" />
            Plataforma / Fonte Direta
          </label>
          <select
            value={filters.platform}
            onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value as 'todas' | ATSPlatform }))}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="todas">Todas as Fontes ({'>'}1.000 vagas)</option>
            <option value="gupy">Gupy (Portal Global Multi-Empresas)</option>
            <option value="inhire">InHire (Startups & Consultorias)</option>
            <option value="greenhouse">Greenhouse (Techs & Multinacionais)</option>
            <option value="remotive_intl">Internacional 100% Remoto (Global)</option>
            <option value="github_vagas">Comunidades Tech BR (GitHub Vagas)</option>
            <option value="empregostec">EmpregosTec Brasil</option>
            <option value="lever">Lever ATS</option>
            <option value="solides">Sólides Vagas</option>
          </select>
        </div>

        {/* Período de Abertura */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-400" />
            Data de Publicação
          </label>
          <div className="flex flex-wrap gap-1">
            {DAY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilters(prev => ({ ...prev, maxDays: opt.value }))}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all flex-1 text-center ${
                  filters.maxDays === opt.value
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950/60 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Smart Toggles (Anti-Senior/Executive Trava, Afirmativas, Raio Muzambinho) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle 1: Trava de Senioridade Executiva */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, hideExecutiveSenior: !prev.hideExecutiveSenior }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filters.hideExecutiveSenior
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Remove cargos executivos e seniores (Staff, Director, Head, Senior, Especialista, Gerente) para focar em vagas de Entrada, Júnior e Pleno"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ocultar Cargos Sênior / Executivos (Staff, Head, Director, Sr)</span>
            {filters.hideExecutiveSenior ? (
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Toggle 2: Ocultar vagas afirmativas */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, hideAffirmative: !prev.hideAffirmative }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filters.hideAffirmative
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Oculta vagas exclusivas para ações afirmativas (PCD, gênero, raça, etc.)"
          >
            <EyeOff className="w-3.5 h-3.5 text-rose-400" />
            <span>Ocultar Afirmativas</span>
            {filters.hideAffirmative ? (
              <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Toggle 3: Raio Muzambinho (150km) ou Remoto */}
          <button
            onClick={() =>
              setFilters(prev => ({ ...prev, onlyMuzambinhoRadiusOrRemote: !prev.onlyMuzambinhoRadiusOrRemote }))
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filters.onlyMuzambinhoRadiusOrRemote
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Filtra apenas vagas 100% Remotas ou em cidades num raio de 150km de Muzambinho-MG"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Apenas Remoto ou Raio 150km (Muzambinho-MG)</span>
            {filters.onlyMuzambinhoRadiusOrRemote ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Row 5: Tech & Career Skills Tags */}
      <div className="pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-slate-400">Filtro Rápido por Habilidades & Ferramentas:</span>
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
