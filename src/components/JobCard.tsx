import React from 'react';
import {
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Globe2,
} from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  onToggleSave: (job: Job) => void;
  onOpenDetails: (job: Job) => void;
  onOpenCopilot: (job: Job) => void;
}

const PLATFORM_LABELS: Record<string, string> = {
  gupy: 'Gupy',
  inhire: 'InHire',
  empregostec: 'EmpregosTec',
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  solides: 'Sólides',
  github_vagas: 'Comunidade BR',
  remotive_intl: 'Portal Global',
};

const SENIORITY_BADGE: Record<string, { label: string; style: string }> = {
  estagio: { label: 'Estágio / Trainee', style: 'bg-teal-500/15 text-teal-300 border-teal-500/25' },
  junior: { label: 'Júnior', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  pleno: { label: 'Pleno', style: 'bg-sky-500/15 text-sky-300 border-sky-500/25' },
  senior: { label: 'Sênior', style: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  especialista: { label: 'Liderança / Esp.', style: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  onToggleSave,
  onOpenDetails,
  onOpenCopilot,
}) => {
  const platformName = PLATFORM_LABELS[job.platform] || job.platform;
  const seniority = SENIORITY_BADGE[job.seniority] || {
    label: job.seniority,
    style: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const daysLabel =
    job.daysOpen === 0 ? 'Hoje' : job.daysOpen === 1 ? 'Ontem' : `Há ${job.daysOpen}d`;

  return (
    <div className="bg-slate-900/65 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/50 flex flex-col justify-between group">
      <div>
        {/* Header Limpo: Modalidade + Senioridade à esquerda | Tempo + Salvar à direita */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {job.isInternational ? (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/25 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5" />
                Remoto Internacional
              </span>
            ) : job.workplaceType === 'remoto' ? (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                🏠 Remoto
              </span>
            ) : job.workplaceType === 'hibrido' ? (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                🏢 Híbrido
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25">
                📍 Presencial
              </span>
            )}

            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${seniority.style}`}>
              {seniority.label}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium">{daysLabel}</span>
            <button
              onClick={() => onToggleSave(job)}
              title={isSaved ? 'Remover dos salvos' : 'Salvar vaga'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Título da Vaga */}
        <h3
          onClick={() => onOpenDetails(job)}
          className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
        >
          {job.title}
        </h3>

        {/* Empresa e Localização */}
        <div className="space-y-1 text-sm text-slate-300 mb-4">
          <div className="flex items-center gap-2 font-medium text-slate-200">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              {job.location.replace('🌎 Remoto Internacional ', '')} • {platformName}
            </span>
          </div>
        </div>

        {/* Até 3 Chips de Habilidades Limpos */}
        {job.stacks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {job.stacks.slice(0, 3).map(stack => (
              <span
                key={stack}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/70 text-slate-300 border border-slate-700/50"
              >
                {stack}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé Enxuto */}
      <div className="pt-4 border-t border-slate-800/70 flex items-center gap-2.5">
        <a
          href={job.canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Abrir Vaga</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={() => onOpenCopilot(job)}
          className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/70 transition-all flex items-center justify-center gap-1.5"
          title="Gerar Pitch com Copiloto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Copiloto</span>
        </button>
      </div>
    </div>
  );
};
