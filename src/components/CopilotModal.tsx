import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  FileText,
  HelpCircle,
  CheckCircle2,
  Download,
  Link2,
} from 'lucide-react';
import { CandidateProfile, Job } from '../types';
import { generateCopilotKit, CopilotKit } from '../engine/copilot';

interface CopilotModalProps {
  job: Job | null;
  profile: CandidateProfile | null;
  onClose: () => void;
  onOpenProfile: () => void;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({
  job,
  profile,
  onClose,
  onOpenProfile,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!job) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [job, onClose]);

  if (!job) return null;

  const kit: CopilotKit = generateCopilotKit(job, profile);
  const isProfileIncomplete = !profile?.fullName?.trim();

  const copyToClipboard = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch((err) => {
        console.warn('Falha ao copiar:', err);
      });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-label="Copiloto de Candidatura"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full h-[88vh] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl cursor-default"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Copiloto de Candidatura
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700 rounded">
                  Padrão STAR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pitch, links rápidos e respostas de triagem prontos para <strong className="text-slate-200">{job.company}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {isProfileIncomplete && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Você está usando respostas padrão de modelo. <strong>Personalize seu Perfil</strong> para preencher com seu nome, histórico e pretensão salarial.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shrink-0 self-end sm:self-auto cursor-pointer"
              >
                Preencher Perfil
              </button>
            </div>
          )}

          {/* Target Job Summary + Quick Links Bar */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400">Candidatura para:</span>
                <div className="text-base font-bold text-white">{job.title}</div>
                <div className="text-xs text-slate-300">
                  {job.company} • {job.location.replace(/^🌎\s*/, '')} ({job.platform.toUpperCase()})
                </div>
              </div>

              <a
                href={job.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>Abrir Formulário no ATS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Barra de Cola Rápida (LinkedIn, GitHub, E-mail, PDF) */}
            {Boolean(profile?.linkedinUrl || profile?.githubUrl || profile?.email || profile?.resumePdfDataUrl) ? (
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  Cola Rápida:
                </span>

                {profile?.linkedinUrl && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(profile.linkedinUrl, 'quick_in')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === 'quick_in' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                    <span>{copiedField === 'quick_in' ? 'LinkedIn Copiado' : 'Copiar LinkedIn'}</span>
                  </button>
                )}

                {profile?.githubUrl && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(profile.githubUrl, 'quick_gh')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === 'quick_gh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                    <span>{copiedField === 'quick_gh' ? 'GitHub Copiado' : 'Copiar GitHub'}</span>
                  </button>
                )}

                {profile?.email && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(profile.email, 'quick_email')}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === 'quick_email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                    <span>{copiedField === 'quick_email' ? 'E-mail Copiado' : 'Copiar E-mail'}</span>
                  </button>
                )}

                {profile?.resumePdfDataUrl && (
                  <a
                    href={profile.resumePdfDataUrl}
                    download={profile.resumePdfName || 'Curriculo.pdf'}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Baixar Currículo PDF ({profile.resumePdfName})</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Link2 className="w-3.5 h-3.5 text-slate-500" />
                  Nenhum link salvo no seu perfil para a barra de cola rápida.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProfile();
                  }}
                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  Adicionar links no Perfil
                </button>
              </div>
            )}
          </div>

          {/* 1. Tailored Pitch / Carta de Apresentação */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-emerald-400" />
                1. Carta de Apresentação / Pitch Personalizado
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(kit.tailoredPitch, 'pitch')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                {copiedField === 'pitch' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Pitch Completo</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={kit.tailoredPitch}
              className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 leading-relaxed focus:outline-none"
            />
          </div>

          {/* 2. Screening Questions & Answers */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              2. Respostas Prontas para Perguntas de Triagem (Padrão STAR)
            </label>

            <div className="space-y-3">
              {kit.screeningAnswers.map((item, index) => {
                const fieldId = `question_${index}`;
                return (
                  <div key={index} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        {item.question}
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.suggestedAnswer, fieldId)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 flex items-center gap-1"
                      >
                        {copiedField === fieldId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-100 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                      {item.suggestedAnswer}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Dica de recrutamento: {item.tip}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. ATS Keywords Highlight */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Competências recomendadas para destacar no currículo nesta vaga
            </div>
            <div className="flex flex-wrap gap-1.5">
              {kit.atsKeywordsToHighlight.map(keyword => (
                <span
                  key={keyword}
                  className="px-2.5 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="text-xs sm:text-sm text-slate-400 hover:text-emerald-400 transition-colors underline"
          >
            Personalizar meu perfil, PDF ou links de acompanhamento
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <a
              href={job.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
            >
              <span>Ir para a Inscrição</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
