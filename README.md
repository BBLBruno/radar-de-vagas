# 📡 Radar Vagas TI

Agregador inteligente de vagas de tecnologia abertas no Brasil, focado no consumo direto de **ATSs (Applicant Tracking Systems)** como **Gupy, Lever, Greenhouse e InHire**. 

Inspirado no sucesso do [Radar Concursos TI](https://radar-concursos-ti.vercel.app/), o **Radar Vagas TI** elimina os intermediários, as telas confusas e as taxas de redirecionamento, entregando **o link canônico direto para a página de inscrição** da vaga com controle rigoroso de dias em aberto.

---

## 🎯 Por que focar direto nos ATSs?

Ao contrário de raspar o feed principal do LinkedIn (que bloqueia ativamente robôs com Cloudflare, exige login e pune automações), o **Radar Vagas TI** foca na origem real das vagas: os sistemas onde as empresas realmente cadastram e gerenciam seus processos seletivos.

### Benefícios:
1. **Link Direto Canônico (1 clique para candidatar-se):**
   * **Gupy:** `https://[empresa].gupy.io/job/[id]`
   * **Lever:** `https://jobs.lever.co/[empresa]/[uuid]`
   * **Greenhouse:** `https://boards.greenhouse.io/[empresa]/jobs/[id]`
   * **InHire:** `https://[empresa].inhire.app/vagas/[id]`
2. **Controle Rigoroso de Dias em Aberto:**
   * O sistema consome as datas de publicação oficiais em formato ISO (`publishedAt` / `updated_at`).
   * Permite filtrar vagas abertas há no máximo **24h, 3 dias, 7 dias (padrão recomendado), 14 dias ou 30 dias**. Vagas antigas com centenas de candidatos são eliminadas do radar.
3. **Filtro Brasil Nativo:**
   * Normalização geográfica que valida estados (SP, RJ, MG, etc.), cidades brasileiras e vagas remotas com contratação no Brasil, descartando vagas do exterior.
4. **Sem "Ghost Jobs":**
   * Checagem em tempo real: se o link do ATS responder inativo ou 404, a vaga é retirada do feed.

---

## ⚡ O Copiloto de Candidatura (Preparado para o Futuro)

Pensando no próximo passo (automação da candidatura e aplicação inteligente com seu currículo), o sistema já conta com o **Copiloto Integrado**:

* **Cálculo de Match Score (%):** Compara seu perfil, suas stacks principais e pretensão salarial contra os requisitos de cada vaga.
* **Pitch & Carta de Apresentação Sob Medida:** Gera instantaneamente uma apresentação personalizada destacando as tecnologias correspondentes.
* **Respostas Prontas para Triagem:** Preenche respostas para as perguntas mais frequentes dos ATSs (*"Disponibilidade para início"*, *"Pretensão salarial CLT/PJ"*, *"Nível de inglês"*, etc.).
* **Checklist de Palavras-Chave do ATS:** Mostra quais termos da vaga você deve garantir que constam no seu currículo para passar pelos robôs de triagem.
* **Cópia em 1 Clique:** Copie o pitch ou as respostas e abra o formulário oficial com o botão direto.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Node.js v18+ instalado.

### 2. Instalação
```bash
npm install
```

### 3. Rodar o Crawler de ATSs (Coleta ao vivo)
```bash
npm run crawl
```
> O crawler varre as APIs públicas do Greenhouse (QuintoAndar, VTEX, Wellhub) e Lever (Banco Neon), filtra apenas vagas no Brasil, calcula o frescor e salva em `src/data/liveJobs.json`.

### 4. Iniciar o Frontend Web (Vite + React)
```bash
npm run dev
```
Acesse no seu navegador: `http://localhost:3000`

### 5. Build de Produção
```bash
npm run build
```

---

## ☁️ Deploy na Vercel

O projeto foi construído para deploy com zero configuração na Vercel:

1. Faça o push para o seu repositório no GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: radar vagas ti initial release"
   git remote add origin https://github.com/BBLBruno/radar-vagas-ti.git
   git push -u origin main
   ```
2. Acesse o painel da **[Vercel](https://vercel.com/)** e clique em **"Add New Project"**.
3. Selecione o repositório `radar-vagas-ti`. O framework preset será detectado automaticamente como **Vite**.
4. Clique em **Deploy**.

---

## 🛡️ Roadmap Futuro: Candidatura Semi-Automática (Co-Piloto)

1. **Extensão de Navegador / Playwright Worker:** Automatizar o preenchimento dos campos do formulário na Gupy/Lever/Greenhouse a partir do perfil estruturado em JSON.
2. **Integração com LLM (OpenAI / Gemini):** Refinar respostas para perguntas comportamentais específicas de cada vaga.
3. **Validação Humana em 1 Clique:** Você revisa os campos preenchidos e autoriza o envio final, eliminando qualquer risco de banimento de conta.
