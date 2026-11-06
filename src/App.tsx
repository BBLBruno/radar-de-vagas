import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { CopilotModal } from './components/CopilotModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { CrawlerControlModal } from './components/CrawlerControlModal';
import { Job, FilterState, CandidateProfile } from './types';
import { SEED_JOBS } from './engine/seedJobs';
import { calculateDaysOpen, TECH_STACKS_DICTIONARY } from './engine/normalizer';
import { calculateJobMatch } from './engine/matcher';
import { deduplicateJobs } from './engine/deduplicator';
import { loadStoredProfile } from './engine/defaultProfile';
import { 
  Sparkles, 
  SearchX, 
  ArrowUpDown, 
  CheckCircle,
  Bookmark
} from 'lucide-react';

const SAVED_STORAGE_KEY = 'radar_vagas_saved_jobs';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'radar' | 'profile' | 'saved' | 'crawlers'>('radar');

  // Candidate Profile
  const [profile, setProfile] = useState<CandidateProfile>(() => loadStoredProfile());

  // Jobs State
  const [jobs, setJobs] = useState<Job[]>(() => {
    // Inicializa calculando dias e deduplicando
    const initial = SEED_JOBS.map(j => ({
      ...j,
      daysOpen: calculateDaysOpen(j.publishedAt),
    }));
    return deduplicateJobs(initial);
  });

  // Saved Jobs
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filters State (Padrão: até 7 dias)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    maxDays: 7,
    workplaceType: 'todos',
    seniority: 'todos',
    platform: 'todas',
    selectedStacks: [],
    stateFilter: '',
  });

  // Sort State
  const [sortBy, setSortBy] = useState<'recent' | 'match'>('recent');

  // Modals
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [copilotJob, setCopilotJob] = useState<Job | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>('Hoje às 16:45');

  // Persist saved jobs
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedJobIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedJobIds]);

  const toggleSaveJob = (job: Job) => {
    setSavedJobIds(prev => 
      prev.includes(job.id) ? prev.filter(id => id !== job.id) : [...prev, job.id]
    );
  };

  // Enriquecer vagas com o cálculo de Match dinâmico
  const jobsWithMatch = useMemo(() => {
    return jobs.map(job => {
      const match = calculateJobMatch(job, profile);
      return {
        ...job,
        fitScore: match.score,
        matchedKeywords: match.matchedKeywords,
        missingKeywords: match.missingKeywords,
      };
    });
  }, [jobs, profile]);

  // Filtragem estrita (Brasil, dias em aberto, plataforma, modalidade, etc.)
  const filteredJobs = useMemo(() => {
    return jobsWithMatch.filter(job => {
      // 1. Controle de Dias em Aberto
      if (job.daysOpen > filters.maxDays) {
        return false;
      }

      // 2. Busca de texto
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesDesc = job.description.toLowerCase().includes(query);
        const matchesStack = job.stacks.some(s => s.toLowerCase().includes(query));

        if (!matchesTitle && !matchesCompany && !matchesDesc && !matchesStack) {
          return false;
        }
      }

      // 3. Modalidade
      if (filters.workplaceType !== 'todos' && job.workplaceType !== filters.workplaceType) {
        return false;
      }

      // 4. Senioridade
      if (filters.seniority !== 'todos' && job.seniority !== filters.seniority) {
        return false;
      }

      // 5. Plataforma
      if (filters.platform !== 'todas' && job.platform !== filters.platform) {
        return false;
      }

      // 6. Stacks selecionadas
      if (filters.selectedStacks.length > 0) {
        const hasAllStacks = filters.selectedStacks.every(s => job.stacks.includes(s));
        if (!hasAllStacks) return false;
      }

      // 7. Filtro de Estado
      if (filters.stateFilter) {
        const isRemote = job.workplaceType === 'remoto';
        const matchesState = (job.state === filters.stateFilter) || job.location.includes(filters.stateFilter);
        if (!isRemote && !matchesState) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'match') {
        return (b.fitScore || 0) - (a.fitScore || 0);
      }
      // Padrão: mais recentes primeiro (menor daysOpen)
      return a.daysOpen - b.daysOpen;
    });
  }, [jobsWithMatch, filters, sortBy]);

  // Vagas Salvas
  const savedJobs = useMemo(() => {
    return jobsWithMatch.filter(j => savedJobIds.includes(j.id));
  }, [jobsWithMatch, savedJobIds]);

  // Disparo manual de sincronização
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    // Simula coleta via API dos ATSs
    await new Promise(resolve => setTimeout(resolve, 1500));
    setJobs(prev => {
      const refreshed = prev.map(j => ({
        ...j,
        daysOpen: calculateDaysOpen(j.publishedAt),
      }));
      return deduplicateJobs(refreshed);
    });
    setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setIsSyncing(false);
  };

  const popularStacks = useMemo(() => {
    return ['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'Go', 'Java', 'AWS', 'Docker', 'PostgreSQL'];
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedJobIds.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB: RADAR DE VAGAS */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            
            {/* Stats Bar */}
            <StatsBar
              totalJobs={jobs.length}
              filteredJobs={filteredJobs}
              maxDays={filters.maxDays}
            />

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              popularStacks={popularStacks}
            />

            {/* Sub-header: Count and Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <span>Exibindo <strong>{filteredJobs.length}</strong> vagas abertas há no máximo {filters.maxDays} dias</span>
                <span className="text-xs text-slate-500">• Todas com link canônico para candidatura</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  Ordenar por:
                </span>
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    sortBy === 'recent'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mais Recentes
                </button>
                <button
                  onClick={() => setSortBy('match')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    sortBy === 'match'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Maior Compatibilidade (%)
                </button>
              </div>
            </div>

            {/* Job Cards Grid */}
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    onToggleSave={toggleSaveJob}
                    onOpenDetails={setDetailJob}
                    onOpenCopilot={setCopilotJob}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <SearchX className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nenhuma vaga encontrada</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Não encontramos vagas abertas nos últimos <strong>{filters.maxDays} dias</strong> com os filtros atuais.
                  </p>
                </div>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, maxDays: 30, searchQuery: '', selectedStacks: [] }))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all inline-flex items-center gap-1.5"
                >
                  Expandir busca para até 30 dias
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB: VAGAS SALVAS */}
        {activeTab === 'saved' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-emerald-400" />
                  Vagas Salvas para Candidatura ({savedJobs.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Acompanhe suas oportunidades selecionadas e use o Copiloto para aplicar.
                </p>
              </div>
            </div>

            {savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={true}
                    onToggleSave={toggleSaveJob}
                    onOpenDetails={setDetailJob}
                    onOpenCopilot={setCopilotJob}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Bookmark className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">Nenhuma vaga salva ainda</h3>
                <p className="text-xs text-slate-400">
                  Clique no ícone de marcador nos cards de vaga para salvá-las aqui.
                </p>
                <button
                  onClick={() => setActiveTab('radar')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all inline-block"
                >
                  Explorar Radar de Vagas
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: MEU PERFIL & COPILOTO */}
        {activeTab === 'profile' && (
          <ProfileDrawer
            profile={profile}
            setProfile={setProfile}
          />
        )}

        {/* TAB: ENGINE & ATSs */}
        {activeTab === 'crawlers' && (
          <CrawlerControlModal
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
          />
        )}

      </main>

      {/* Modals */}
      <JobDetailModal
        job={detailJob}
        onClose={() => setDetailJob(null)}
        onOpenCopilot={(j) => {
          setDetailJob(null);
          setCopilotJob(j);
        }}
      />

      <CopilotModal
        job={copilotJob}
        profile={profile}
        onClose={() => setCopilotJob(null)}
        onOpenProfile={() => {
          setCopilotJob(null);
          setActiveTab('profile');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p>
            <strong>Radar Vagas TI</strong> • Criado com base no sucesso de <a href="https://radar-concursos-ti.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Radar Concursos TI</a>
          </p>
          <p>Links canônicos diretos para ATSs (Gupy, Lever, Greenhouse, InHire). Dados estruturados sem intermediários.</p>
        </div>
      </footer>

    </div>
  );
};
