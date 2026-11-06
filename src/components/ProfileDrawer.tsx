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
  FileCheck
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
            <h2 className="text-xl font-bold text-white">Meu Perfil de Candidato & Copiloto</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
              Base do Assistente
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Estes dados alimentam o cálculo de compatibilidade (Match %) e geram suas cartas e respostas de triagem automáticas.
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

      {/* Grid of Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Dados Pessoais & Contato */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Dados de Identificação</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nome Completo</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cidade</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Estado (UF)</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={profile.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">GitHub / Portfólio</label>
              <input
                type="text"
                value={profile.githubUrl}
                onChange={(e) => handleChange('githubUrl', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Experiência e Preferências */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>Perfil Técnico & Pretensões</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Título Profissional Atual</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Senioridade</label>
                <select
                  value={profile.seniority}
                  onChange={(e) => handleChange('seniority', e.target.value as SeniorityLevel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="estagio">Estágio</option>
                  <option value="junior">Júnior</option>
                  <option value="pleno">Pleno</option>
                  <option value="senior">Sênior</option>
                  <option value="especialista">Especialista / Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Anos de Experiência</label>
                <input
                  type="number"
                  value={profile.yearsOfExperience}
                  onChange={(e) => handleChange('yearsOfExperience', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Pretensão Salarial CLT</label>
                <input
                  type="text"
                  value={profile.salaryExpectationClt}
                  onChange={(e) => handleChange('salaryExpectationClt', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Pretensão Salarial PJ</label>
                <input
                  type="text"
                  value={profile.salaryExpectationPj}
                  onChange={(e) => handleChange('salaryExpectationPj', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Resumo Profissional (Mini Bio)</label>
              <textarea
                rows={3}
                value={profile.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Stacks Principais */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Suas Principais Tecnologias e Stacks (Usadas no Match %)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {profile.primaryStacks.map(stack => (
            <span
              key={stack}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
            >
              <span>{stack}</span>
              <button
                onClick={() => handleRemoveStack(stack)}
                className="hover:text-rose-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddStack} className="flex gap-2 max-w-sm">
          <input
            type="text"
            value={newStackInput}
            onChange={(e) => setNewStackInput(e.target.value)}
            placeholder="Adicionar tecnologia (ex: GraphQL, Rust)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </form>
      </div>

      {/* 4. Perguntas Frequentes de Triagem (Copiloto) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Respostas Padrão para Triagens dos ATSs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Disponibilidade para Início</label>
            <input
              type="text"
              value={profile.screeningAnswers.availability}
              onChange={(e) => handleScreeningChange('availability', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nível de Inglês</label>
            <input
              type="text"
              value={profile.screeningAnswers.englishLevel}
              onChange={(e) => handleScreeningChange('englishLevel', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Experiência com Liderança Técnica / Squads</label>
            <textarea
              rows={2}
              value={profile.screeningAnswers.leadershipExperience}
              onChange={(e) => handleScreeningChange('leadershipExperience', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
