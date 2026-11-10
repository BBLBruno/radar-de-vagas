import React from 'react';
import {
  Database,
  Globe,
  Building2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Job } from '../types';

interface CrawlerControlModalProps {
  jobs: Job[];
}

export const CrawlerControlModal: React.FC<CrawlerControlModalProps> = ({ jobs }) => {
  const countByPlatform = (platform: string) =>
    jobs.filter(j => j.platform === platform).length;

  const totalBr = jobs.filter(j => !j.isInternational).length;
  const totalIntl = jobs.filter(j => j.isInternational).length;

  const nationalSources = [
    {
      id: 'src_gupy',
      name: 'Gupy',
      type: 'Portal Nacional • Login Único',
      description: 'Vagas de Analista de Operações, Processos, Inteligência Comercial, CRM, Dados e Onboarding em empresas brasileiras.',
      count: countByPlatform('gupy'),
    },
    {
      id: 'src_greenhouse_br',
      name: 'Greenhouse Brasil',
      type: 'ATS Direto • Formulário Rápido',
      description: 'Aplicação direta via formulário de 1 página (Nome, E-mail, LinkedIn e Currículo PDF) sem necessidade de criar conta.',
      count: countByPlatform('greenhouse'),
    },
    {
      id: 'src_inhire',
      name: 'InHire',
      type: 'ATS Tech & Consultorias BR',
      description: 'Focado em startups, scale-ups e consultorias de negócios, operações, dados e transformação digital no Brasil.',
      count: countByPlatform('inhire'),
    },
    {
      id: 'src_lever_br',
      name: 'Lever Brasil',
      type: 'ATS Direto • Fast-Apply',
      description: 'Formulário canônico enxuto com preenchimento rápido de links profissionais, currículo PDF e carta de apresentação.',
      count: countByPlatform('lever'),
    },
    {
      id: 'src_solides',
      name: 'Sólides',
      type: 'Portal Nacional • PMEs & Scale-ups',
      description: 'Oportunidades em empresas em expansão no Brasil em gestão operacional, inteligência de dados e atendimento.',
      count: countByPlatform('solides'),
    },
    {
      id: 'src_empregostec',
      name: 'EmpregosTec',
      type: 'Agregador Tech • Vagas Diretas',
      description: 'Monitoramento contínuo de posições de tecnologia, processos de negócios e operações de produto.',
      count: countByPlatform('empregostec'),
    },
    {
      id: 'src_github_vagas',
      name: 'Comunidade BR (GitHub)',
      type: 'Open Source • Vagas Abertas',
      description: 'Bancos de vagas comunitários abertos de startups e empresas de tecnologia e automação no Brasil.',
      count: countByPlatform('github_vagas'),
    },
  ];

  const internationalSources = [
    {
      id: 'intl_greenhouse',
      name: 'Greenhouse Global Boards',
      tag: 'Fast-Apply Global',
      detail: '26 empresas remote-first globais (GitLab, HubSpot, Zapier, Remote, Deel, Twilio, etc.).',
    },
    {
      id: 'intl_themuse',
      name: 'The Muse (Flexible / Remote)',
      tag: 'Curadoria Global',
      detail: 'Operações de negócios (BizOps), Business Analytics, Project/Process Management e RevOps.',
    },
    {
      id: 'intl_remotive',
      name: 'Remotive',
      tag: '100% Remoto',
      detail: 'Vagas remotas globais em Business Operations, Data Analysis, Marketing/Sales Ops e Customer Success.',
    },
    {
      id: 'intl_jobicy',
      name: 'Jobicy Remote',
      tag: '100% Remoto',
      detail: 'Oportunidades remotas internacionais em Business, Data Science/BI, CRM e Process Automation.',
    },
    {
      id: 'intl_himalayas',
      name: 'Himalayas.app',
      tag: 'Global Remote',
      detail: 'Startups globais contratando remotamente para Operations, Strategy, Analytics e Revenue Operations.',
    },
    {
      id: 'intl_workingnomads',
      name: 'Working Nomads & WeWorkRemotely',
      tag: 'Work From Anywhere',
      detail: 'Posições 100% remotas sem restrição geográfica em gestão de processos, BI, CRM e automação.',
    },
  ];

  return (
    <section className="pt-8 mt-10 border-t border-slate-800/90 space-y-6">
      {/* Cabeçalho da Seção de Fontes (Sem botão de atualização) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
               Ecossistema de Fontes & Plataformas Monitoradas
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Visão estruturada das plataformas nacionais e internacionais integradas ao radar ({jobs.length} vagas ativas).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            {totalBr} Vagas Brasil
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            {totalIntl} Vagas Internacionais
          </span>
        </div>
      </div>

      {/* Divisão em 2 Colunas: 1. Fontes Nacionais (Brasil) | 2. Fontes Internacionais (100% Remoto) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Plataformas Nacionais */}
        <div className="bg-slate-900/70 border border-slate-800 border-t-4 border-t-emerald-500 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Fontes Nacionais (Brasil)
              </h4>
            </div>
            <span className="text-xs font-semibold text-emerald-400">
              {nationalSources.length} Plataformas Integradas • {totalBr} vagas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nationalSources.map(src => (
              <div
                key={src.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{src.name}</span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {src.count} vagas
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400/90 block mt-0.5">
                    {src.type}
                  </span>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {src.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 2: Plataformas Internacionais (100% Remoto) */}
        <div className="bg-slate-900/70 border border-slate-800 border-t-4 border-t-cyan-500 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Fontes Internacionais (100% Remoto)
              </h4>
            </div>
            <span className="text-xs font-semibold text-cyan-400">
              7 Motores Globais • {totalIntl} vagas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {internationalSources.map(intl => (
              <div
                key={intl.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between gap-1.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{intl.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded inline-block mt-1">
                    {intl.tag}
                  </span>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {intl.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
