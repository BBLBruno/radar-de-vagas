import React, { useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Globe,
  Home,
  Calendar,
  Layers,
  Database,
  FileText,
  Compass,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { Job, NicheCategory } from '../types';

interface JobDetailModalProps {
  job: Job | null;
  isSaved?: boolean;
  onToggleSave?: (job: Job) => void;
  onClose: () => void;
  onOpenCopilot: (job: Job) => void;
}

const CATEGORY_NAMES: Record<NicheCategory, string> = {
  bizops_processos: 'Operações & Processos (BizOps)',
  inteligencia_mercado: 'Inteligência de Mercado & Comercial',
  crm_revops_onboarding: 'CRM, RevOps & Onboarding',
  dados_bi: 'Dados & BI (SQL / Power BI)',
  automacao_ia: 'Automação & IA (N8N)',
};

const SENIORITY_NAMES: Record<string, string> = {
  estagio: 'Estágio / Trainee',
  junior: 'Júnior / Entrada',
  pleno: 'Pleno / Analista',
  senior: 'Sênior',
  especialista: 'Especialista / Liderança',
};

const PLATFORM_APPLICATION_TIPS: Record<string, string> = {
  gupy: 'Portal Gupy: Mantenha seu currículo e perfil Gupy preenchidos e utilize as palavras-chave identificadas abaixo no campo de experiências para elevar seu posicionamento no ranking.',
  greenhouse: 'Greenhouse ATS: Formulário rápido de página única. Anexe seu currículo em PDF e cole a Carta de Apresentação gerada pelo Copiloto no campo "Cover Letter / Additional Information".',
  inhire: 'InHire ATS: Candidatura direta sem necessidade de criar conta longa. Preencha seu LinkedIn, anexe o PDF do currículo e destaque seus cases de operação e dados.',
  lever: 'Lever ATS: Página direta de aplicação. Anexe seu PDF no topo para autopreenchimento e cole o pitch do Copiloto no bloco final de comentários.',
  remotive_intl: 'Vaga Internacional 100% Remota: Verifique os requisitos de idioma (geralmente Inglês ou Espanhol) e destaque sua experiência com ferramentas globais (CRM, SQL, BI, N8N) e comunicação assíncrona.',
};

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isSaved = false,
  onToggleSave,
  onClose,
  onOpenCopilot,
}) => {
  // Permite fechar com a tecla ESC também
  useEffect(() => {
    if (!job) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job, onClose]);

  if (!job) return null;

  const cleanLocation = job.location.replace(/^🌎\s*/, '');
  const formattedDate = (() => {
    const d = new Date(job.publishedAt);
    return isNaN(d.getTime())
      ? 'Data recente'
      : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  })();

  const applicationTip =
    PLATFORM_APPLICATION_TIPS[job.platform] ||
    'Link canônico direto: Você será direcionado diretamente para o formulário oficial da empresa sem intermediários.';

  return (
    /* Clicar em qualquer lugar fora do modal fecha a visualização */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes da Vaga"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-4xl w-full h-[88vh] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl cursor-default"
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/95 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {job.isInternational ? (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Internacional • 100% Remoto
                </span>
              ) : job.workplaceType === 'remoto' ? (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  100% Remoto
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 capitalize">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.workplaceType}
                </span>
              )}

              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {SENIORITY_NAMES[job.seniority] || job.seniority}
              </span>

              <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Publicada em {formattedDate} ({job.daysOpen === 0 ? 'Hoje' : `Há ${job.daysOpen}d`})
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Building2 className="w-4 h-4 text-emerald-400" />
                {job.company}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(job)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title={isSaved ? 'Remover de Minhas Vagas' : 'Salvar em Minhas Vagas'}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSaved ? 'Salva' : 'Salvar'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title="Fechar (ou clique fora da janela)"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content (Maior espaço vertical e organização em blocos) */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* 1. Grid de Resumo Executivo da Vaga (4 Cartões de Informação) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Localização
              </span>
              <div className="text-sm font-bold text-white truncate" title={cleanLocation}>
                {cleanLocation}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                Modalidade & Escopo
              </span>
              <div className="text-sm font-bold text-white capitalize">
                {job.isInternational ? 'Remoto Global' : `${job.workplaceType} • Brasil`}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Área Principal
              </span>
              <div className="text-sm font-bold text-white truncate">
                {job.nicheCategories && job.nicheCategories.length > 0
                  ? CATEGORY_NAMES[job.nicheCategories[0]] || 'Operações & Negócios'
                  : 'Operações & Negócios'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                Fonte Direta (ATS)
              </span>
              <div className="text-sm font-bold text-white uppercase">
                {job.platform === 'remotive_intl' ? 'Portal Internacional' : job.platform}
              </div>
            </div>
          </div>

          {/* 2. Habilidades & Ferramentas Mapeadas */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Competências, Ferramentas & Palavras-Chave da Vaga
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.stacks.map(stack => {
                const isMatched = job.matchedKeywords?.includes(stack);
                return (
                  <span
                    key={stack}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                      isMatched
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{stack}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* 3. Descrição Completa da Oportunidade */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              Descrição e Detalhes da Oportunidade
            </h4>
            <div className="text-sm sm:text-base text-slate-200 leading-relaxed bg-slate-950/70 p-5 rounded-xl border border-slate-800/90 whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* 4. Requisitos e Dica de Aplicação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.requirements && job.requirements.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Requisitos & Competências Esperadas
                </h4>
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Dica Rápida para Aplicar nesta Fonte
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {applicationTip}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCopilot(job);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Preparar Candidatura com Copiloto</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <a
              href={job.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
            >
              <span>Candidatar-se Diretamente no ATS</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
