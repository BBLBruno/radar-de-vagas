import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ShieldAlert,
  Globe,
  Briefcase,
  Wifi,
  Banknote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  selectedStacks?: string[];
  onToggleStack?: (stack: string) => void;
  onToggleSave: (job: Job) => void;
  onOpenDetails: (job: Job) => void;
  onOpenCopilot: (job: Job) => void;
}

const PLATFORM_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  gupy: {
    label: 'Gupy',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  inhire: {
    label: 'InHire',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  empregostec: {
    label: 'EmpregosTec',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  greenhouse: {
    label: 'Greenhouse',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  lever: {
    label: 'Lever',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  solides: {
    label: 'Sólides',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  github_vagas: {
    label: 'Comunidade BR',
    badgeClass: 'bg-slate-700/60 text-slate-200 border-slate-600/50',
  },
  remotive_intl: {
    label: 'Remoto Global',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
};

const SENIORITY_LABELS: Record<string, { label: string; className: string }> = {
  estagio: { label: 'Estágio / Trainee', className: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  junior: { label: 'Júnior', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  pleno: { label: 'Pleno', className: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  senior: { label: 'Sênior', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  especialista: { label: 'Especialista / Lead', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  selectedStacks = [],
  onToggleStack,
  onToggleSave,
  onOpenDetails,
  onOpenCopilot,
}) => {
  const [showSummary, setShowSummary] = useState(false);

  const platform = PLATFORM_CONFIG[job.platform] || {
    label: job.platform,
    badgeClass: 'bg-slate-700 text-slate-300 border-slate-600',
  };

  const seniorityBadge = SENIORITY_LABELS[job.seniority] || {
    label: job.seniority,
    className: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const freshnessColor =
    job.daysOpen <= 2
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : job.daysOpen <= 7
      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
      : 'text-slate-300 bg-slate-800/70 border-slate-700/60';

  const daysLabel =
    job.daysOpen === 0 ? 'Hoje' : job.daysOpen === 1 ? 'Há 1 dia' : `Há ${job.daysOpen} dias`;

  const cleanLocation = job.location.replace(/^🌎\s*/, '');

  return (
    <div className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/40 flex flex-col justify-between group">
      <div>
        {/* Top Badges Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {job.isInternational ? (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Internacional • 100% Remoto
              </span>
            ) : job.workplaceType === 'remoto' ? (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                100% Remoto
              </span>
            ) : job.workplaceType === 'hibrido' ? (
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Híbrido
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Presencial
              </span>
            )}

            <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border flex items-center gap-1 ${seniorityBadge.className}`}>
              <Briefcase className="w-3 h-3" />
              {seniorityBadge.label}
            </span>

            <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border flex items-center gap-1 ${freshnessColor}`}>
              <Clock className="w-3 h-3" />
              {daysLabel}
            </span>

            <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${platform.badgeClass}`}>
              {platform.label}
            </span>

            {job.isAffirmative && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                {job.affirmativeReason || 'Afirmativa'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleSave(job)}
            title={isSaved ? 'Remover dos salvos' : 'Salvar vaga'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors shrink-0"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Title & Company */}
        <h3
          onClick={() => onOpenDetails(job)}
          className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {job.title}
        </h3>

        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mt-2 mb-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {job.company}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {cleanLocation}
          </span>
        </div>

        {/* Faixa Salarial + Indicador de Compatibilidade (Sem exibir %) */}
        <div className="mb-3 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs truncate">
            <Banknote className={`w-3.5 h-3.5 shrink-0 ${job.salary ? 'text-emerald-400' : 'text-slate-500'}`} />
            {job.salary ? (
              <span className="text-emerald-400 font-semibold truncate">{job.salary}</span>
            ) : (
              <span className="text-slate-400">Salário não informado</span>
            )}
          </div>

          {(job.fitScore || 0) >= 60 && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-cyan-300 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Alta afinidade</span>
            </div>
          )}
        </div>

        {/* Chips de Habilidades (Clicáveis para filtrar!) */}
        {job.stacks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.stacks.slice(0, 4).map(stack => {
              const isSelectedFilter = selectedStacks.includes(stack);
              const isMatched = job.matchedKeywords?.includes(stack);
              return (
                <button
                  key={stack}
                  type="button"
                  onClick={() => onToggleStack && onToggleStack(stack)}
                  title={`Filtrar por ${stack}`}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all ${
                    isSelectedFilter
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                      : isMatched
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold hover:bg-emerald-500/25'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  {stack}
                </button>
              );
            })}
            {job.stacks.length > 4 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 bg-slate-800/40">
                +{job.stacks.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Botão de Resumo Rápido Recolhido */}
        {job.description && (
          <div className="mb-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSummary(prev => !prev);
              }}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950/50 hover:bg-slate-800/70 border border-slate-800/80 text-[11px] font-medium text-slate-300 hover:text-white flex items-center justify-between transition-all cursor-pointer"
            >
              <span>{showSummary ? 'Ocultar resumo rápido da vaga' : 'Ver resumo rápido da vaga'}</span>
              {showSummary ? (
                <ChevronUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </button>
            {showSummary && (
              <div className="mt-2 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                <p>{job.description}</p>
                <button
                  type="button"
                  onClick={() => onOpenDetails(job)}
                  className="text-[11px] font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Abrir visualização completa</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800/70 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <a
          href={job.canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
        >
          <span>Candidatar-se na {platform.label}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          type="button"
          onClick={() => onOpenCopilot(job)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-1.5"
          title="Abrir Copiloto com respostas e carta prontas"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Copiloto</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetails(job)}
          className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all text-center"
        >
          Ver vaga
        </button>
      </div>
    </div>
  );
};
