import React from 'react';
import { Globe, BarChart2 } from 'lucide-react';
import { Job } from '../types';
import { BrazilFlagIcon } from './FilterBar';

interface StatsBarProps {
  totalJobs: number;
  filteredJobs: Job[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ totalJobs, filteredJobs }) => {
  const nationalCount = filteredJobs.filter(j => !j.isInternational).length;
  const intlCount = filteredJobs.filter(j => j.isInternational).length;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-300">
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Resumo do Painel</span>
        </span>
        <span className="text-slate-600">•</span>
        <span>
          <strong className="text-white font-bold">{filteredJobs.length}</strong> de {totalJobs} vagas
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <BrazilFlagIcon className="w-3.5 h-2.5" />
          <span>
            <strong className="text-white">{nationalCount}</strong> Brasil
          </span>
        </span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span>
            <strong className="text-white">{intlCount}</strong> Internacionais
          </span>
        </span>
      </div>
    </div>
  );
};
