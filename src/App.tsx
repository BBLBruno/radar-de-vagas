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
import {
  calculateDaysOpen,
  classifyJobCategories,
  isExecutiveOrSeniorTitle,
  detectAffirmative,
  calculateDistanceToMuzambinho,
  POPULAR_FILTER_STACKS,
} from './engine/normalizer';
import { calculateJobMatch } from './engine/matcher';
import { deduplicateJobs } from './engine/deduplicator';
import { loadStoredProfile } from './engine/defaultProfile';
import {
  Sparkles,
  SearchX,
  ArrowUpDown,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';

const SAVED_STORAGE_KEY = 'radar_vagas_saved_jobs_v3';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'radar' | 'profile' | 'saved' | 'crawlers'>('radar');

  // Candidate Profile
  const [profile, setProfile] = useState<CandidateProfile>(() => loadStoredProfile());

  // Jobs State: Carrega todas as vagas reais coletadas (Brasil + Internacional 100% Remoto, todas as empresas e modalidades)
  const [jobs, setJobs] = useState<Job[]>(() => {
    const enriched = SEED_JOBS.map(j => {
      const categories =
        j.nicheCategories && j.nicheCategories.length > 0
          ? j.nicheCategories
          : classifyJobCategories(j.title, j.description);
      const affirmative = detectAffirmative(j.title, j.description);
      const distKm = j.distanceFromMuzambinhoKm ?? calculateDistanceToMuzambinho(j.location) ?? undefined;

      return {
        ...j,
        daysOpen: calculateDaysOpen(j.publishedAt),
        isAffirmative: j.isAffirmative ?? affirmative.isAffirmative,
        affirmativeReason: j.affirmativeReason ?? affirmative.reason,
        distanceFromMuzambinhoKm: distKm,
        isWithinAllowedRadius: j.workplaceType === 'remoto' || (distKm !== undefined && distKm <= 150),
        nicheCategories: categories,
      };
    });

    return deduplicateJobs(enriched);
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

  // Filters State: Aberto para qualquer empresa e modalidade, mas com trava de cargos executivos/sênior ativada por padrão (fácil de alternar)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    maxDays: 30,
    workplaceType: 'todos',
    scopeFilter: 'todas',
    seniority: 'todos',
    hideExecutiveSenior: true, // Oculta Staff, Director, Head, Senior, Especialista no título por padrão para focar em oportunidades reais de entrada/pleno
    platform: 'todas',
    selectedStacks: [],
    stateFilter: '',
    hideAffirmative: true,
    onlyMuzambinhoRadiusOrRemote: false, // Permite ver Presencial, Híbrido e Remoto de qualquer lugar por padrão
    selectedNicheCategory: 'todas',
  });

  const [sortBy, setSortBy] = useState<'match' | 'recent'>('recent');

  // Modals
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [copilotJob, setCopilotJob] = useState<Job | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(' Sincronizado com sucesso');

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

  // Enriquecer com Match Score
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

  // Filtragem Completa
  const filteredJobs = useMemo(() => {
    return jobsWithMatch
      .filter(job => {
        // 1. Trava de Senioridade Executiva / Sênior (quando ativada)
        if (filters.hideExecutiveSenior) {
          if (job.seniority === 'senior' || job.seniority === 'especialista') {
            return false;
          }
          if (isExecutiveOrSeniorTitle(job.title)) {
            return false;
          }
        }

        // 2. Filtro de Afirmativas
        if (filters.hideAffirmative && job.isAffirmative) {
          return false;
        }

        // 3. Escopo (Brasil vs Internacional 100% Remoto)
        if (filters.scopeFilter === 'nacional' && job.isInternational) {
          return false;
        }
        if (filters.scopeFilter === 'internacional' && !job.isInternational) {
          return false;
        }

        // 4. Filtro Geográfico Opcional: Apenas Remoto ou Raio 150km de Muzambinho
        if (filters.onlyMuzambinhoRadiusOrRemote) {
          if (job.workplaceType !== 'remoto') {
            const dist = job.distanceFromMuzambinhoKm ?? 999;
            if (dist > 150) return false;
          }
        }

        // 5. Categoria / Área Profissional
        if (filters.selectedNicheCategory !== 'todas') {
          const cats = job.nicheCategories || [];
          if (!cats.includes(filters.selectedNicheCategory)) {
            return false;
          }
        }

        // 6. Dias em aberto
        if (job.daysOpen > filters.maxDays) {
          return false;
        }

        // 7. Busca textual livre (Cargo, Empresa, Descrição, Localidade ou Stack)
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase();
          const matchesTitle = job.title.toLowerCase().includes(query);
          const matchesCompany = job.company.toLowerCase().includes(query);
          const matchesDesc = job.description.toLowerCase().includes(query);
          const matchesLocation = job.location.toLowerCase().includes(query);
          const matchesStack = job.stacks.some(s => s.toLowerCase().includes(query));

          if (!matchesTitle && !matchesCompany && !matchesDesc && !matchesLocation && !matchesStack) {
            return false;
          }
        }

        // 8. Modalidade (Remoto, Híbrido, Presencial)
        if (filters.workplaceType !== 'todos' && job.workplaceType !== filters.workplaceType) {
          return false;
        }

        // 9. Senioridade específica
        if (filters.seniority !== 'todos' && job.seniority !== filters.seniority) {
          return false;
        }

        // 10. Plataforma / Fonte
        if (filters.platform !== 'todas' && job.platform !== filters.platform) {
          return false;
        }

        // 11. Stacks selecionadas
        if (filters.selectedStacks.length > 0) {
          const hasAllStacks = filters.selectedStacks.every(s =>
            job.stacks.some(js => js.toLowerCase() === s.toLowerCase()) ||
            job.title.toLowerCase().includes(s.toLowerCase()) ||
            job.description.toLowerCase().includes(s.toLowerCase())
          );
          if (!hasAllStacks) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return (b.fitScore || 0) - (a.fitScore || 0);
        }
        return a.daysOpen - b.daysOpen;
      });
  }, [jobsWithMatch, filters, sortBy]);

  const savedJobs = useMemo(() => {
    return jobsWithMatch.filter(j => savedJobIds.includes(j.id));
  }, [jobsWithMatch, savedJobIds]);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
              popularStacks={POPULAR_FILTER_STACKS}
            />

            {/* Sub-header: Count, Active Badges and Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-sm font-semibold text-slate-300 flex flex-wrap items-center gap-2">
                <span>
                  Exibindo <strong className="text-emerald-400">{filteredJobs.length}</strong> de{' '}
                  <strong>{jobs.length}</strong> vagas indexadas
                </span>
                {filters.hideExecutiveSenior && (
                  <span className="text-xs px-2.5 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Foco Entrada / Jr / Pleno (Sem Executivos/Sênior)
                  </span>
                )}
                {filters.hideAffirmative && (
                  <span className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-md">
                    Afirmativas ocultadas
                  </span>
                )}
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
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
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
                  <h3 className="text-base font-bold text-white">
                    Nenhuma vaga encontrada com os filtros atuais
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Experimente limpar os filtros ou ampliar o período de busca para visualizar todas as {jobs.length} vagas.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      maxDays: 90,
                      workplaceType: 'todos',
                      scopeFilter: 'todas',
                      seniority: 'todos',
                      hideExecutiveSenior: false,
                      platform: 'todas',
                      selectedStacks: [],
                      stateFilter: '',
                      hideAffirmative: false,
                      onlyMuzambinhoRadiusOrRemote: false,
                      selectedNicheCategory: 'todas',
                    })
                  }
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all inline-flex items-center gap-1.5"
                >
                  Mostrar todas as {jobs.length} vagas
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
                  Vagas Salvas ({savedJobs.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Acompanhe suas oportunidades selecionadas e gere pitches personalizados com o Copiloto.
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
                  Clique no ícone de marcador nos cards de vagas para salvá-las aqui.
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

        {/* TAB: ENGINE & FONTES */}
        {activeTab === 'crawlers' && (
          <CrawlerControlModal
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            jobs={jobs}
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
            <strong>Radar Vagas TI</strong> • Agregador Multi-Fontes (Gupy, InHire, EmpregosTec, GitHub BR, Greenhouse, Lever & Remoto Internacional)
          </p>
          <p>
            Vagas Presenciais, Híbridas e Remotas com Link Canônico Direto • Sem intermediários
          </p>
        </div>
      </footer>
    </div>
  );
};
