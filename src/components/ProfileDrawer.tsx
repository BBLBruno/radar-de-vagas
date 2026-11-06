import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  Code2, 
  DollarSign, 
  HelpCircle, 
  Save, 
  Check, 
  Plus, 
  X,
  Target,
  ShieldCheck,
  MapPin,
  EyeOff
} from 'lucide-react';
import { CandidateProfile, SeniorityLevel } from '../types';
import { saveStoredProfile } from '../engine/defaultProfile';

interface ProfileDrawerProps {
  profile: CandidateProfile;
  setProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ profile, setProfile }) => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newStackInput, setNewStackInput] = useState('');

  const handleChange = (field: keyof CandidateProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleBackgroundChange = (field: keyof CandidateProfile['background'], value: any) => {
    setProfile(prev => ({
      ...prev,
      background: {
        ...prev.background,
        [field]: value,
      }
    }));
  };

  const handlePreferencesChange = (field: keyof CandidateProfile['preferences'], value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      }
    }));
  };

  const handleScreeningChange = (field: keyof CandidateProfile['screeningAnswers'], value: any) => {
    setProfile(prev => ({
      ...prev,
      screeningAnswers: {
        ...prev.screeningAnswers,
        [field]: value,
      }
    }));
  };

  const handleAddStack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStackInput.trim();
    if (trimmed && !profile.primaryStacks.includes(trimmed)) {
      setProfile(prev => ({
        ...prev,
        primaryStacks: [...prev.primaryStacks, trimmed]
      }));
      setNewStackInput('');
    }
  };

  const handleRemoveStack = (stack: string) => {
    setProfile(prev => ({
      ...prev,
      primaryStacks: prev.primaryStacks.filter(s => s !== stack)
    }));
  };

  const handleSave = () => {
    saveStoredProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">Meu Perfil de Especialista & Copiloto</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
              AI Ops • RevOps • Produto
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Seu background fixo de alto impacto está calibrado para gerar pitches e respostas que convertem em entrevistas.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/15 shrink-0"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Salvo com sucesso!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </>
          )}
        </button>
      </div>

      {/* Background Fixo Injetado no Copiloto */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-cyan-300">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Background Profissional Fixo (Injetado nas Cartas e Respostas do Copiloto)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Formação Acadêmica</label>
            <input
              type="text"
              value={profile.background.education}
              onChange={(e) => handleBackgroundChange('education', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Experiência Empreendedora</label>
            <input
              type="text"
              value={profile.background.entrepreneurship}
              onChange={(e) => handleBackgroundChange('entrepreneurship', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Case de Impacto (Métrica Chave)</label>
            <input
              type="text"
              value={profile.background.keyMetricCase}
              onChange={(e) => handleBackgroundChange('keyMetricCase', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Preferências de Localidade & Vagas Afirmativas */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Preferências de Localidade & Filtro de Afirmativas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cidade Base de Referência</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={profile.preferences.referenceCity}
                  onChange={(e) => handlePreferencesChange('referenceCity', e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={profile.preferences.referenceState}
                  onChange={(e) => handlePreferencesChange('referenceState', e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Raio Máximo Híbrido (KM)</label>
                <input
                  type="number"
                  value={profile.preferences.maxHybridDistanceKm}
                  onChange={(e) => handlePreferencesChange('maxHybridDistanceKm', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Máx. Dias Híbridos/Semana</label>
                <input
                  type="number"
                  value={profile.preferences.maxHybridDaysPerWeek}
                  onChange={(e) => handlePreferencesChange('maxHybridDaysPerWeek', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                <EyeOff className="w-4 h-4 text-rose-400" />
                <span>Ocultar Vagas Afirmativas por Padrão</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Remove do radar automático vagas destinadas exclusivamente a ações afirmativas (PCD, gênero, grupos minoritários), focando 100% em vagas de ampla concorrência.
              </p>
            </div>

            <div className="pt-3">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.preferences.hideAffirmativeJobs}
                  onChange={(e) => handlePreferencesChange('hideAffirmativeJobs', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-200">
                  {profile.preferences.hideAffirmativeJobs ? 'Ativo (Vagas afirmativas ocultadas)' : 'Inativo (Exibir todas as vagas)'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Identification and Stacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identificação */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Dados de Identificação & Contato</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nome</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Telefone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">LinkedIn</label>
              <input
                type="text"
                value={profile.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">GitHub</label>
              <input
                type="text"
                value={profile.githubUrl}
                onChange={(e) => handleChange('githubUrl', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Stacks do Nicho */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Suas Stacks Principais (AI Ops / RevOps / N8N)</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {profile.primaryStacks.map(stack => (
              <span
                key={stack}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1"
              >
                <span>{stack}</span>
                <button
                  onClick={() => handleRemoveStack(stack)}
                  className="hover:text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddStack} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newStackInput}
              onChange={(e) => setNewStackInput(e.target.value)}
              placeholder="Adicionar stack (ex: LangChain, Pipedrive)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
