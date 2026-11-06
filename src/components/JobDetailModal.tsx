import React from 'react';
import {
  X,
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
  Banknote,
  CheckCircle2,
  Briefcase,
  Globe,
  Wifi,
} from 'lucide-react';
import { Job } from '../types';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  onOpenCopilot: (job: Job) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  onOpenCopilot,
}) => {
  if (!job) return null;

  const cleanLocation = job.location.replace(/^🌎\s*/, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {job.platform.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-800 text-slate-300">
                {job.daysOpen === 0 ? 'Publicada hoje' : `Publicada há ${job.daysOpen} dias`}
              </span>
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
              ) : null}
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {job.seniority.toUpperCase()}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white leading-tight">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {cleanLocation}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Banknote className={`w-3.5 h-3.5 ${job.salary ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className={job.salary ? 'text-emerald-400' : 'text-slate-400'}>
                  {job.salary || 'Salário não informado'}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Habilidades */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Habilidades & Ferramentas Identificadas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.stacks.map(stack => (
                <span
                  key={stack}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-emerald-400 border border-slate-700"
                >
                  {stack}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Sobre a Oportunidade
            </h4>
            <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Requisitos e Qualificações
              </h4>
              <ul className="space-y-1.5">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenCopilot(job);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Abrir Copiloto de Candidatura</span>
          </button>

          <a
            href={job.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            <span>Candidatar-se Diretamente no ATS</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
