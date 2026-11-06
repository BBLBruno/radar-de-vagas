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
  isBlacklistedTitle,
  detectAffirmative,
  calculateDistanceToMuzambinho,
} from './engine/normalizer';
import { calculateJobMatch } from './engine/matcher';
import { deduplicateJobs } from './engine/deduplicator';
import { loadStoredProfile } from './engine/defaultProfile';
import {
  Sparkles,
  SearchX,
  ArrowUpDown,
  Bookmark,
} from 'lucide-react';

const SAVED_STORAGE_KEY = 'radar_vagas_saved_jobs_v4';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'profile' | 'saved' | 'crawlers'>('radar');
  const [profile, setProfile] = useState<CandidateProfile>(() => loadStoredProfile());

  // Inicializa as vagas reais aplicando a Blacklist contra Suporte/Dev/Infra
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
    maxDays: 45,
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
        // 0. Blacklist estrita (Garantia dupla contra TI / Dev / Suporte)
        if (isBlacklistedTitle(job.title)) return false;

        // 1. Trava de Senioridade Executiva / Sênior
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

        // 7. Busca textual livre
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'radar' && (
          <div className="space-y-6">
            <StatsBar totalJobs={jobs.length} filteredJobs={filteredJobs} />

            <FilterBar filters={filters} setFilters={setFilters} />

            {/* Barra de Ordenação Limpa */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-sm text-slate-300">
                Mostrando <strong className="text-white font-bold">{filteredJobs.length}</strong> oportunidades
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  Ordenar:
                </span>
                <button
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
                  onClick={() => setSortBy('match')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    sortBy === 'match'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Maior Match
                </button>
              </div>
            </div>

            {/* Grid de Vagas com Espaçamento Confortável */}
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <SearchX className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Nenhuma vaga encontrada com os filtros selecionados
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Limpe os filtros ou desative a trava de cargos Sênior/Executivos para ver todas as {jobs.length} vagas.
                  </p>
                </div>
                <button
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
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all inline-flex items-center gap-2"
                >
                  Ver todas as {jobs.length} vagas
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
              <p className="text-sm text-slate-400 mt-1">
                Oportunidades salvas para candidatura rápida com o Copiloto.
              </p>
            </div>

            {savedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <p className="text-sm text-slate-400">
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
          <strong>Radar de Vagas</strong> • Operações (BizOps), Processos, Inteligência de Mercado/Comercial, CRM/RevOps, Onboarding, Dados/BI & Automação (N8N)
        </div>
      </footer>
    </div>
  );
};
