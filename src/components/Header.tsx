import React from 'react';
import { Radar, User, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'radar' | 'profile' | 'saved';
  setActiveTab: (tab: 'radar' | 'profile' | 'saved') => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, savedCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('radar')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Radar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">
                Radar BizOps & Dados
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-md">
                BR + GLOBAL
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Operações, Processos, Inteligência Comercial, CRM/RevOps, Onboarding, BI & Automação
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Sem Fontes no cabeçalho; Salvas renomeado para Minhas Vagas) */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'radar'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Vagas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Minhas Vagas</span>
            {savedCount > 0 && (
              <span
                className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${
                  activeTab === 'saved'
                    ? 'bg-slate-950/25 text-slate-950'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil & Copiloto</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
