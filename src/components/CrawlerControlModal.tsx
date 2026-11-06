import React, { useState } from 'react';
import { 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  ShieldCheck, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { ScraperSourceConfig } from '../types';

interface CrawlerControlModalProps {
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

const DEFAULT_SOURCES: ScraperSourceConfig[] = [
  {
    id: 'src_gupy_nubank',
    name: 'Nubank (Gupy)',
    platform: 'gupy',
    endpoint: 'https://nubank.gupy.io/api/v1/jobs',
    companySlug: 'nubank',
    enabled: true,
    jobsFound: 14,
    lastScrapedAt: 'Hoje às 16:40',
  },
  {
    id: 'src_lever_meli',
    name: 'Mercado Livre (Lever)',
    platform: 'lever',
    endpoint: 'https://api.lever.co/v0/postings/mercadolivre?mode=json',
    companySlug: 'mercadolivre',
    enabled: true,
    jobsFound: 28,
    lastScrapedAt: 'Hoje às 16:40',
  },
  {
    id: 'src_gh_ifood',
    name: 'iFood (Greenhouse)',
    platform: 'greenhouse',
    endpoint: 'https://boards-api.greenhouse.io/v1/boards/ifood/jobs',
    companySlug: 'ifood',
    enabled: true,
    jobsFound: 19,
    lastScrapedAt: 'Hoje às 16:40',
  },
  {
    id: 'src_inhire_picpay',
    name: 'PicPay (InHire)',
    platform: 'inhire',
    endpoint: 'https://api.inhire.app/job-posts/public/picpay',
    companySlug: 'picpay',
    enabled: true,
    jobsFound: 11,
    lastScrapedAt: 'Hoje às 16:40',
  },
  {
    id: 'src_lever_quintoandar',
    name: 'QuintoAndar (Lever)',
    platform: 'lever',
    endpoint: 'https://api.lever.co/v0/postings/quintoandar?mode=json',
    companySlug: 'quintoandar',
    enabled: true,
    jobsFound: 8,
    lastScrapedAt: 'Hoje às 16:40',
  },
  {
    id: 'src_gh_wellhub',
    name: 'Wellhub (Greenhouse)',
    platform: 'greenhouse',
    endpoint: 'https://boards-api.greenhouse.io/v1/boards/wellhub/jobs',
    companySlug: 'wellhub',
    enabled: true,
    jobsFound: 15,
    lastScrapedAt: 'Hoje às 16:40',
  }
];

export const CrawlerControlModal: React.FC<CrawlerControlModalProps> = ({
  onTriggerSync,
  isSyncing,
  lastSyncTime,
}) => {
  const [sources, setSources] = useState<ScraperSourceConfig[]>(DEFAULT_SOURCES);
  const [newSlug, setNewSlug] = useState('');
  const [newPlatform, setNewPlatform] = useState<'gupy' | 'lever' | 'greenhouse'>('lever');
  const [newName, setNewName] = useState('');

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug || !newName) return;

    const endpoint = newPlatform === 'lever'
      ? `https://api.lever.co/v0/postings/${newSlug}?mode=json`
      : newPlatform === 'greenhouse'
      ? `https://boards-api.greenhouse.io/v1/boards/${newSlug}/jobs`
      : `https://${newSlug}.gupy.io/api/v1/jobs`;

    const newSource: ScraperSourceConfig = {
      id: `src_${newPlatform}_${newSlug}`,
      name: `${newName} (${newPlatform.toUpperCase()})`,
      platform: newPlatform,
      endpoint,
      companySlug: newSlug,
      enabled: true,
      jobsFound: 0,
      lastScrapedAt: 'Recém-adicionado',
    };

    setSources(prev => [newSource, ...prev]);
    setNewSlug('');
    setNewName('');
  };

  const toggleSource = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Engine de Coleta & ATSs Monitorados</h2>
          </div>
          <p className="text-xs text-slate-400">
            Monitora diretamente APIs de carreiras dos principais ATSs sem intermediários.
            {lastSyncTime && <span> • Última sincronização: {lastSyncTime}</span>}
          </p>
        </div>

        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/15 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando ATSs...' : 'Executar Sincronização Agora'}</span>
        </button>
      </div>

      {/* Explicação da Arquitetura e Anti-bloqueio */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Como Esta Arquitetura Contorna os Bloqueios do LinkedIn e Portais Fechados:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="font-bold text-emerald-400 block mb-1">1. Foco Direto nos ATSs</span>
            Em vez de raspar o LinkedIn (sujeito a Cloudflare e bans), o robô consome as APIs públicas que as empresas usam nos seus próprios portais de carreira.
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="font-bold text-cyan-400 block mb-1">2. Link Canônico Direto</span>
            A URL gerada é 100% canônica (ex: <code className="text-slate-400 font-mono">jobs.lever.co/empresa/uuid</code>), levando o candidato direto para a página de inscrição.
          </div>
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="font-bold text-amber-400 block mb-1">3. Controle de Dias em Aberto</span>
            Como o payload JSON do ATS traz a data ISO de publicação (<code className="text-slate-400 font-mono">publishedAt</code>), o filtro de 7 ou 14 dias é exato e matemático.
          </div>
        </div>
      </div>

      {/* Form para adicionar nova empresa */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="text-sm font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Adicionar Nova Empresa para Monitorar</span>
        </div>

        <form onSubmit={handleAddSource} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nome de Exibição</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Creditas"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Plataforma ATS</label>
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="lever">Lever (api.lever.co/v0/postings/slug)</option>
              <option value="greenhouse">Greenhouse (boards-api.greenhouse.io/v1/boards/slug/jobs)</option>
              <option value="gupy">Gupy (slug.gupy.io/api/v1/jobs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Slug da Empresa no ATS</label>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="Ex: creditas"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Fonte
            </button>
          </div>
        </form>
      </div>

      {/* Lista de ATSs Monitorados */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Fontes de Coleta Ativas ({sources.length})</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sources.map(src => (
            <div 
              key={src.id}
              className={`p-4 rounded-xl border transition-all ${
                src.enabled 
                  ? 'bg-slate-900/80 border-slate-800' 
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{src.name}</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-emerald-400 rounded">
                      {src.platform.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1 truncate max-w-xs">
                    {src.endpoint}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Última execução: {src.lastScrapedAt}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => toggleSource(src.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                      src.enabled
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {src.enabled ? 'Ativo' : 'Pausado'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
