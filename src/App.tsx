import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { CopilotModal } from './components/CopilotModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { CrawlerControlModal } from './components/CrawlerControlModal';
import { Job, FilterState, CandidateProfile, NicheCategory } from './types';
import { SEED_JOBS } from './engine/seedJobs';
import {
  calculateDaysOpen,
  classifyJobCategories,
  isExecutiveOrSeniorTitle,
  isBlacklistedTitle,
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
  X,
  SlidersHorizontal,
  Globe,
  Wifi,
  Briefcase,
  Layers,
  Database,
  Clock,
  MapPin,
  EyeOff,
} from 'lucide-react';

const SAVED_STORAGE_KEY = 'radar_vagas_saved_jobs_v4';

const SHORT_CATEGORY_LABELS: Record<NicheCategory, string> = {
  bizops_processos: 'BizOps & Processos',
  inteligencia_mercado: 'Inteligência Comercial',
  crm_revops_onboarding: 'CRM & Onboarding',
  dados_bi: 'Dados & BI',
  automacao_ia: 'Automação & IA',
};

const SHORT_SENIORITY_LABELS: Record<string, string> = {
  estagio: 'Estágio / Trainee',
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista / Lead',
};

const SHORT_PLATFORM_LABELS: Record<string, string> = {
  gupy: 'Gupy',
  remotive_intl: 'Internacional',
  greenhouse: 'Greenhouse',
  inhire: 'InHire',
  empregostec: 'EmpregosTec',
  lever: 'Lever',
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'profile' | 'saved' | 'crawlers'>('radar');
  const [profile, setProfile] = useState<CandidateProfile>(() => loadStoredProfile());

  const [jobs, setJobs] = useState<Job[]>(() => {
    const enriched = SEED_JOBS.filter(j => !isBlacklistedTitle(j.title)).map(j => {
      const categories =
        j.nicheCategories && j.nicheCategories.length > 0
          ? j.nicheCategories
          : classifyJobCategories(j.title, j.description);
      const affirmative = detectAffirmative(j.title, j.description);
      const distKm =
        j.distanceFromMuzambinhoKm ?? calculateDistanceToMuzambinho(j.location) ?? undefined;

      return {
        ...j,
        daysOpen: calculateDaysOpen(j.publishedAt),
        isAffirmative: j.isAffirmative ?? affirmative.isAffirmative,
        affirmativeReason: j.affirmativeReason ?? affirmative.reason,
        distanceFromMuzambinhoKm: distKm,
        isWithinAllowedRadius:
          j.workplaceType === 'remoto' || (distKm !== undefined && distKm <= 150),
        nicheCategories: categories,
      };
    });

    return deduplicateJobs(enriched);
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    maxDays: 30,
    workplaceType: 'todos',
    scopeFilter: 'todas',
    seniority: 'todos',
    hideExecutiveSenior: true,
    platform: 'todas',
    selectedStacks: [],
    stateFilter: '',
    hideAffirmative: true,
    onlyMuzambinhoRadiusOrRemote: false,
    selectedNicheCategory: 'todas',
  });

  const [sortBy, setSortBy] = useState<'match' | 'recent'>('recent');
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [copilotJob, setCopilotJob] = useState<Job | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>('Atualizado agora');

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

  const toggleStackFilter = (stack: string) => {
    setFilters(prev => {
      const exists = prev.selectedStacks.includes(stack);
      return {
        ...prev,
        selectedStacks: exists
          ? prev.selectedStacks.filter(s => s !== stack)
          : [...prev.selectedStacks, stack],
      };
    });
  };

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

  const filteredJobs = useMemo(() => {
    return jobsWithMatch
      .filter(job => {
        if (isBlacklistedTitle(job.title)) return false;

        if (filters.hideExecutiveSenior) {
          if (job.seniority === 'senior' || job.seniority === 'especialista') {
            return false;
          }
          if (isExecutiveOrSeniorTitle(job.title)) {
            return false;
          }
        }

        if (filters.hideAffirmative && job.isAffirmative) {
          return false;
        }

        if (filters.scopeFilter === 'nacional' && job.isInternational) {
          return false;
        }
        if (filters.scopeFilter === 'internacional' && !job.isInternational) {
          return false;
        }

        if (filters.onlyMuzambinhoRadiusOrRemote) {
          if (job.workplaceType !== 'remoto') {
            const dist = job.distanceFromMuzambinhoKm ?? 999;
            if (dist > 150) return false;
          }
        }

        if (filters.selectedNicheCategory !== 'todas') {
          const cats = job.nicheCategories || [];
          if (!cats.includes(filters.selectedNicheCategory)) {
            return false;
          }
        }

        if (job.daysOpen > filters.maxDays) {
          return false;
        }

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

        if (filters.workplaceType !== 'todos' && job.workplaceType !== filters.workplaceType) {
          return false;
        }

        if (filters.seniority !== 'todos' && job.seniority !== filters.seniority) {
          return false;
        }

        if (filters.platform !== 'todas' && job.platform !== filters.platform) {
          return false;
        }

        // Filtro por Habilidades & Ferramentas (OR / Qualquer uma das habilidades selecionadas)
        if (filters.selectedStacks.length > 0) {
          const hasAnySelectedStack = filters.selectedStacks.some(
            s =>
              job.stacks.some(js => js.toLowerCase() === s.toLowerCase()) ||
              job.title.toLowerCase().includes(s.toLowerCase()) ||
              job.description.toLowerCase().includes(s.toLowerCase())
          );
          if (!hasAnySelectedStack) return false;
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
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedJobIds.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'radar' && (
          <div className="space-y-4">
            <StatsBar totalJobs={jobs.length} filteredJobs={filteredJobs} />

            <FilterBar
              filters={filters}
              setFilters={setFilters}
              popularStacks={POPULAR_FILTER_STACKS}
            />

            {/* Sub-header: Contagem + Tags Resumidas de Filtros Ativos + Ordenação */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-300">
                <span className="mr-1">
                  Exibindo <strong className="text-emerald-400">{filteredJobs.length}</strong> de{' '}
                  <strong>{jobs.length}</strong> vagas
                </span>

                {/* Tags Resumidas Dinâmicas dos Filtros Ativos */}
                {filters.hideExecutiveSenior && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, hideExecutiveSenior: false }))}
                    title="Clique para remover filtro"
                    className="text-[11px] px-2 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md flex items-center gap-1 hover:bg-cyan-500/25 transition-all"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Jr / Pleno</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.scopeFilter !== 'todas' && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, scopeFilter: 'todas' }))}
                    className="text-[11px] px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md flex items-center gap-1 hover:bg-emerald-500/25 transition-all"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{filters.scopeFilter === 'nacional' ? 'Brasil' : 'Internacional'}</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.workplaceType !== 'todos' && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, workplaceType: 'todos' }))}
                    className="text-[11px] px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md flex items-center gap-1 hover:bg-emerald-500/25 transition-all"
                  >
                    <Wifi className="w-3 h-3" />
                    <span className="capitalize">{filters.workplaceType}</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.seniority !== 'todos' && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, seniority: 'todos' }))}
                    className="text-[11px] px-2 py-0.5 bg-sky-500/15 text-sky-300 border border-sky-500/30 rounded-md flex items-center gap-1 hover:bg-sky-500/25 transition-all"
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>{SHORT_SENIORITY_LABELS[filters.seniority]}</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.selectedNicheCategory !== 'todas' && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, selectedNicheCategory: 'todas' }))}
                    className="text-[11px] px-2 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md flex items-center gap-1 hover:bg-cyan-500/25 transition-all"
                  >
                    <Layers className="w-3 h-3" />
                    <span>{SHORT_CATEGORY_LABELS[filters.selectedNicheCategory]}</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.platform !== 'todas' && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, platform: 'todas' }))}
                    className="text-[11px] px-2 py-0.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-md flex items-center gap-1 hover:bg-indigo-500/25 transition-all"
                  >
                    <Database className="w-3 h-3" />
                    <span>{SHORT_PLATFORM_LABELS[filters.platform] || filters.platform}</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.maxDays < 45 && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, maxDays: 45 }))}
                    className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-md flex items-center gap-1 hover:bg-slate-700 transition-all"
                  >
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Até {filters.maxDays}d</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.onlyMuzambinhoRadiusOrRemote && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, onlyMuzambinhoRadiusOrRemote: false }))}
                    className="text-[11px] px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md flex items-center gap-1 hover:bg-emerald-500/25 transition-all"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Raio 150km / Remoto</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.hideAffirmative && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, hideAffirmative: false }))}
                    className="text-[11px] px-2 py-0.5 bg-slate-800/80 text-slate-400 border border-slate-700/70 rounded-md flex items-center gap-1 hover:text-slate-200 transition-all"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Sem Afirmativas</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.selectedStacks.map(stack => (
                  <button
                    key={stack}
                    type="button"
                    onClick={() => toggleStackFilter(stack)}
                    className="text-[11px] px-2 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md flex items-center gap-1 hover:bg-amber-500/25 transition-all"
                  >
                    <span>{stack}</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  Ordenar por:
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy('recent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sortBy === 'recent'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mais Recentes
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('match')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    sortBy === 'match'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Compatibilidade com Perfil
                </button>
              </div>
            </div>

            {/* Job Cards Grid (items-start para que expandir o resumo de 1 card não estique os outros!) */}
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    selectedStacks={filters.selectedStacks}
                    onToggleStack={toggleStackFilter}
                    onToggleSave={toggleSaveJob}
                    onOpenDetails={setDetailJob}
                    onOpenCopilot={setCopilotJob}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <SearchX className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Nenhuma vaga encontrada com os filtros atuais
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Limpe os filtros ou desative a trava de cargos Sênior/Executivos para visualizar todas as {jobs.length} vagas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      maxDays: 45,
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

        {activeTab === 'saved' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-400" />
                Vagas Salvas ({savedJobs.length})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Acompanhe suas oportunidades selecionadas e gere pitches personalizados com o Copiloto.
              </p>
            </div>

            {savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {savedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={true}
                    selectedStacks={filters.selectedStacks}
                    onToggleStack={toggleStackFilter}
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
                  Clique no ícone de marcador nos cards para salvar suas vagas favoritas.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileDrawer profile={profile} setProfile={setProfile} />
        )}

        {activeTab === 'crawlers' && (
          <CrawlerControlModal
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
            lastSyncTime={lastSyncTime}
            jobs={jobs}
          />
        )}
      </main>

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

      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <strong>Radar BizOps & Dados</strong> • Operações, Processos, Inteligência de Mercado/Comercial, CRM/RevOps, Onboarding, BI & Automação (N8N)
        </div>
      </footer>
    </div>
  );
};
