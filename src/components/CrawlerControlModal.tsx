import React from 'react';
import {
  Cpu,
  RefreshCw,
  ShieldCheck,
  Globe2,
  Database,
  CheckCircle2,
  Layers,
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
      id: 'agg_gupy_global',
      name: 'Gupy Global Discovery (Qualquer Empresa no Brasil)',
      badge: 'GUPY GLOBAL',
      endpoint: 'https://portal.gupy.io/job-search/term=...',
      description:
        'Varredura aberta no buscador nacional da Gupy para qualquer empresa no Brasil (PMEs, consultorias, indústrias, varejo e startups) em modelo Remoto, Híbrido ou Presencial.',
      jobsCount: countByPlatform(['gupy']),
      status: 'Ativo • Multi-Empresas',
    },
    {
      id: 'agg_inhire_empregostec',
      name: 'InHire & EmpregosTec Brasil (Extração de Link Direto)',
      badge: 'INHIRE + EMPREGOSTEC',
      endpoint: 'https://www.empregostec.com.br/feed/ -> *.inhire.app / *.gupy.io / *.solides.jobs',
      description:
        'Consome o feed completo do EmpregosTec e portais InHire, extraindo automaticamente o link canônico direto de inscrição no ATS de cada empresa.',
      jobsCount: countByPlatform(['inhire', 'empregostec', 'solides']),
      status: 'Ativo • Link Canônico',
    },
    {
      id: 'agg_github_br',
      name: 'Comunidades Tech Brasil (GitHub Vagas)',
      badge: 'GITHUB BR',
      endpoint: 'api.github.com/repos/{backend-br,frontendbr,qa-brasil,datascience-br}/vagas',
      description:
        'Monitora vagas abertas diretamente pela comunidade brasileira de tecnologia (Júnior, Pleno, Sênior, Suporte, QA, Dados e Desenvolvimento).',
      jobsCount: countByPlatform(['github_vagas']),
      status: 'Ativo • Comunidades BR',
    },
    {
      id: 'agg_greenhouse_lever',
      name: 'Greenhouse & Lever Multi-Board Index',
      badge: 'GREENHOUSE & LEVER',
      endpoint: 'boards-api.greenhouse.io/v1/boards/*/jobs & api.lever.co/v0/postings/*',
      description:
        'Coleta direta nos endpoints JSON públicos de empresas de tecnologia e operações que operam no Brasil.',
      jobsCount: countByPlatform(['greenhouse', 'lever']),
      status: 'Ativo • API JSON',
    },
    {
      id: 'agg_intl_remote',
      name: 'Internacional 100% Remoto (Remotive, Jobicy & Arbeitnow)',
      badge: 'GLOBAL 100% REMOTO',
      endpoint: 'remotive.com/api/remote-jobs • jobicy.com/api/v2/remote-jobs • arbeitnow.com/api',
      description:
        'Agrega vagas internacionais 100% remotas em Dados, Suporte Técnico, Operações, CRM, Automação, Produto e Desenvolvimento.',
      jobsCount: countByPlatform(['remotive_intl']),
      status: 'Ativo • 100% Remoto',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Motor de Descoberta Global & Fontes de Vagas
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Busca generalizada em qualquer empresa (nacional e internacional 100% remoto), sem depender de lista fixa de empresas.
            {lastSyncTime && <span> • Última sincronização: {lastSyncTime}</span>}
          </p>
        </div>

        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/15 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Atualizando Indexadores...' : 'Recarregar Base Agora'}</span>
        </button>
      </div>

      {/* Explicação da Arquitetura */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Arquitetura de Busca Generalizada (Inspirada no Radar de Concursos):
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            <span className="font-bold text-emerald-400 block mb-1">
              1. Sem Lista Fixa de Empresas
            </span>
            Em vez de consultar apenas 3 ou 6 unicórnios, o motor varre buscadores globais de ATSs (Gupy Portal, InHire, EmpregosTec, GitHub BR e portais internacionais), descobrindo vagas de qualquer empresa automaticamente.
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            <span className="font-bold text-cyan-400 block mb-1">
              2. Presencial, Híbrido e Remoto
            </span>
            Todas as modalidades são coletadas e categorizadas. Você filtra em 1 clique por vagas Remotas, Híbridas, Presenciais, Nacionais ou Internacionais.
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
            <span className="font-bold text-amber-400 block mb-1">
              3. Filtro de Senioridade Realista
            </span>
            Classifica automaticamente vagas de Entrada (Estágio, Júnior, Assistente, Implantação, Suporte N2, Dados, Operações) e permite ocultar cargos executivos (Staff, Head, Director).
          </div>
        </div>
      </div>

      {/* Indexadores Globais Ativos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Indexadores Globais Ativos ({globalAggregators.length} Motores • {jobs.length} Vagas Reais Indexadas)
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {globalAggregators.map(agg => (
            <div
              key={agg.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white">{agg.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded">
                    {agg.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {agg.description}
                </p>
                <div className="text-[11px] text-slate-500 font-mono">
                  Endpoint: {agg.endpoint}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                <div className="text-right">
                  <span className="text-lg font-extrabold text-emerald-400">
                    {agg.jobsCount}
                  </span>
                  <span className="text-xs text-slate-400 block">vagas ativas</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
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
