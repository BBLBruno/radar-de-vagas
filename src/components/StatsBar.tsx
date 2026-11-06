import React, { useState } from 'react';
import { Globe, Zap, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { Job } from '../types';
import { BrazilFlagIcon } from './FilterBar';

interface StatsBarProps {
  totalJobs: number;
  filteredJobs: Job[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ totalJobs, filteredJobs }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const nationalCount = filteredJobs.filter(j => !j.isInternational).length;
  const intlCount = filteredJobs.filter(j => j.isInternational).length;

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Resumo do Painel</span>
          </span>
          <span className="text-slate-500">•</span>
          <span>
            <strong className="text-white">{filteredJobs.length}</strong> de {totalJobs} vagas
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <BrazilFlagIcon className="w-3.5 h-2.5" />
            <span>{nationalCount} Brasil</span>
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:flex items-center gap-1 text-slate-400">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>{intlCount} Internacionais</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[11px]">{isExpanded ? 'Recolher' : 'Expandir'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 pt-2 border-t border-slate-800/60">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {filteredJobs.length}{' '}
                <span className="text-xs font-normal text-slate-400">/ {totalJobs}</span>
              </div>
              <div className="text-xs text-slate-400">
                Vagas filtradas (BizOps, Dados, CRM & IA)
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <BrazilFlagIcon className="w-5 h-3.5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{nationalCount}</div>
              <div className="text-xs text-slate-400">
                Vagas no Brasil (Remoto, Híbrido e Presencial)
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{intlCount}</div>
              <div className="text-xs text-slate-400">
                Internacionais (100% Remotas Globais)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
