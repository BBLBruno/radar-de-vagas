import React from 'react';
import { Globe2, Zap, Building2 } from 'lucide-react';
import { Job } from '../types';

interface StatsBarProps {
  totalJobs: number;
  filteredJobs: Job[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ totalJobs, filteredJobs }) => {
  const nationalCount = filteredJobs.filter(j => !j.isInternational).length;
  const intlCount = filteredJobs.filter(j => j.isInternational).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">
            {filteredJobs.length}{' '}
            <span className="text-sm font-normal text-slate-400">de {totalJobs}</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-400">
            Vagas exibidas (BizOps, Dados, CRM & IA)
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{nationalCount}</div>
          <div className="text-xs sm:text-sm text-slate-400">
            Vagas no Brasil (Remoto, Híbrido e Presencial)
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
          <Globe2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{intlCount}</div>
          <div className="text-xs sm:text-sm text-slate-400">
            Internacionais (100% Remotas Globais)
          </div>
        </div>
      </div>
    </div>
  );
};
