import React from 'react';
import { Clock, Globe2, ShieldCheck, Zap } from 'lucide-react';
import { Job } from '../types';

interface StatsBarProps {
  totalJobs: number;
  filteredJobs: Job[];
  maxDays: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ totalJobs, filteredJobs, maxDays }) => {
  const remoteCount = filteredJobs.filter(j => j.workplaceType === 'remoto').length;
  const remotePercent = filteredJobs.length > 0 
    ? Math.round((remoteCount / filteredJobs.length) * 100) 
    : 0;

  const avgDaysOpen = filteredJobs.length > 0 
    ? (filteredJobs.reduce((acc, curr) => acc + curr.daysOpen, 0) / filteredJobs.length).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6">
      
      {/* Vagas Ativas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {filteredJobs.length}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Vagas ativas (≤ {maxDays} {maxDays === 1 ? 'dia' : 'dias'})
          </div>
        </div>
      </div>

      {/* Vagas Remotas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
          <Globe2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {remoteCount} <span className="text-xs font-normal text-cyan-400">({remotePercent}%)</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Vagas 100% Remotas
          </div>
        </div>
      </div>

      {/* Frescor Médio */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-slate-700 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {avgDaysOpen} <span className="text-xs font-normal text-slate-400">dias</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Média de publicação
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
            Links canônicos diretos
          </div>
        </div>
      </div>

    </div>
  );
};
