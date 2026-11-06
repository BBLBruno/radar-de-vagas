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
  isNicheJob, 
  detectAffirmative, 
  validateWorkplaceAndRadius,
  NICHE_TECH_STACKS 
} from './engine/normalizer';
import { calculateJobMatch } from './engine/matcher';
import { deduplicateJobs } from './engine/deduplicator';
import { loadStoredProfile } from './engine/defaultProfile';
import { 
  Sparkles, 
  SearchX, 
  ArrowUpDown, 
  Bookmark,
  Bot,
  MapPin,
  ShieldAlert
} from 'lucide-react';

const SAVED_STORAGE_KEY = 'radar_vagas_saved_jobs_v2';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'radar' | 'profile' | 'saved' | 'crawlers'>('radar');

  // Candidate Profile
  const [profile, setProfile] = useState<CandidateProfile>(() => loadStoredProfile());

  // Jobs State (Inicializado e enriquecido com os novos critérios de nicho e raio)
  const [jobs, setJobs] = useState<Job[]>(() => {
    const enriched = SEED_JOBS.map(j => {
      const niche = isNicheJob(j.title, j.description);
      const affirmative = detectAffirmative(j.title, j.description);
      const geo = validateWorkplaceAndRadius(j.workplaceType, j.location, j.title, j.description);

      return {
        ...j,
        daysOpen: calculateDaysOpen(j.publishedAt),
        isAffirmative: j.isAffirmative ?? affirmative.isAffirmative,
        affirmativeReason: j.affirmativeReason ?? affirmative.reason,
        distanceFromMuzambinhoKm: j.distanceFromMuzambinhoKm ?? geo.distanceKm,
        hybridDaysPerWeek: j.hybridDaysPerWeek ?? geo.hybridDays,
        isWithinAllowedRadius: geo.isValid,
        nicheCategories: j.nicheCategories ?? niche.categories,
      };
    }).filter(j => {
      // Retém apenas as que pertencem ao nicho
      const check = isNicheJob(j.title, j.description);
      return check.isMatch;
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

  // Filters State (Foco no Nicho, Raio de Muzambinho e Ocultar Afirmativas)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    maxDays: 7, // 7 dias padrão
    workplaceType: 'todos',
    seniority: 'todos',
    platform: 'todas',
    selectedStacks: [],
    stateFilter: '',
    hideAffirmative: true, // Ocultar vagas afirmativas ativado por padrão
    onlyMuzambinhoRadiusOrRemote: true, // Apenas Remoto ou Híbrido <= 150km de Muzambinho (<= 2 dias)
    selectedNicheCategory: 'todas',
  });

  const [sortBy, setSortBy] = useState<'match' | 'recent'>('match');

  // Modals
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [copilotJob, setCopilotJob] = useState<Job | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>('Hoje às 17:40');

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

  // Filtragem estrita
  const filteredJobs = useMemo(() => {
    return jobsWithMatch.filter(job => {
      
      // 1. Filtro de Afirmativas
      if (filters.hideAffirmative && job.isAffirmative) {
        return false;
      }

      // 2. Filtro Geográfico: Remoto ou Híbrido em raio de 150km de Muzambinho (max 2 dias)
      if (filters.onlyMuzambinhoRadiusOrRemote) {
        if (job.workplaceType === 'presencial') return false;
        if (job.workplaceType === 'hibrido') {
          const isFar = (job.distanceFromMuzambinhoKm ?? 0) > 150;
          const tooManyDays = (job.hybridDaysPerWeek ?? 2) > 2;
          if (isFar || tooManyDays) return false;
        }
      }

      // 3. Categoria de Nicho
      if (filters.selectedNicheCategory !== 'todas') {
        const hasCategory = job.nicheCategories?.includes(filters.selectedNicheCategory);
        const titleLower = job.title.toLowerCase();
        const matchesCategoryName = 
          filters.selectedNicheCategory === 'ai_ops' ? (titleLower.includes('ai') || titleLower.includes('ia') || titleLower.includes('prompt')) :
          filters.selectedNicheCategory === 'revops' ? (titleLower.includes('revops') || titleLower.includes('sales ops') || titleLower.includes('crm')) :
          filters.selectedNicheCategory === 'automacao' ? (titleLower.includes('n8n') || titleLower.includes('automação') || titleLower.includes('make')) :
          filters.selectedNicheCategory === 'produto' ? (titleLower.includes('product') || titleLower.includes('po') || titleLower.includes('requisitos')) : true;

        if (!hasCategory && !matchesCategoryName) return false;
      }

      // 4. Dias em aberto
      if (job.daysOpen > filters.maxDays) {
        return false;
      }

      // 5. Busca textual
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

      // 6. Modalidade específica (se selecionada manualmente)
      if (filters.workplaceType !== 'todos' && job.workplaceType !== filters.workplaceType) {
        return false;
      }

      // 7. Senioridade
      if (filters.seniority !== 'todos' && job.seniority !== filters.seniority) {
        return false;
      }

      // 8. Plataforma
      if (filters.platform !== 'todas' && job.platform !== filters.platform) {
        return false;
      }

      // 9. Stacks selecionadas
      if (filters.selectedStacks.length > 0) {
        const hasAllStacks = filters.selectedStacks.every(s => job.stacks.includes(s));
        if (!hasAllStacks) return false;
      }

      return true;
    }).sort((a, b) => {
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
    return ['N8N', 'AI Ops', 'RevOps', 'Sales Ops', 'HubSpot', 'Salesforce', 'Make', 'CRM', 'Product Owner', 'Analista de Produto', 'BPMN', 'Python'];
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
        
        {/* Banner do Nicho Ativo */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/30 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Radar Especialista: AI Ops, RevOps, N8N & Produto</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 rounded">
                  Filtro Estrito
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% Remoto ou Híbrido (≤ 150km de Muzambinho - MG • max 2d) • Desenvolvedores puros descartados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
              Muzambinho / MG
            </span>
          </div>
        </div>

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
                <span>Exibindo <strong>{filteredJobs.length}</strong> vagas no nicho (≤ {filters.maxDays} dias)</span>
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
                  onClick={() => setSortBy('match')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    sortBy === 'match'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Maior Match (%)
                </button>
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
                  <h3 className="text-base font-bold text-white">Nenhuma vaga encontrada com os filtros atuais</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Tente expandir o período de dias ou desmarcar o filtro de afirmativas.
                  </p>
                </div>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, maxDays: 30, hideAffirmative: false, selectedNicheCategory: 'todas', searchQuery: '' }))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all inline-flex items-center gap-1.5"
                >
                  Expandir busca completa
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
                  Vagas Salvas no seu Nicho ({savedJobs.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Acompanhe suas oportunidades selecionadas e use o Copiloto com seu background fixo para aplicar.
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
                  Clique no marcador nos cards para salvá-las aqui.
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
            <strong>Radar Vagas TI</strong> • Edição Especialista: AI Ops, RevOps, N8N & Produto
          </p>
          <p>Base geográfica: Muzambinho - MG (Raio 150km ou Remoto) • Links canônicos diretos para ATSs</p>
        </div>
      </footer>

    </div>
  );
};
