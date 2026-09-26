export type RiskLevel = "Crítico" | "Alto" | "Moderado";

export const RISK_LEVELS: RiskLevel[] = ["Crítico", "Alto", "Moderado"];

export const RISK_PRIORITY: Record<RiskLevel, number> = {
  Crítico: 0,
  Alto: 1,
  Moderado: 2,
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  Crítico: "#d9283e",
  Alto: "#F37021",
  Moderado: "#1d5fa7",
};

export const RISK_UI_CLASS: Record<RiskLevel, "red" | "coral" | "blue"> = {
  Crítico: "red",
  Alto: "coral",
  Moderado: "blue",
};

export function riskPriority(level: string) {
  return RISK_PRIORITY[level as RiskLevel] ?? 99;
}

export function riskColor(level: string) {
  return RISK_COLORS[level as RiskLevel] ?? RISK_COLORS.Moderado;
}

export function riskUiClass(level: string) {
  return RISK_UI_CLASS[level as RiskLevel] ?? RISK_UI_CLASS.Moderado;
}
