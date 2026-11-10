import React, { useState, useRef, useEffect } from 'react';
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
  Home,
  Banknote,
  CheckCircle2,
  Link2,
  Eye,
  Pencil,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { AppliedJobInfo, Job } from '../types';

interface JobCardProps {
  job: Job;
  isSaved: boolean;
  appliedInfo?: AppliedJobInfo;
  showAppliedOption?: boolean;
  selectedStacks?: string[];
  onToggleStack?: (stack: string) => void;
  onToggleSave: (job: Job) => void;
  onToggleApplied?: (job: Job, trackingUrl?: string) => void;
  onUpdateTrackingUrl?: (jobId: string, trackingUrl: string) => void;
  onOpenDetails: (job: Job) => void;
  onOpenCopilot: (job: Job) => void;
}

interface JobBadgeItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  className: string;
}

interface CardBadgesRowProps {
  badges: JobBadgeItem[];
}

const CardBadgesRow: React.FC<CardBadgesRowProps> = ({ badges }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const plusMeasureRef = useRef<HTMLSpanElement | null>(null);

  const [visibleCount, setVisibleCount] = useState<number>(badges.length);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const calculateFit = () => {
    if (!containerRef.current || !measureContainerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    if (containerWidth <= 0) return;

    const gap = 6; // gap-1.5 = 6px
    const plusWidth = plusMeasureRef.current?.getBoundingClientRect().width || 34;

    const widths = badges.map((_, i) => {
      const el = badgeRefs.current[i];
      return el ? el.getBoundingClientRect().width : 70;
    });

    let totalAll = 0;
    for (let i = 0; i < widths.length; i++) {
      totalAll += widths[i] + (i > 0 ? gap : 0);
    }

    if (totalAll <= containerWidth) {
      setVisibleCount(badges.length);
      return;
    }

    let currentWidth = 0;
    let count = 0;

    for (let i = 0; i < widths.length; i++) {
      const needed = currentWidth + (i > 0 ? gap : 0) + widths[i];
      if (needed + gap + plusWidth <= containerWidth) {
        currentWidth = needed;
        count = i + 1;
      } else {
        break;
      }
    }

    setVisibleCount(Math.max(1, count));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    calculateFit();

    const observer = new ResizeObserver(() => {
      calculateFit();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [badges]);

  useEffect(() => {
    if (!showTooltip) return;
    const handleOutside = () => setShowTooltip(false);
    window.addEventListener('pointerdown', handleOutside);
    window.addEventListener('click', handleOutside);
    return () => {
      window.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('click', handleOutside);
    };
  }, [showTooltip]);

  const visibleBadges = badges.slice(0, visibleCount);
  const remainingBadges = badges.slice(visibleCount);

  return (
    <div ref={containerRef} className="flex items-center gap-1.5 flex-1 min-w-0 relative">
      {/* Invisível apenas para medição precisa de larguras */}
      <div
        ref={measureContainerRef}
        aria-hidden="true"
        className="absolute top-0 left-0 opacity-0 pointer-events-none -z-50 flex items-center gap-1.5 whitespace-nowrap invisible"
      >
        {badges.map((b, i) => (
          <span
            key={b.id}
            ref={el => {
              badgeRefs.current[i] = el;
            }}
            className={`px-2 py-1 text-[11px] rounded-lg border flex items-center gap-1 whitespace-nowrap shrink-0 ${b.className}`}
          >
            {b.icon}
            <span>{b.label}</span>
          </span>
        ))}
        <span
          ref={plusMeasureRef}
          className="px-2 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-0.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
          <span>+9</span>
        </span>
      </div>

      {/* Badges Visíveis */}
      {visibleBadges.map(badge => (
        <span
          key={badge.id}
          className={`px-2 py-1 text-[11px] rounded-lg border flex items-center gap-1 whitespace-nowrap shrink-0 ${badge.className}`}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </span>
      ))}

      {/* Botão de + com Tooltip para as tags restantes */}
      {remainingBadges.length > 0 && (
        <div
          className="relative shrink-0"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(prev => !prev);
            }}
            className="px-2 py-1 text-[11px] font-bold rounded-lg border bg-slate-800/90 text-slate-200 border-slate-700/80 hover:bg-slate-700 hover:text-white hover:border-slate-600 flex items-center gap-0.5 whitespace-nowrap shrink-0 transition-all shadow-sm cursor-pointer"
            title="Ver tags restantes"
          >
            <Plus className="w-3 h-3 text-emerald-400 stroke-[3]" />
            <span>{remainingBadges.length}</span>
          </button>

          {showTooltip && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute top-full mt-2 z-40 bg-slate-950/95 border border-slate-700/90 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[170px] max-w-[280px] flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150 ${
                visibleCount <= 1 ? 'left-0' : 'right-0'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800">
                <span>Tags adicionais</span>
                <span className="text-[10px] font-semibold text-emerald-400">+{remainingBadges.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {remainingBadges.map(b => (
                  <span
                    key={b.id}
                    className={`px-2 py-1 text-[11px] rounded-lg border flex items-center gap-1 whitespace-nowrap ${b.className}`}
                  >
                    {b.icon}
                    <span>{b.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
    label: 'Global',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  },
};

const SENIORITY_LABELS: Record<string, { label: string; className: string }> = {
  estagio: { label: 'Estágio', className: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  junior: { label: 'Júnior', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  pleno: { label: 'Pleno', className: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  senior: { label: 'Sênior', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  especialista: { label: 'Especialista', className: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  appliedInfo,
  showAppliedOption = false,
  selectedStacks = [],
  onToggleStack,
  onToggleSave,
  onToggleApplied,
  onUpdateTrackingUrl,
  onOpenDetails,
  onOpenCopilot,
}) => {
  const isApplied = Boolean(appliedInfo);
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState(appliedInfo?.trackingUrl || '');

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
    job.daysOpen === 0 ? 'Hoje' : job.daysOpen === 1 ? 'Há 1d' : `Há ${job.daysOpen}d`;

  const cleanLocation = job.location.replace(/^🌎\s*/, '');

  const handleSaveTrackingLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateTrackingUrl) return;
    const raw = linkDraft.trim();
    const formatted = raw && !raw.startsWith('http') ? `https://${raw}` : raw;
    onUpdateTrackingUrl(job.id, formatted);
    setIsEditingLink(false);
  };

  const topBadges: JobBadgeItem[] = [];

  if (job.isInternational) {
    topBadges.push({
      id: 'workplace_intl',
      label: 'Intl • Remoto',
      icon: <Globe className="w-3 h-3" />,
      className: 'bg-teal-500/15 text-teal-300 border-teal-500/30 font-semibold',
    });
  } else if (job.workplaceType === 'remoto') {
    topBadges.push({
      id: 'workplace_remoto',
      label: '100% Remoto',
      icon: <Home className="w-3 h-3" />,
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold',
    });
  } else if (job.workplaceType === 'hibrido') {
    topBadges.push({
      id: 'workplace_hibrido',
      label: 'Híbrido',
      icon: <Building2 className="w-3 h-3" />,
      className: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 font-medium',
    });
  } else {
    topBadges.push({
      id: 'workplace_presencial',
      label: 'Presencial',
      icon: <MapPin className="w-3 h-3" />,
      className: 'bg-amber-500/10 text-amber-300 border-amber-500/20 font-medium',
    });
  }

  topBadges.push({
    id: `seniority_${job.seniority}`,
    label: seniorityBadge.label,
    icon: <Briefcase className="w-3 h-3" />,
    className: `${seniorityBadge.className} font-semibold`,
  });

  topBadges.push({
    id: `freshness_${job.daysOpen}`,
    label: daysLabel,
    icon: <Clock className="w-3 h-3" />,
    className: `${freshnessColor} font-medium`,
  });

  topBadges.push({
    id: `platform_${job.platform}`,
    label: platform.label,
    className: `${platform.badgeClass} font-medium`,
  });

  if (job.isAffirmative) {
    topBadges.push({
      id: 'affirmative',
      label: 'Afirmativa',
      icon: <ShieldAlert className="w-3 h-3" />,
      className: 'bg-purple-500/15 text-purple-300 border-purple-500/30 font-semibold',
    });
  }

  return (
    <div
      className={`h-full bg-slate-900/70 border rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/40 flex flex-col justify-between group ${
        isApplied
          ? 'border-emerald-500/40 bg-slate-900/90'
          : 'border-slate-800 hover:border-slate-700/80'
      }`}
    >
      <div>
        {/* Linha 1: Badges inteligentes com símbolo + e tooltip antes de cortar + Botão de Salvar */}
        <div className="flex items-center justify-between gap-2 h-9 mb-3.5">
          <CardBadgesRow badges={topBadges} />

          {/* Botão de Salvar Vaga Aumentado e Alinhado com as Tags */}
          <button
            type="button"
            onClick={() => onToggleSave(job)}
            title={isSaved ? 'Remover de Minhas Vagas' : 'Salvar em Minhas Vagas'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
              isSaved
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm'
                : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-slate-800'
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Bloco do Título com altura fixa + espaço garantido de ~1 linha (mb-5) antes da Empresa/Localidade */}
        <div className="h-[3.25rem] mb-5 flex items-start">
          <h3
            onClick={() => onOpenDetails(job)}
            className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
            title={job.title}
          >
            {job.title}
          </h3>
        </div>

        {/* Empresa & Localidade (Sempre alinhado na mesma altura em todos os cards) */}
        <div className="flex items-center gap-3 text-xs text-slate-400 h-5 mb-3 truncate">
          <span className="flex items-center gap-1.5 font-medium text-slate-200 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.company}</span>
          </span>
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{cleanLocation}</span>
          </span>
        </div>

        {/* Faixa Salarial + Indicador de Compatibilidade (Sempre na mesma linha horizontal) */}
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

        {/* Chips de Habilidades / Área (Altura fixa padronizada) */}
        <div className="flex flex-wrap gap-1.5 mb-4 h-7 overflow-hidden">
          {job.stacks.slice(0, 3).map(stack => {
            const isSelectedFilter = selectedStacks.includes(stack);
            const isMatched = job.matchedKeywords?.includes(stack);
            return (
              <button
                key={stack}
                type="button"
                onClick={() => onToggleStack && onToggleStack(stack)}
                title={`Filtrar por ${stack}`}
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all truncate max-w-[160px] ${
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
          {job.stacks.length > 3 && (
            <span
              title={`Mais competências: ${job.stacks.slice(3).join(', ')}`}
              className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-800/80 border border-slate-700/60 self-center hover:bg-slate-700 hover:text-white transition-colors cursor-help"
            >
              +{job.stacks.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Rodapé do Card: Muda se "Já me candidatei" estiver marcado */}
      <div className="pt-3 border-t border-slate-800/70">
        {isApplied ? (
          <div className="space-y-2.5 bg-emerald-500/5 border border-emerald-500/25 rounded-xl p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Já me candidatei</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDetails(job)}
                  className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1"
                  title="Ver detalhes da vaga"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detalhes</span>
                </button>
                {onToggleApplied && (
                  <button
                    type="button"
                    onClick={() => onToggleApplied(job)}
                    className="text-[11px] font-medium text-slate-500 hover:text-rose-400 transition-colors"
                    title="Desmarcar candidatura"
                  >
                    Desmarcar
                  </button>
                )}
              </div>
            </div>

            {/* Link para acompanhar candidatura (se houver) */}
            {!isEditingLink && appliedInfo?.trackingUrl ? (
              <div className="flex items-center gap-2">
                <a
                  href={appliedInfo.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Acompanhar Candidatura</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setLinkDraft(appliedInfo.trackingUrl || '');
                    setIsEditingLink(true);
                  }}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  title="Editar link de acompanhamento"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : isEditingLink ? (
              <form onSubmit={handleSaveTrackingLink} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={linkDraft}
                  onChange={(e) => setLinkDraft(e.target.value)}
                  placeholder="Cole o link para acompanhar a candidatura..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  title="Salvar link"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingLink(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLinkDraft(job.canonicalUrl || '');
                    setIsEditingLink(true);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ Adicionar link para acompanhar candidatura</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Linha 1: Proporção 62% Candidatar-se / 38% Copiloto */}
            <div className="flex items-center gap-2.5">
              <a
                href={job.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[62%] px-3.5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 truncate"
              >
                <span className="truncate">Candidatar-se</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>

              <button
                type="button"
                onClick={() => onOpenCopilot(job)}
                className="w-[38%] px-3 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-1.5 truncate"
                title="Abrir Copiloto com respostas e carta prontas"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Copiloto</span>
              </button>
            </div>

            {/* Linha 2: Embaixo -> Mais detalhes da vaga um pouco mais grosso */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenDetails(job)}
                className="flex-1 py-2.5 px-3.5 rounded-xl text-xs sm:text-[13px] font-semibold text-slate-200 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 transition-all text-center"
              >
                Mais detalhes da vaga
              </button>

              {showAppliedOption && onToggleApplied && (
                <button
                  type="button"
                  onClick={() => onToggleApplied(job)}
                  className="py-2.5 px-3 rounded-xl text-xs sm:text-[13px] font-semibold text-emerald-400 hover:text-slate-950 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  title="Marcar que já se candidatou nesta vaga"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Já me candidatei</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
