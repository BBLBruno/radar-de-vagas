# 📡 Radar de Vagas

[🇧🇷 Português (PT-BR)](#-português-pt-br) | [🇺🇸 English (EN-US)](#-english-en-us)

🔗 **Aplicação online / Live app:** [https://radar-de-vagas-five.vercel.app](https://radar-de-vagas-five.vercel.app)

---

## 🇧🇷 Português (PT-BR)

Plataforma automatizada em **TypeScript, React e Node.js** que coleta, deduplica e classifica mais de **1.000 vagas** diretamente a partir das APIs de **Gupy, InHire, Greenhouse e Lever** (além de feeds complementares nacionais e internacionais 100% remotos — **11 plataformas / 57 canais** no pipeline), estruturando requisitos e aderência por perfil.

### 🎯 Visão Geral e Posicionamento

O **Radar de Vagas** foi projetado com foco em áreas de **Operações de Negócios (BizOps), Processos, Inteligência Comercial e de Mercado, CRM & Implantação (Onboarding), Dados & BI e Automação & IA**, eliminando ruídos de suporte técnico, infraestrutura ou desenvolvimento genérico por meio de filtros e regras de classificação no motor de descoberta.

- **Link direto canônico:** Cada oportunidade aponta diretamente para a página oficial da vaga no ATS de origem, sem intermediários.
- **Coleta multi-ATS automatizada:** Pipeline em Node.js (`scripts/discover.mjs`) executado de segunda a sexta-feira via GitHub Actions (`.github/workflows/update-jobs.yml`), com proteção contra sobrescrita em caso de falha de rede.
- **Deduplicação e normalização:** Remove duplicidades por URL canônica e assinatura normalizada (`empresa + título + modalidade`), calcula dias em aberto a partir da data oficial de publicação e padroniza modalidade (`remoto`, `híbrido`, `presencial`), senioridade e localização (incluindo distância em relação a Muzambinho/MG).
- **Estruturação de requisitos e aderência por perfil:** Extrai ferramentas/stacks mencionadas na descrição, classifica a vaga por área temática e calcula o percentual de aderência (`fitScore`), destacando palavras-chave compatíveis e lacunas em relação ao perfil configurado localmente pelo usuário.

### 🔌 Fontes e Integrações

- **Brasil (Nacional):**
  - **Gupy** (`portal.gupy.io` — busca global por termos estratégicos)
  - **InHire e Sólides** (via feed estruturado EmpregosTec)
  - **Greenhouse** (`boards-api.greenhouse.io` — boards de empresas no Brasil)
  - **Lever** (`api.lever.co` — boards de empresas no Brasil)
- **Internacional (100% Remoto):**
  - **Greenhouse** (boards remotos globais)
  - **The Muse API**, **Remotive API**, **Jobicy API**, **Himalayas API**, **Working Nomads API** e **WeWorkRemotely RSS**

### 🧱 Stack Tecnológica

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React
- **Pipeline de Coleta & Automação:** Node.js (v20 no CI), Fetch API nativa, GitHub Actions
- **Persistência no Navegador:** `localStorage` (perfil do candidato, filtros, preferências de interface, vagas salvas e candidaturas registradas)
- **Deploy:** Vercel (`vercel.json` com rewrites SPA para Vite)

### 📁 Estrutura do Projeto

```text
├── .github/workflows/
│   └── update-jobs.yml       # Rotina agendada (Seg–Sex) de coleta e atualização do dataset
├── scripts/
│   ├── crawl.mjs             # Ponto de entrada do comando npm run crawl
│   └── discover.mjs          # Motor de coleta multi-ATS, blacklist, deduplicação e classificação
├── src/
│   ├── components/           # Componentes React (Header, StatsBar, FilterBar, JobCard, modais e perfil)
│   ├── data/
│   │   └── liveJobs.json     # Base versionada de vagas coletadas pelo pipeline
│   ├── engine/
│   │   ├── deduplicator.ts   # Assinatura canônica e deduplicação de vagas
│   │   ├── defaultProfile.ts # Leitura/gravação do perfil no localStorage
│   │   ├── matcher.ts        # Cálculo de aderência por perfil (fitScore e palavras-chave)
│   │   ├── normalizer.ts     # Normalização de modalidade, senioridade, áreas e distância
│   │   └── seedJobs.ts       # Carga inicial e fallback a partir de liveJobs.json
│   ├── types/
│   │   └── index.ts          # Tipagens TypeScript compartilhadas
│   ├── App.tsx               # Aplicação principal, filtros, paginação e estado
│   └── main.tsx              # Bootstrap React
├── crawl.bat / crawl_invisivel.vbs
├── iniciar.bat / iniciar.ps1 / iniciar_invisivel.vbs
├── index.html
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

### 🚀 Como Executar Localmente

**Pré-requisitos:** Node.js 18+ (recomendado Node.js 20) e npm. Não há necessidade de variáveis de ambiente (`.env`) para executar o frontend ou consultar as APIs públicas dos ATSs.

```bash
# 1. Clonar o repositório
git clone https://github.com/BBLBruno/radar-de-vagas.git
cd radar-de-vagas

# 2. Instalar dependências
npm install

# 3. (Opcional) Executar o coletor ao vivo para atualizar src/data/liveJobs.json
npm run crawl

# 4. Iniciar o servidor de desenvolvimento (http://localhost:3000)
npm run dev

# 5. Gerar o build de produção (pasta dist/)
npm run build
```

---

## 🇺🇸 English (EN-US)

Automated **TypeScript, React, and Node.js** platform that collects, deduplicates, and classifies **1,000+ jobs** directly from **Gupy, InHire, Greenhouse, and Lever** APIs (alongside complementary Brazilian and 100% remote international feeds — **11 platforms / 57 channels** across the pipeline), structuring requirements and profile fit.

### 🎯 Overview & Scope

**Radar de Vagas** is focused on **Business Operations (BizOps), Process Optimization, Commercial & Market Intelligence, CRM & Onboarding, Data & BI, and Automation & AI** roles, filtering out unrelated IT support, infrastructure, or generic software engineering listings at ingestion time.

- **Direct canonical links:** Every listing links straight to the company's official ATS posting without middlemen.
- **Automated multi-ATS pipeline:** Node.js discovery script (`scripts/discover.mjs`) scheduled Monday through Friday via GitHub Actions (`.github/workflows/update-jobs.yml`), with a safety threshold that prevents overwriting the dataset on transient network failures.
- **Deduplication & normalization:** Deduplicates listings by canonical URL and normalized signature (`company + title + workplace`), tracks days open from official publication timestamps, and standardizes workplace modality (`remoto`, `híbrido`, `presencial`), seniority, and location metadata.
- **Structured requirements & profile fit:** Extracts mentioned tools/stacks, classifies opportunities by domain area, and computes a profile fit score (`fitScore`) highlighting matched and missing keywords against the user's locally stored profile.

### 🔌 Data Sources

- **Brazil (National):**
  - **Gupy** (`portal.gupy.io` — targeted global search queries)
  - **InHire & Sólides** (via EmpregosTec structured feed)
  - **Greenhouse** (`boards-api.greenhouse.io` — Brazilian company boards)
  - **Lever** (`api.lever.co` — Brazilian company boards)
- **International (100% Remote):**
  - **Greenhouse** (global remote-first company boards)
  - **The Muse API**, **Remotive API**, **Jobicy API**, **Himalayas API**, **Working Nomads API**, and **WeWorkRemotely RSS**

### 🧱 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React
- **Ingestion & Automation:** Node.js (v20 in CI), native Fetch API, GitHub Actions
- **Client-Side Persistence:** `localStorage` (candidate profile, saved filters, UI preferences, bookmarked and applied jobs)
- **Deployment:** Vercel (`vercel.json` with Vite SPA rewrites)

### 📁 Project Layout

```text
├── .github/workflows/
│   └── update-jobs.yml       # Weekday scheduled job collection & dataset commit workflow
├── scripts/
│   ├── crawl.mjs             # Entrypoint for npm run crawl
│   └── discover.mjs          # Multi-ATS collector, title blacklist, deduplication & classification
├── src/
│   ├── components/           # React UI components (Header, StatsBar, FilterBar, JobCard, modals & profile)
│   ├── data/
│   │   └── liveJobs.json     # Versioned job dataset generated by the pipeline
│   ├── engine/
│   │   ├── deduplicator.ts   # Canonical signature & deduplication logic
│   │   ├── defaultProfile.ts # localStorage profile persistence
│   │   ├── matcher.ts        # Profile fit scoring (fitScore & keyword matching)
│   │   ├── normalizer.ts     # Workplace, seniority, area & distance normalization
│   │   └── seedJobs.ts       # Dataset loader backed by liveJobs.json
│   ├── types/
│   │   └── index.ts          # Shared TypeScript interfaces
│   ├── App.tsx               # Main application, multi-filter state & pagination
│   └── main.tsx              # React entrypoint
├── crawl.bat / crawl_invisivel.vbs
├── iniciar.bat / iniciar.ps1 / iniciar_invisivel.vbs
├── index.html
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

### 🚀 Running Locally

**Prerequisites:** Node.js 18+ (Node.js 20 recommended) and npm. No `.env` variables are required to run the frontend or query the public ATS endpoints.

```bash
# 1. Clone the repository
git clone https://github.com/BBLBruno/radar-de-vagas.git
cd radar-de-vagas

# 2. Install dependencies
npm install

# 3. (Optional) Run the live collector to refresh src/data/liveJobs.json
npm run crawl

# 4. Start the development server (http://localhost:3000)
npm run dev

# 5. Build for production (outputs to dist/)
npm run build
```
