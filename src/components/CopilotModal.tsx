import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle 
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
  if (!job) return null;

  const kit: CopilotKit = generateCopilotKit(job, profile);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Copiloto de Candidatura
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                  Semi-automático
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Respostas e pitch prontos para colar na página oficial da <strong className="text-slate-200">{job.company}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Target Job Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400">Vaga selecionada:</span>
              <div className="text-sm font-bold text-white">{job.title}</div>
              <div className="text-xs text-emerald-400">{job.company} • {job.location} ({job.platform.toUpperCase()})</div>
            </div>

            <a
              href={job.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5"
            >
              <span>Abrir Formulário no ATS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 1. Tailored Pitch / Carta de Apresentação */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-emerald-400" />
                1. Carta de Apresentação / Pitch Personalizado
              </label>
              <button
                onClick={() => copyToClipboard(kit.tailoredPitch, 'pitch')}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center gap-1 transition-all"
              >
                {copiedField === 'pitch' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Pitch</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              rows={6}
              value={kit.tailoredPitch}
              className="w-full p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 font-mono leading-relaxed focus:outline-none"
            />
          </div>

          {/* 2. Screening Questions & Answers */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              2. Respostas Prontas para o Formulário de Triagem
            </label>

            <div className="space-y-2.5">
              {kit.screeningAnswers.map((item, index) => {
                const fieldId = `question_${index}`;
                return (
                  <div key={index} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-slate-300">
                        {item.question}
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.suggestedAnswer, fieldId)}
                        className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 flex items-center gap-1"
                      >
                        {copiedField === fieldId ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-emerald-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                      {item.suggestedAnswer}
                    </div>

                    <div className="text-[11px] text-slate-500 italic">
                      💡 {item.tip}
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
              Palavras-chave recomendadas para o seu currículo nesta vaga
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
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors underline"
          >
            Editar dados do meu perfil / currículo
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <a
              href={job.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
            >
              <span>Ir para a Inscrição ↗</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
