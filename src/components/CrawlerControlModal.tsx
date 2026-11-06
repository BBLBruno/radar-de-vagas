import React from 'react';
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  Database,
  Globe2,
} from 'lucide-react';
import { Job } from '../types';

interface CrawlerControlModalProps {
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string | null;
  jobs: Job[];
}

export const CrawlerControlModal: React.FC<CrawlerControlModalProps> = ({
  onTriggerSync,
  isSyncing,
  lastSyncTime,
  jobs,
}) => {
  const countByPlatform = (platforms: string[]) =>
    jobs.filter(j => platforms.includes(j.platform)).length;

  const globalAggregators = [
    {
      id: 'agg_intl_remote',
      name: '7 Motores Internacionais 100% Remotos (The Muse, Remotive, Jobicy, Himalayas, Working Nomads, WeWorkRemotely & Global Greenhouse)',
      badge: 'GLOBAL 100% REMOTO',
      description:
        'Varredura internacional focada em Business Operations (BizOps), Market/Sales Intelligence, Revenue Operations (RevOps), CRM, Onboarding/CS, Data/BI e Automation em empresas remote-first globais (HubSpot, Zapier, GitLab, Remote.com, ClickUp, Airtable, Notion, Miro, Klaviyo, etc.).',
      jobsCount: countByPlatform(['remotive_intl']),
      status: 'Ativo • 7 Fontes Globais',
    },
    {
      id: 'agg_gupy_global',
      name: 'Gupy Global Discovery (Brasil Multi-Empresas)',
      badge: 'BRASIL • GUPY',
      description:
        'Busca nacional aberta para Analista de Operações Júnior/Pleno, Analista de Processos, Inteligência de Mercado, Inteligência Comercial, Analista de Negócios, CRM, Implantação/Onboarding, Dados/BI e Automação (N8N).',
      jobsCount: countByPlatform(['gupy']),
      status: 'Ativo • Nacional',
    },
    {
      id: 'agg_greenhouse_lever_br',
      name: 'Greenhouse, Lever, InHire & EmpregosTec Brasil',
      badge: 'BRASIL • ATSs DIRETOS',
      description:
        'Coleta direta sem intermediários nos portais de carreira no Brasil, com bloqueio automático de vagas de Suporte Técnico, Help Desk, Infraestrutura e Desenvolvimento puro.',
      jobsCount: countByPlatform(['greenhouse', 'lever', 'inhire', 'empregostec', 'solides']),
      status: 'Ativo • Link Canônico',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Fontes de Coleta (Brasil & Internacional 100% Remoto)
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            Foco 100% em BizOps, Processos, Inteligência Comercial/Mercado, CRM/RevOps, Onboarding, Dados/BI e Automação.
            {lastSyncTime && <span> • {lastSyncTime}</span>}
          </p>
        </div>

        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 transition-all flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando...' : 'Atualizar Lista'}</span>
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          Motores Ativos ({jobs.length} vagas qualificadas • 0% ruído de Suporte/Dev)
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {globalAggregators.map(agg => (
            <div
              key={agg.id}
              className="p-5 rounded-2xl bg-slate-900/75 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-white">{agg.name}</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md">
                    {agg.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                  {agg.description}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {agg.jobsCount}
                  </span>
                  <span className="text-xs text-slate-400 block">vagas ativas</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {agg.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
