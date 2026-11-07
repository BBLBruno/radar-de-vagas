import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { CopilotModal } from './components/CopilotModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { CrawlerControlModal } from './components/CrawlerControlModal';
import { AppliedJobInfo, Job, FilterState, CandidateProfile, NicheCategory } from './types';
import { SEED_JOBS } from './engine/seedJobs';
import {
  calculateDaysOpen,
  classifyJobCategories,
  detectSeniority,
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
  BookmarkCheck,
  X,
  SlidersHorizontal,
  Globe,
  Home,
  Layers,
  Database,
  Clock,
  MapPin,
  EyeOff,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

const SAVED_STORAGE_KEY = 'radar_vagas_saved_jobs_v4';
const APPLIED_STORAGE_KEY = 'radar_vagas_applied_jobs_v1';

const SHORT_CATEGORY_LABELS: Record<NicheCategory, string> = {
  bizops_processos: 'BizOps & Processos',
  inteligencia_mercado: 'Inteligência Comercial',
  crm_revops_onboarding: 'CRM & Onboarding',
  dados_bi: 'Dados & BI',
  automacao_ia: 'Automação & IA',
};

const SHORT_SENIORITY_LABELS: Record<string, string> = {
  estagio: 'Estágio / Trainee',
  junior: 'Júnior / Assistente',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista / Liderança',
};

const SHORT_PLATFORM_LABELS: Record<string, string> = {
  gupy: 'Gupy',
  remotive_intl: 'Internacional',
  greenhouse: 'Greenhouse',
  inhire: 'InHire',
  empregostec: 'EmpregosTec',
  lever: 'Lever',
};

function normalizeSearchText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'profile' | 'saved'>('radar');
  const [savedFilterMode, setSavedFilterMode] = useState<'todas' | 'pendentes' | 'candidatadas'>('todas');
  const [profile, setProfile] = useState<CandidateProfile>(() => loadStoredProfile());

  const [jobs] = useState<Job[]>(() => {
    const enriched = SEED_JOBS.filter(j => !isBlacklistedTitle(j.title)).map(j => {
      const categories =
        j.nicheCategories && j.nicheCategories.length > 0
          ? j.nicheCategories
          : classifyJobCategories(j.title, j.description);
      const affirmative = detectAffirmative(j.title, j.description);
      const distKm =
        j.distanceFromMuzambinhoKm ?? calculateDistanceToMuzambinho(j.location) ?? undefined;
      const computedSeniority = detectSeniority(j.title, j.description);

      return {
        ...j,
        seniority: computedSeniority,
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

  const [appliedJobsMap, setAppliedJobsMap] = useState<Record<string, AppliedJobInfo>>(() => {
    try {
      const stored = localStorage.getItem(APPLIED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    maxDays: 30,
    workplaceType: 'todos',
    scopeFilter: 'todas',
    seniority: 'todos',
    hideExecutiveSenior: false,
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

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedJobIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedJobIds]);

  useEffect(() => {
    try {
      localStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(appliedJobsMap));
    } catch (e) {
      console.error(e);
    }
  }, [appliedJobsMap]);

  const toggleSaveJob = (job: Job) => {
    setSavedJobIds(prev =>
      prev.includes(job.id) ? prev.filter(id => id !== job.id) : [...prev, job.id]
    );
  };

  const handleToggleApplied = (job: Job, trackingUrl?: string) => {
    setAppliedJobsMap(prev => {
      if (prev[job.id]) {
        const next = { ...prev };
        delete next[job.id];
        return next;
      }
      return {
        ...prev,
        [job.id]: {
          jobId: job.id,
          appliedAt: new Date().toISOString(),
          trackingUrl: trackingUrl || '',
        },
      };
    });

    // Garante que a vaga marcada como "Já me candidatei" esteja em Minhas Vagas
    setSavedJobIds(prev => (prev.includes(job.id) ? prev : [...prev, job.id]));
  };

  const handleUpdateTrackingUrl = (jobId: string, trackingUrl: string) => {
    setAppliedJobsMap(prev => {
      const existing = prev[jobId] || {
        jobId,
        appliedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        [jobId]: {
          ...existing,
          trackingUrl,
        },
      };
    });
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

        // 1. Filtro de Senioridade (100% determinístico para cada uma das 6 opções)
        if (filters.seniority !== 'todos') {
          if (job.seniority !== filters.seniority) {
            return false;
          }
        }

        // 2. Filtro Sem Afirmativas
        if (filters.hideAffirmative && job.isAffirmative) {
          return false;
        }

        // 3. Filtro de Localidade (Brasil vs Internacional)
        if (filters.scopeFilter === 'nacional' && job.isInternational) {
          return false;
        }
        if (filters.scopeFilter === 'internacional' && !job.isInternational) {
          return false;
        }

        // 4. Filtro Geográfico (Raio 150km de Muzambinho ou 100% Remoto)
        if (filters.onlyMuzambinhoRadiusOrRemote) {
          if (job.workplaceType !== 'remoto') {
            const dist = job.distanceFromMuzambinhoKm ?? 999;
            if (dist > 150) return false;
          }
        }

        // 5. Filtro de Área de Atuação
        if (filters.selectedNicheCategory !== 'todas') {
          const cats = job.nicheCategories || [];
          if (!cats.includes(filters.selectedNicheCategory)) {
            return false;
          }
        }

        // 6. Filtro de Data de Publicação
        if (job.daysOpen > filters.maxDays) {
          return false;
        }

        // 7. Filtro de Busca Textual (Ignora acentos e maiúsculas/minúsculas)
        if (filters.searchQuery.trim()) {
          const query = normalizeSearchText(filters.searchQuery.trim());
          const matchesTitle = normalizeSearchText(job.title).includes(query);
          const matchesCompany = normalizeSearchText(job.company).includes(query);
          const matchesDesc = normalizeSearchText(job.description).includes(query);
          const matchesLocation = normalizeSearchText(job.location).includes(query);
          const matchesStack = job.stacks.some(s => normalizeSearchText(s).includes(query));

          if (!matchesTitle && !matchesCompany && !matchesDesc && !matchesLocation && !matchesStack) {
            return false;
          }
        }

        // 8. Filtro de Modalidade (Remoto / Híbrido / Presencial)
        if (filters.workplaceType !== 'todos' && job.workplaceType !== filters.workplaceType) {
          return false;
        }

        // 9. Filtro de Fonte / Plataforma
        if (filters.platform !== 'todas' && job.platform !== filters.platform) {
          return false;
        }

        // 10. Filtro Rápido por Habilidades & Ferramentas
        if (filters.selectedStacks.length > 0) {
          const hasAnySelectedStack = filters.selectedStacks.some(s => {
            const normS = normalizeSearchText(s);
            return (
              job.stacks.some(js => normalizeSearchText(js) === normS) ||
              normalizeSearchText(job.title).includes(normS) ||
              normalizeSearchText(job.description).includes(normS)
            );
          });
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

  const allMyJobs = useMemo(() => {
    const allIds = new Set([...savedJobIds, ...Object.keys(appliedJobsMap)]);
    return jobsWithMatch.filter(j => allIds.has(j.id));
  }, [jobsWithMatch, savedJobIds, appliedJobsMap]);

  const displayedMyJobs = useMemo(() => {
    if (savedFilterMode === 'candidatadas') {
      return allMyJobs.filter(j => Boolean(appliedJobsMap[j.id]));
    }
    if (savedFilterMode === 'pendentes') {
      return allMyJobs.filter(j => !appliedJobsMap[j.id]);
    }
    return allMyJobs;
  }, [allMyJobs, appliedJobsMap, savedFilterMode]);

  const appliedCount = useMemo(
    () => allMyJobs.filter(j => Boolean(appliedJobsMap[j.id])).length,
    [allMyJobs, appliedJobsMap]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={allMyJobs.length}
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

                {/* Tag Resumida de Senioridade Ativa */}
                {filters.seniority !== 'todos' && (
                  <button
                    type="button"
                    onClick={() =>
                      setFilters(prev => ({
                        ...prev,
                        seniority: 'todos',
                        hideExecutiveSenior: false,
                      }))
                    }
                    title="Clique para mostrar todas as senioridades"
                    className="text-[11px] px-2 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md flex items-center gap-1 hover:bg-cyan-500/25 transition-all"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>{SHORT_SENIORITY_LABELS[filters.seniority] || filters.seniority}</span>
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
                    <Home className="w-3 h-3" />
                    <span className="capitalize">{filters.workplaceType}</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                )}

                {filters.selectedNicheCategory !== 'todas' && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, selectedNicheCategory: 'todas' }))}
                    className="text-[11px] px-2 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md flex items-center gap-1 hover:bg-cyan-500/25 transition-all"
                  >
                    <Layers className="w-3.5 h-3.5" />
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

            {/* Job Cards Grid (Todos do mesmo tamanho com h-full) */}
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    appliedInfo={appliedJobsMap[job.id]}
                    selectedStacks={filters.selectedStacks}
                    onToggleStack={toggleStackFilter}
                    onToggleSave={toggleSaveJob}
                    onToggleApplied={handleToggleApplied}
                    onUpdateTrackingUrl={handleUpdateTrackingUrl}
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
                    Limpe os filtros ou selecione "Todas" na Senioridade para visualizar todas as {jobs.length} vagas.
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

        {/* Aba Minhas Vagas (Substitui Vagas Salvas + Inclui "Já me candidatei" + Fontes embaixo de tudo) */}
        {activeTab === 'saved' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-emerald-400" />
                  Minhas Vagas & Candidaturas ({allMyJobs.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Gerencie as vagas que você separou para aplicar e acompanhe aquelas em que já se candidatou.
                </p>
              </div>

              {/* Filtro rápido dentro de Minhas Vagas */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setSavedFilterMode('todas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    savedFilterMode === 'todas'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Todas ({allMyJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSavedFilterMode('pendentes')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    savedFilterMode === 'pendentes'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Para Aplicar ({allMyJobs.length - appliedCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSavedFilterMode('candidatadas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    savedFilterMode === 'candidatadas'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Já me candidatei ({appliedCount})</span>
                </button>
              </div>
            </div>

            {displayedMyJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedMyJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    appliedInfo={appliedJobsMap[job.id]}
                    showAppliedOption={true}
                    selectedStacks={filters.selectedStacks}
                    onToggleStack={toggleStackFilter}
                    onToggleSave={toggleSaveJob}
                    onToggleApplied={handleToggleApplied}
                    onUpdateTrackingUrl={handleUpdateTrackingUrl}
                    onOpenDetails={setDetailJob}
                    onOpenCopilot={setCopilotJob}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <BookmarkCheck className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {savedFilterMode === 'candidatadas'
                    ? 'Nenhuma vaga marcada como "Já me candidatei" ainda'
                    : 'Nenhuma vaga salva em Minhas Vagas'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Clique no ícone de salvar nos cards da tela principal e marque "Já me candidatei" para anexar o link de acompanhamento da sua inscrição.
                </p>
              </div>
            )}

            {/* Embaixo de tudo na aba Minhas Vagas: Ecossistema de Fontes bem dividido e sem botão de atualização */}
            <CrawlerControlModal jobs={jobs} />
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileDrawer profile={profile} setProfile={setProfile} />
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
