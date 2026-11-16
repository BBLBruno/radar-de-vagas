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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('radar')}
          className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Radar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight whitespace-nowrap">
                  Radar de Vagas
                </span>
                <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 rounded-md whitespace-nowrap shrink-0">
                  BR + GLOBAL
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block truncate">
                Operações, Processos, Inteligência Comercial, CRM/RevOps, Onboarding, BI & Automação
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="w-full sm:w-auto flex items-center gap-1 sm:gap-2 bg-slate-900/70 sm:bg-transparent p-1 sm:p-0 rounded-xl border border-slate-800/80 sm:border-0">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`flex-1 sm:flex-initial justify-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center ${
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
            className={`flex-1 sm:flex-initial justify-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Minhas Vagas</span>
            {savedCount > 0 && (
              <span
                className={`px-1.5 py-0.5 text-[11px] sm:text-xs font-bold rounded-full leading-none ${
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
            className={`flex-1 sm:flex-initial justify-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>
              Perfil <span className="hidden lg:inline">& Copiloto</span>
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
