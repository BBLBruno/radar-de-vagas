import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { CopilotModal } from './components/CopilotModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { CrawlerControlModal } from './components/CrawlerControlModal';
import {
  AppliedJobInfo,
  Job,
  FilterState,
  CandidateProfile,
  NicheCategory,
  SeniorityLevel,
  WorkplaceType,
} from './types';
import { SEED_JOBS } from './engine/seedJobs';
import {
  calculateDaysOpen,
  classifyJobCategories,
  detectSeniority,
  detectWorkplaceType,
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  Trash2,
  BookmarkX,
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

const SHORT_WORKPLACE_LABELS: Record<WorkplaceType, string> = {
  remoto: '100% Remoto',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
};

const SHORT_PLATFORM_LABELS: Record<string, string> = {
  gupy: 'Gupy',
  remotive_intl: 'Internacional',
  greenhouse: 'Greenhouse',
  inhire: 'InHire',
  empregostec: 'EmpregosTec',
  lever: 'Lever',
};

const PAGE_SIZE_OPTIONS = [12, 18, 24, 36, 60];

function normalizeSearchText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera os itens de paginação (inicial, atual + 4 e final, adaptando conforme início/meio/fim)
 */
function getPaginationItems(currentPage: number, totalPages: number): Array<number | 'ellipsis-start' | 'ellipsis-end'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | 'ellipsis-start' | 'ellipsis-end'> = [];

  if (currentPage <= 3) {
    for (let p = 1; p <= Math.min(5, totalPages - 1); p++) {
      items.push(p);
    }
    if (totalPages > 6) {
      items.push('ellipsis-end');
    }
    items.push(totalPages);
    return items;
  }

  if (currentPage >= totalPages - 4) {
    items.push(1);
    items.push('ellipsis-start');
    for (let p = Math.max(2, totalPages - 4); p <= totalPages; p++) {
      items.push(p);
    }
    return items;
  }

  items.push(1);
  items.push('ellipsis-start');
  const endWindow = Math.min(totalPages - 1, currentPage + 4);
  for (let p = currentPage; p <= endWindow; p++) {
    items.push(p);
  }
  if (endWindow < totalPages - 1) {
    items.push('ellipsis-end');
  }
  items.push(totalPages);
  return items;
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
        calculateDistanceToMuzambinho(j.location) ?? j.distanceFromMuzambinhoKm ?? undefined;
      const computedSeniority = detectSeniority(j.title, j.description);
      const computedWorkplace: WorkplaceType = j.isInternational
        ? 'remoto'
        : j.workplaceType === 'presencial' &&
          (j.location.trim().toLowerCase() === 'brasil' || j.location.trim().toLowerCase() === 'brazil')
        ? 'remoto'
        : j.workplaceType || detectWorkplaceType(j.title, j.location);

      return {
        ...j,
        seniority: computedSeniority,
        workplaceType: computedWorkplace,
        daysOpen: calculateDaysOpen(j.publishedAt),
        isAffirmative: j.isAffirmative ?? affirmative.isAffirmative,
        affirmativeReason: j.affirmativeReason ?? affirmative.reason,
        distanceFromMuzambinhoKm: distKm,
        isWithinAllowedRadius:
          computedWorkplace === 'remoto' ||
          (computedWorkplace === 'hibrido' && distKm !== undefined && distKm <= 150),
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
    selectedWorkplaces: [],
    scopeFilter: 'todas',
    seniority: 'todos',
    selectedSeniorities: [],
    hideExecutiveSenior: false,
    hideSavedJobs: false,
    platform: 'todas',
    selectedStacks: [],
    stateFilter: '',
    hideAffirmative: true,
    onlyMuzambinhoRadiusOrRemote: false,
    selectedNicheCategory: 'todas',
  });

  const [sortBy, setSortBy] = useState<'match' | 'recent'>('recent');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(18);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [copilotJob, setCopilotJob] = useState<Job | null>(null);
  const [jobToRemoveFromSaved, setJobToRemoveFromSaved] = useState<Job | null>(null);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, itemsPerPage]);

  const toggleSaveJob = (job: Job) => {
    const isCurrentlyInMyJobs =
      savedJobIds.includes(job.id) || Boolean(appliedJobsMap[job.id]);

    if (isCurrentlyInMyJobs) {
      if (activeTab === 'saved') {
        setJobToRemoveFromSaved(job);
        return;
      }
      setSavedJobIds(prev => prev.filter(id => id !== job.id));
      setAppliedJobsMap(prev => {
        if (!prev[job.id]) return prev;
        const next = { ...prev };
        delete next[job.id];
        return next;
      });
    } else {
      setSavedJobIds(prev => (prev.includes(job.id) ? prev : [...prev, job.id]));
    }
  };

  const confirmRemoveSavedJob = () => {
    if (!jobToRemoveFromSaved) return;
    const targetId = jobToRemoveFromSaved.id;
    setSavedJobIds(prev => prev.filter(id => id !== targetId));
    setAppliedJobsMap(prev => {
      if (!prev[targetId]) return prev;
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
    setJobToRemoveFromSaved(null);
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

  const removeWorkplaceFilter = (wp: WorkplaceType) => {
    setFilters(prev => {
      const next = (prev.selectedWorkplaces || []).filter(w => w !== wp);
      return {
        ...prev,
        selectedWorkplaces: next,
        workplaceType: next.length === 1 ? next[0] : 'todos',
      };
    });
  };

  const removeSeniorityFilter = (sen: SeniorityLevel) => {
    setFilters(prev => {
      const next = (prev.selectedSeniorities || []).filter(s => s !== sen);
      return {
        ...prev,
        selectedSeniorities: next,
        seniority: next.length === 1 ? next[0] : 'todos',
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

        // 1. Filtro de Senioridade (Múltipla escolha)
        const selectedSens = filters.selectedSeniorities || [];
        if (selectedSens.length > 0) {
          if (!selectedSens.includes(job.seniority)) {
            return false;
          }
        } else if (filters.seniority !== 'todos') {
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

        // 4. Filtro Geográfico Fixo (Raio 150km de Muzambinho-MG / Remoto): Somente 100% Remoto e/ou Híbrido num raio fixo de até 150km
        if (filters.onlyMuzambinhoRadiusOrRemote) {
          if (job.workplaceType === 'presencial') {
            return false;
          }
          if (job.workplaceType === 'hibrido') {
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

        // 8. Filtro de Modalidade (Múltipla escolha: Remoto / Híbrido / Presencial)
        const selectedWps = filters.selectedWorkplaces || [];
        if (selectedWps.length > 0) {
          if (!selectedWps.includes(job.workplaceType)) {
            return false;
          }
        } else if (filters.workplaceType !== 'todos' && job.workplaceType !== filters.workplaceType) {
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

        // 11. Filtro Ocultar Vagas Salvas
        if (filters.hideSavedJobs) {
          const isSaved = savedJobIds.includes(job.id) || Boolean(appliedJobsMap[job.id]);
          if (isSaved) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return (b.fitScore || 0) - (a.fitScore || 0);
        }
        return a.daysOpen - b.daysOpen;
      });
  }, [jobsWithMatch, filters, sortBy, profile, savedJobIds, appliedJobsMap]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedJobs = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredJobs, safeCurrentPage, itemsPerPage]);

  const paginationItems = useMemo(
    () => getPaginationItems(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages]
  );

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

  const startItemNum = filteredJobs.length === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItemNum = Math.min(safeCurrentPage * itemsPerPage, filteredJobs.length);

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
              savedCount={allMyJobs.length}
            />

            {/* Sub-header: Contagem + Tags Resumidas de Filtros Ativos + Ordenação */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-300">
                <span className="mr-1">
                  Exibindo <strong className="text-emerald-400">{filteredJobs.length}</strong> de{' '}
                  <strong>{jobs.length}</strong> vagas
                </span>

                {/* Tags Resumidas de Modalidades Ativas (Múltipla Escolha) */}
                {(filters.selectedWorkplaces || []).map(wp => (
                  <button
                    key={wp}
                    type="button"
                    onClick={() => removeWorkplaceFilter(wp)}
                    title="Clique para remover esta modalidade"
                    className="text-[11px] px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md flex items-center gap-1 hover:bg-emerald-500/25 transition-all"
                  >
                    <Home className="w-3 h-3" />
                    <span>{SHORT_WORKPLACE_LABELS[wp] || wp}</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                ))}

                {/* Tags Resumidas de Senioridades Ativas (Múltipla Escolha) */}
                {(filters.selectedSeniorities || []).map(sen => (
                  <button
                    key={sen}
                    type="button"
                    onClick={() => removeSeniorityFilter(sen)}
                    title="Clique para remover esta senioridade"
                    className="text-[11px] px-2 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md flex items-center gap-1 hover:bg-cyan-500/25 transition-all"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>{SHORT_SENIORITY_LABELS[sen] || sen}</span>
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  </button>
                ))}

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
                    className="text-[11px] px-2 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-md flex items-center gap-1 hover:bg-cyan-500/25 transition-all"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Remoto + Híbrido (≤150km)</span>
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

                {filters.hideSavedJobs && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, hideSavedJobs: false }))}
                    className="text-[11px] px-2 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md flex items-center gap-1 hover:bg-amber-500/25 transition-all"
                  >
                    <BookmarkX className="w-3 h-3" />
                    <span>Ocultando Salvas</span>
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

            {/* Job Cards Grid + Paginação Completa */}
            {filteredJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.includes(job.id) || Boolean(appliedJobsMap[job.id])}
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

                {/* Barra de Paginação embaixo */}
                <div className="mt-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                      <span className="font-semibold text-slate-300">Vagas por página:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
                      >
                        {PAGE_SIZE_OPTIONS.map(size => (
                          <option key={size} value={size} className="bg-slate-900 text-white">
                            {size} vagas
                          </option>
                        ))}
                      </select>
                    </div>
                    <span>
                      Mostrando <strong className="text-white">{startItemNum}–{endItemNum}</strong> de{' '}
                      <strong className="text-emerald-400">{filteredJobs.length}</strong> vagas
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-950/90 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-800 transition-all flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Anterior</span>
                    </button>

                    <div className="flex items-center gap-1 px-1">
                      {paginationItems.map((item, idx) =>
                        typeof item === 'number' ? (
                          <button
                            key={`page_${item}`}
                            type="button"
                            onClick={() => setCurrentPage(item)}
                            className={`min-w-[2.25rem] h-9 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                              safeCurrentPage === item
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            {item}
                          </button>
                        ) : (
                          <span
                            key={`${item}_${idx}`}
                            className="px-1.5 text-xs font-bold text-slate-500 select-none"
                          >
                            ...
                          </span>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-950/90 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-800 transition-all flex items-center gap-1"
                    >
                      <span>Próxima</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
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
                      selectedWorkplaces: [],
                      scopeFilter: 'todas',
                      seniority: 'todos',
                      selectedSeniorities: [],
                      hideExecutiveSenior: false,
                      hideSavedJobs: false,
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

        {/* Aba Minhas Vagas */}
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
                    isSaved={true}
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

            {/* Embaixo de tudo na aba Minhas Vagas: Ecossistema de Fontes */}
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

      {/* Modal de Confirmação para Remover Vaga de Minhas Vagas */}
      {jobToRemoveFromSaved && (
        <div
          onClick={() => setJobToRemoveFromSaved(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl cursor-default"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Remover vaga de Minhas Vagas?
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tem certeza que deseja remover <strong className="text-slate-200">{jobToRemoveFromSaved.title}</strong> ({jobToRemoveFromSaved.company}) da sua lista de vagas salvas?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setJobToRemoveFromSaved(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRemoveSavedJob}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, remover dos salvos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé no padrão do Radar de Concursos adaptado para o Radar de Vagas */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Linha Superior: Nome + Formação + Descrição à esquerda | Botões LinkedIn e GitHub à direita */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/70">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Bruno Bianchi Léo
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Bacharel em Ciência da Computação
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Operações de Negócios (BizOps), Processos, Inteligência Comercial, CRM/RevOps, Dados & Automação (N8N) • Projeto de Portfólio (TypeScript + Multi-ATS Discovery + CI/CD)
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="https://www.linkedin.com/in/bruno-bianchi-leo/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#0a66c2] hover:bg-[#004182] text-white transition-all flex items-center gap-1.5 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <a
                href="https://github.com/BBLBruno"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                </svg>
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          </div>

          {/* Linha Inferior: Status do Monitoramento à esquerda | Fontes e Última atualização à direita */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              Radar de Vagas • Monitoramento Automatizado (Segunda a Sexta no período da manhã)
            </span>
            <span className="font-mono text-[11px] sm:text-xs text-slate-400">
              Fontes: 11 plataformas (57 canais) • Última atualização:{' '}
              {(() => {
                let maxTime = 0;
                for (const j of jobs) {
                  if (j.publishedAt) {
                    const t = new Date(j.publishedAt).getTime();
                    if (!Number.isNaN(t) && t > maxTime) maxTime = t;
                  }
                }
                const d = maxTime > 0 ? new Date(maxTime) : new Date();
                return d.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });
              })()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
