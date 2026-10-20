export type ValidationSource = {
  name: string;
  purpose: string;
  requirement: "Obrigatória" | "Recomendada" | "Opcional";
  status: "Definida" | "A confirmar";
};

export type ValidationMetric = {
  id: string;
  name: string;
  description: string;
  direction: "Menor é melhor" | "Maior é melhor";
  required: boolean;
};

export type ModelComparison = {
  model: string;
  role: "Principal" | "Challenger";
  score: number;
  mae: string;
  recall: string;
  lead: string;
  calibration: string;
  readiness: "Apto" | "Em análise" | "Condicionado";
  tone: "mint" | "violet" | "amber";
};

export type ScoreCriterion = {
  id: string;
  label: string;
  hint: string;
  direction: "Menor é melhor" | "Maior é melhor";
  weight: number;
};

export type ApprovalStage = {
  role: string;
  action: string;
  owner: string;
};

export const VALIDATION_CONTRACT = {
  version: "v0.1 · rascunho demonstrativo",
  event: "Inundação urbana",
  target: "Nível / vazão",
  unit: "Bacias e estações",
  horizon: "6 h",
  frequency: "15 min",
  split: "70% treino · 15% validação · 15% teste temporal",
  status: "Aguardando aprovação técnica",
} as const;

export const VALIDATION_SOURCES: ValidationSource[] = [
  {
    name: "Pluviômetros",
    purpose: "Série de chuva antecedente",
    requirement: "Obrigatória",
    status: "Definida",
  },
  {
    name: "Nível / vazão",
    purpose: "Variável-alvo observada",
    requirement: "Obrigatória",
    status: "Definida",
  },
  {
    name: "Radar meteorológico",
    purpose: "Contexto espacial da precipitação",
    requirement: "Recomendada",
    status: "A confirmar",
  },
  {
    name: "Solo e uso do solo",
    purpose: "Contexto de absorção e exposição",
    requirement: "Opcional",
    status: "A confirmar",
  },
];

export const VALIDATION_METRICS: ValidationMetric[] = [
  {
    id: "mae",
    name: "MAE",
    description: "Erro médio da variável contínua",
    direction: "Menor é melhor",
    required: true,
  },
  {
    id: "rmse",
    name: "RMSE",
    description: "Penalização de erros grandes",
    direction: "Menor é melhor",
    required: true,
  },
  {
    id: "recall",
    name: "Recall de evento",
    description: "Eventos detectados no horizonte",
    direction: "Maior é melhor",
    required: true,
  },
  {
    id: "false-alarm",
    name: "Falsos alarmes",
    description: "Alertas sem evento observado",
    direction: "Menor é melhor",
    required: true,
  },
  {
    id: "lead-time",
    name: "Antecedência média",
    description: "Tempo útil antes do evento",
    direction: "Maior é melhor",
    required: true,
  },
  {
    id: "calibration",
    name: "Calibração",
    description: "Confiabilidade das probabilidades",
    direction: "Maior é melhor",
    required: false,
  },
];

export const SCENARIOS = [
  {
    id: "historical",
    label: "Histórico · cheia regional",
    description: "Reproduz uma janela histórica com valores observados.",
  },
  {
    id: "stress",
    label: "Estresse · chuva persistente",
    description: "Aplica uma perturbação controlada na precipitação.",
  },
  {
    id: "missing",
    label: "Resiliência · fonte atrasada",
    description: "Simula atraso ou ausência de uma fonte contextual.",
  },
] as const;

export const MODEL_COMPARISON: ModelComparison[] = [
  {
    model: "LSTM Hidro",
    role: "Principal",
    score: 86.4,
    mae: "0,42",
    recall: "84%",
    lead: "4h 18m",
    calibration: "0,91",
    readiness: "Apto",
    tone: "mint",
  },
  {
    model: "Transformer",
    role: "Challenger",
    score: 84.8,
    mae: "0,46",
    recall: "87%",
    lead: "4h 06m",
    calibration: "0,88",
    readiness: "Em análise",
    tone: "violet",
  },
  {
    model: "GNN Bacias",
    role: "Challenger",
    score: 81.7,
    mae: "0,51",
    recall: "82%",
    lead: "3h 52m",
    calibration: "0,86",
    readiness: "Condicionado",
    tone: "amber",
  },
];

