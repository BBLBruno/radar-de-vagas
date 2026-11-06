import React from 'react';
import { Globe2, ShieldCheck, Zap, Building2 } from 'lucide-react';
import { Job } from '../types';

interface StatsBarProps {
  totalJobs: number;
  filteredJobs: Job[];
  maxDays: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ totalJobs, filteredJobs, maxDays }) => {
  const remoteCount = filteredJobs.filter(j => j.workplaceType === 'remoto').length;
  const hybridPresencialCount = filteredJobs.filter(j => j.workplaceType !== 'remoto').length;
  const intlCount = filteredJobs.filter(j => j.isInternational).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-4">
      {/* Vagas Exibidas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {filteredJobs.length}{' '}
            <span className="text-xs font-normal text-slate-400">/ {totalJobs}</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Vagas filtradas (≤ {maxDays}d)
          </div>
        </div>
      </div>

      {/* Vagas 100% Remotas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
          <Globe2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {remoteCount}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            100% Remotas ({intlCount} globais)
          </div>
        </div>
      </div>

      {/* Vagas Híbridas e Presenciais */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {hybridPresencialCount}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Híbridas & Presenciais (BR)
          </div>
        </div>
      </div>

      {/* Link Canônico Direto */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight">
            100%
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Links diretos sem intermediários
          </div>
        </div>
      </div>
    </div>
  );
};