export const SCORE_PROFILES: Record<string, ScoreCriterion[]> = {
  "Inundação urbana": [
    {
      id: "recall",
      label: "Recall de evento",
      hint: "Prioriza reduzir eventos não detectados.",
      direction: "Maior é melhor",
      weight: 30,
    },
    {
      id: "lead-time",
      label: "Antecedência média",
      hint: "Valoriza tempo útil para decisão.",
      direction: "Maior é melhor",
      weight: 25,
    },
    {
      id: "false-alarm",
      label: "Falsos alarmes",
      hint: "Evita saturar a fila operacional.",
      direction: "Menor é melhor",
      weight: 20,
    },
    {
      id: "rmse",
      label: "RMSE",
      hint: "Penaliza desvios grandes de nível/vazão.",
      direction: "Menor é melhor",
      weight: 15,
    },
    {
      id: "calibration",
      label: "Calibração",
      hint: "Mantém probabilidades interpretáveis.",
      direction: "Maior é melhor",
      weight: 10,
    },
  ],
  "Cheia fluvial": [
    {
      id: "rmse",
      label: "RMSE",
      hint: "Prioriza aderência aos picos de vazão.",
      direction: "Menor é melhor",
      weight: 30,
    },
    {
      id: "mae",
      label: "MAE",
      hint: "Controla o erro médio da série.",
      direction: "Menor é melhor",
      weight: 25,
    },
    {
      id: "recall",
      label: "Recall de evento",
      hint: "Protege contra não detecção de cheias.",
      direction: "Maior é melhor",
      weight: 20,
    },
    {
      id: "lead-time",
      label: "Antecedência média",
      hint: "Sustenta preparação antecipada.",
      direction: "Maior é melhor",
      weight: 15,
    },
    {
      id: "calibration",
      label: "Calibração",
      hint: "Torna a probabilidade comparável.",
      direction: "Maior é melhor",
      weight: 10,
    },
  ],
  "Movimento de massa": [
    {
      id: "recall",
      label: "Recall de evento",
      hint: "Prioriza identificar situações críticas.",
      direction: "Maior é melhor",
      weight: 30,
    },
    {
      id: "calibration",
      label: "Calibração",
      hint: "Apoia confiança e abstention.",
      direction: "Maior é melhor",
      weight: 20,
    },
    {
      id: "false-alarm",
      label: "Falsos alarmes",
      hint: "Evita recomendações sem evidência.",
      direction: "Menor é melhor",
      weight: 20,
    },
    {
      id: "lead-time",
      label: "Antecedência média",
      hint: "Amplia a janela de resposta.",
      direction: "Maior é melhor",
      weight: 20,
    },
    {
      id: "mae",
      label: "MAE",
      hint: "Mantém erro contínuo sob controle.",
      direction: "Menor é melhor",
      weight: 10,
    },
  ],
};

export const APPROVAL_FLOW: ApprovalStage[] = [
  {
    role: "Administrador",
    action: "Rascunha pesos, gates e justificativa",
    owner: "Configuração",
  },
  {
    role: "Revisor técnico",
    action: "Verifica métricas, normalização e consistência",
    owner: "Validação",
  },
  {
    role: "Especialista do domínio",
    action: "Avalia impacto por tipo de risco",
    owner: "Decisão",
  },
  {
    role: "Administrador",
    action: "Publica a versão aprovada e sua vigência",
    owner: "Governança",
  },
];

export const MONITORING_MODELS = [
  {
    model: "LSTM Hidro",
    role: "Champion",
    score: "86,4",
    window: "30 dias",
    drift: "Controlado",
    driftTone: "mint",
    freshness: "6 min",
    status: "Saudável",
    statusTone: "mint",
    note: "Modelo principal · v0.9.4",
  },
  {
    model: "Transformer",
    role: "Challenger",
    score: "84,8",
    window: "30 dias",
    drift: "Atenção",
    driftTone: "amber",
    freshness: "6 min",
    status: "Em análise",
    statusTone: "amber",
    note: "Modo sombra · v0.4.1",
  },
  {
    model: "GNN Bacias",
    role: "Challenger",
    score: "81,7",
    window: "14 dias",
    drift: "Condicionado",
    driftTone: "violet",
    freshness: "18 min",
    status: "Dados insuficientes",
    statusTone: "violet",
    note: "Grafo regional parcial · v0.2.0",
  },
];

export const MONITORING_TREND = [
  68, 72, 71, 76, 79, 82, 81, 86, 84, 86, 88, 86,
];
