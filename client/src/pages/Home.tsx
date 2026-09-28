import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  BellRing,
  Bot,
  Check,
  ChevronRight,
  CloudRain,
  Database,
  Gauge,
  GitBranch,
  Globe2,
  Layers3,
  Map as MapIcon,
  Menu,
  MoreHorizontal,
  RadioTower,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Timer,
  TriangleAlert,
  Users,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView, type CoveragePoint } from "@/components/Map";
import { riskColor, riskPriority, riskUiClass } from "@/lib/risk";

const coverageData = [
  { year: "BASE", value: 1133, label: "PN-PDC" },
  { year: "2026", value: 1295, label: "atual" },
  { year: "2027", value: 1500, label: "marco" },
  { year: "2031", value: 2240, label: "marco" },
  { year: "2035", value: 2500, label: "meta" },
];

const municipalities = [
  { name: "Petrópolis", state: "RJ", region: "SE", lat: -22.505, lng: -43.178, risk: "Crítico", type: "Movimento de massa", score: 96.5, rain: "125mm", model: "CNN Espacial", coverage: "Piloto", color: riskColor("Crítico") },
  { name: "Blumenau", state: "SC", region: "S", lat: -26.919, lng: -49.066, risk: "Alto", type: "Inundação", score: 81, rain: "85mm", model: "LSTM Hidro", coverage: "Monitorado", color: riskColor("Alto") },
  { name: "São Sebastião", state: "SP", region: "SE", lat: -23.760, lng: -45.412, risk: "Moderado", type: "Movimento de massa", score: 12, rain: "10mm", model: "LSTM Hidro", coverage: "Monitorado", color: riskColor("Moderado") },
  { name: "Recife", state: "PE", region: "NE", lat: -8.047, lng: -34.877, risk: "Alto", type: "Alagamento", score: 75.4, rain: "60mm", model: "Ensemble", coverage: "Monitorado", color: riskColor("Alto") },
  { name: "Belo Horizonte", state: "MG", region: "SE", lat: -19.916, lng: -43.934, risk: "Moderado", type: "Movimento de massa", score: 5.2, rain: "0mm", model: "CNN Espacial", coverage: "Monitorado", color: riskColor("Moderado") },
  { name: "Manaus", state: "AM", region: "N", lat: -3.119, lng: -60.021, risk: "Moderado", type: "Cheia fluvial", score: 22.1, rain: "15mm", model: "LSTM Hidro", coverage: "Monitorado", color: riskColor("Moderado") },
  { name: "Goiânia", state: "GO", region: "CO", lat: -16.686, lng: -49.264, risk: "Moderado", type: "Enxurrada", score: 8, rain: "0mm", model: "LSTM Hidro", coverage: "Monitorado", color: riskColor("Moderado") },
  { name: "Rio Branco", state: "AC", region: "N", lat: -9.975, lng: -67.824, risk: "Crítico", type: "Cheia fluvial", score: 94.2, rain: "Nível Rio Crítico", model: "GNN Bacias", coverage: "Piloto", color: riskColor("Crítico") },
  { name: "Porto Alegre", state: "RS", region: "S", lat: -30.034, lng: -51.217, risk: "Alto", type: "Inundação", score: 88.3, rain: "100mm", model: "Ensemble", coverage: "Piloto", color: riskColor("Alto") },
  { name: "Salvador", state: "BA", region: "NE", lat: -12.971, lng: -38.512, risk: "Moderado", type: "Alagamento", score: 18.5, rain: "5mm", model: "CNN Espacial", coverage: "Monitorado", color: riskColor("Moderado") },
  { name: "Vitória", state: "ES", region: "SE", lat: -20.315, lng: -40.312, risk: "Moderado", type: "Alagamento", score: 10, rain: "2mm", model: "CNN Espacial", coverage: "Monitorado", color: riskColor("Moderado") },
] satisfies CoveragePoint[];

const alertsSeed = [
  { id: "GH-2409", place: "Petrópolis · RJ", type: "Movimento de massa", level: "Crítico", probability: 86, lead: "04h 18m", status: "Pendente", color: riskUiClass("Crítico"), icon: TriangleAlert, reason: "Chuva antecedente + solo saturado" },
  { id: "GH-2398", place: "Blumenau · SC", type: "Elevação de nível", level: "Alto", probability: 71, lead: "07h 42m", status: "Em análise", color: riskUiClass("Alto"), icon: Waves, reason: "Precipitação acumulada na bacia" },
  { id: "GH-2386", place: "Porto Alegre · RS", type: "Inundação", level: "Alto", probability: 92, lead: "02h 05m", status: "Pendente", color: riskUiClass("Alto"), icon: CloudRain, reason: "Vazão acima do percentil 95" },
];

type AlertItem = (typeof alertsSeed)[number];

type View = "overview" | "municipalities" | "alerts" | "architecture";

const riskClass = riskUiClass;

function MetricCard({ label, value, detail, accent, icon: Icon, progress }: { label: string; value: string; detail: string; accent: string; icon: typeof Activity; progress?: number }) {
  return (
    <div className="gh-card metric-card group">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="metric-value mt-2">{value}</p>
        </div>
        <div className="icon-orb" style={{ color: accent, background: `${accent}12`, borderColor: `${accent}30` }}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="metric-detail">{detail}</span>
        {progress !== undefined && <span className="text-[11px] font-semibold" style={{ color: accent }}>{progress}%</span>}
      </div>
      {progress !== undefined && (
        <div className="progress-track mt-3"><div className="progress-fill" style={{ width: `${progress}%`, background: accent }} /></div>
      )}
    </div>
  );
}

function BrazilMap({ selected, onSelect }: { selected: string; onSelect: (name: string) => void }) {
  return <MapView points={municipalities} selected={selected} onSelect={onSelect} />;
}

function CoveragePanel() {
  const max = 2500;
  return (
    <div className="gh-card coverage-panel">
      <div className="flex items-start justify-between"><div><p className="eyebrow">Trajetória da meta</p><h3 className="panel-title mt-1">Expansão de municípios monitorados</h3></div><span className="status-chip mint"><Target size={13} /> Meta 2.2.4</span></div>
      <div className="coverage-chart mt-7">
        <div className="chart-y"><span>2.500</span><span>1.875</span><span>1.250</span><span>625</span><span>0</span></div>
        <div className="chart-bars">
          <div className="chart-line" />
          <div className="chart-line second" />
          <div className="chart-line third" />
          {coverageData.map((item, index) => <div className="bar-column" key={item.year}><div className={`bar ${index === coverageData.length - 1 ? "target" : index === 1 ? "current" : ""}`} style={{ height: `${(item.value / max) * 100}%` }}><span>{item.value.toLocaleString("pt-BR")}</span></div><span className="bar-label">{item.year}</span><span className="bar-sub">{item.label}</span></div>)}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/[.07] pt-4"><span className="text-xs text-slate-400">Progresso sobre a meta final</span><span className="font-mono text-sm font-bold text-cyan-200">51,8%</span></div>
    </div>
  );
}

function MavPanel() {
  const mavCurrent = 120;
  const referenceGap = 1205;
  const mavProgress = (mavCurrent / referenceGap) * 100;

  return (
    <div className="gh-card mav-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">MAV · validação para expansão assistida por IA</p>
          <h3 className="panel-title mt-1">Municípios adicionais validados</h3>
        </div>
        <span className="status-chip amber"><ShieldCheck size={13} /> Indicador próprio</span>
      </div>
      <div className="mav-content">
        <div className="mav-kpi">
          <span className="mav-number">{mavCurrent}</span>
          <span className="mav-label">municípios adicionais validados</span>
          <span className="mav-subline">Aptos à integração operacional após validação técnica</span>
        </div>
        <div className="mav-chart" tabIndex={0} role="img" aria-label={`MAV atual: ${mavCurrent} municípios validados de uma lacuna de referência de ${referenceGap}`}>
          <div className="mav-tooltip">
            <strong>MAV — Municípios Adicionais Validados</strong>
            <span>Municípios que concluíram os gates técnicos e estão aptos à integração operacional.</span>
            <span>MAV atual: <b>{mavCurrent}</b></span>
            <span>Lacuna de referência: <b>{referenceGap.toLocaleString("pt-BR")}</b> municípios</span>
            <small>Indicador interno do projeto — não representa cobertura oficial do Cemaden.</small>
          </div>
          <div className="mav-progress-track">
            <div className="mav-progress-base" />
            <div className="mav-progress-fill" style={{ width: `${mavProgress}%` }} />
            <span className="mav-progress-marker" style={{ left: `${mavProgress}%` }} />
            <span className="mav-progress-end" />
          </div>
          <div className="mav-scale"><span>0</span><span>MAV atual · {mavCurrent}</span><span>{referenceGap.toLocaleString("pt-BR")} · gap até 2035</span></div>
          <div className="mav-progress-caption"><span>Progresso MAV</span><strong>{mavProgress.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</strong></div>
        </div>
      </div>
      <div className="mav-footnote"><span><Sparkles size={13} /> A IA recomenda; o especialista decide.</span><span>Não é indicador oficial do PN-PDC</span></div>
    </div>
  );
}

function AlertQueue({ alerts, onAction, compact = false }: { alerts: AlertItem[]; onAction: (id: string, action: string) => void; compact?: boolean }) {
  const orderedAlerts = [...alerts].sort((a, b) => {
    return riskPriority(a.level) - riskPriority(b.level) || b.probability - a.probability;
  });
  return (
    <div className={`gh-card alert-panel ${compact ? "compact" : ""}`}>
      <div className="flex items-start justify-between"><div><p className="eyebrow">Human-in-the-loop</p><h3 className="panel-title mt-1">Fila operacional</h3></div><span className="status-chip coral"><span className="pulse-dot" /> {alerts.filter((a) => a.status !== "Aprovado").length} pendentes</span></div>
      <div className="mt-5 space-y-3">{orderedAlerts.map((alert) => { const Icon = alert.icon; return <div className="alert-row" key={alert.id}><div className={`alert-icon ${alert.color}`}><Icon size={16} /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-semibold text-slate-100">{alert.place}</p><p className="mt-0.5 text-[11px] text-slate-500">{alert.type} · {alert.id}</p></div><span className={`risk-pill ${alert.color}`}>{alert.level}</span></div><div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400"><span className="flex items-center gap-1"><Gauge size={12} className="text-cyan-300" /> {alert.probability}%</span><span className="flex items-center gap-1"><Timer size={12} className="text-amber-300" /> {alert.lead}</span><span className="truncate text-slate-500">{alert.reason}</span></div>{!compact && <div className="mt-3 flex items-center gap-2"><Button size="sm" className="h-7 bg-cyan-400 px-3 text-[11px] font-bold text-slate-950 hover:bg-cyan-300" onClick={() => onAction(alert.id, "aprovar")}><Check size={13} /> Aprovar</Button><Button size="sm" variant="outline" className="h-7 border-white/10 bg-transparent px-3 text-[11px] text-slate-300 hover:bg-white/5" onClick={() => onAction(alert.id, "reavaliar")}><RefreshCw size={13} /> Reavaliar</Button><Button size="sm" variant="outline" className="h-7 border-white/10 bg-transparent px-2 text-slate-400 hover:bg-white/5" onClick={() => onAction(alert.id, "rejeitar")}><X size={13} /></Button></div>}</div></div>; })}</div>
      <button className="panel-link mt-5" onClick={() => toast.info("A fila completa de alertas será conectada ao serviço operacional.")}><span>Ver todos os alertas</span><ArrowUpRight size={14} /></button>
    </div>
  );
}

function DataHealth() {
  const rows = [
    { source: "Pluviômetros", status: "Estável", freshness: "2 min", quality: 99.2, color: "mint" },
    { source: "Radar meteorológico", status: "Estável", freshness: "5 min", quality: 96.8, color: "mint" },
    { source: "Umidade do solo", status: "Atenção", freshness: "18 min", quality: 91.4, color: "amber" },
    { source: "Mapas de suscetibilidade", status: "Estável", freshness: "1 dia", quality: 98.6, color: "mint" },
  ];
  return <div className="gh-card data-panel"><div className="flex items-start justify-between"><div><p className="eyebrow">Observabilidade do dado</p><h3 className="panel-title mt-1">Saúde das fontes</h3></div><button className="icon-button" onClick={() => toast.success("Catálogo sincronizado", { description: "4 fontes verificadas agora." })}><RefreshCw size={16} /></button></div><div className="mt-5 space-y-1">{rows.map((row) => <div className="data-row" key={row.source}><div className="flex min-w-0 items-center gap-3"><div className={`source-dot ${row.color}`} /><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-200">{row.source}</p><p className="mt-0.5 text-[10px] text-slate-500">Atualizado há {row.freshness}</p></div></div><div className="text-right"><span className={`text-[10px] font-semibold ${row.color === "amber" ? "text-amber-300" : "text-emerald-300"}`}>{row.status}</span><p className="mt-0.5 font-mono text-[10px] text-slate-500">{row.quality}% qualidade</p></div></div>)}</div><div className="mt-4 flex items-center gap-2 rounded-lg border border-cyan-300/10 bg-cyan-300/[.04] px-3 py-2 text-[10px] leading-relaxed text-slate-400"><ShieldCheck size={14} className="shrink-0 text-cyan-300" /> Lineage ativo: cada inferência registra dados, versão do modelo e justificativa.</div></div>;
}

function ArchitectureView() {
  const layers = [
    { title: "Fontes & borda", tag: "ENTRADA", color: "cyan", icon: RadioTower, items: ["Pluviômetros · IoT", "Radar & satélite", "Rio · solo · relevo"] },
    { title: "Ingestão & qualidade", tag: "STREAMING", color: "violet", icon: Zap, items: ["APIs · MQTT · Event bus", "Validação & georreferência", "Detecção de anomalia"] },
    { title: "Lakehouse geo", tag: "ARMAZENAMENTO", color: "amber", icon: Database, items: ["PostGIS + séries temporais", "Feature store + lineage", "Registry de modelos"] },
    { title: "Modelos probabilísticos", tag: "INFERÊNCIA", color: "coral", icon: Bot, items: ["LSTM · Transformer · GNN", "Hidrológico + geológico", "Calibração & incerteza"] },
    { title: "Analista Cemaden", tag: "SAÍDA", color: "mint", icon: Users, items: ["Mapa · evidências · risco", "Aprovar / reavaliar / rejeitar", "Cenad · Defesa Civil"] },
  ];
  return <div className="space-y-6"><div className="page-heading"><div><p className="eyebrow">Arquitetura de referência</p><h2>Do sensor à decisão auditável.</h2><p>Uma cadeia distribuída, observável e supervisionada para ampliar a cobertura sem substituir a autoridade técnica.</p></div><span className="status-chip violet"><GitBranch size={13} /> v0.9 · blueprint</span></div><div className="arch-canvas"><div className="arch-topline"><span><span className="live-dot" /> pipeline online</span><span className="font-mono text-[10px] text-slate-500">TRACE GH-2409</span></div><div className="arch-flow">{layers.map((layer, index) => { const Icon = layer.icon; return <div className="arch-step-wrap" key={layer.title}><div className={`arch-step ${layer.color}`}><div className="flex items-start justify-between"><div className="arch-icon"><Icon size={17} /></div><span className="arch-tag">{layer.tag}</span></div><h3>{layer.title}</h3><ul>{layer.items.map((item) => <li key={item}><span />{item}</li>)}</ul></div>{index < layers.length - 1 && <div className="arch-arrow"><ChevronRight size={18} /></div>}</div>; })}</div><div className="arch-crosscut"><span><Activity size={14} /> Observabilidade</span><span><ShieldCheck size={14} /> Segurança & Zero Trust</span><span><GitBranch size={14} /> MLOps & auditoria</span><span><Globe2 size={14} /> Escala nacional</span></div></div><div className="grid gap-4 md:grid-cols-3"><div className="gh-card mini-spec"><p className="eyebrow">Entrada</p><p>Chuva, nível/vazão, radar, satélite, solo, relevo, geologia, uso do solo e ocorrências.</p></div><div className="gh-card mini-spec"><p className="eyebrow">Processamento</p><p>Ingestão → validação → features → inferência → calibração → fusão → guardrails.</p></div><div className="gh-card mini-spec"><p className="eyebrow">Saída</p><p>Probabilidade, incerteza, evidências e recomendação para validação humana.</p></div></div></div>;
}

function MunicipalitiesView({ onSelect }: { onSelect: (name: string) => void }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filteredMunicipalities = municipalities.filter((city) => `${city.name} ${city.state}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery));

  return <div className="space-y-6"><div className="page-heading"><div><p className="eyebrow">Catálogo territorial</p><h2>Municípios em foco.</h2><p>Camada demonstrativa para priorização da expansão assistida por IA.</p></div><Button className="bg-cyan-400 font-bold text-slate-950 hover:bg-cyan-300" onClick={() => toast.info("Exportação demonstrativa", { description: "O relatório será gerado com a linhagem das fontes." })}>Exportar visão <ArrowUpRight size={15} /></Button></div><div className="gh-card overflow-hidden"><div className="table-toolbar"><div className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar município ou estado" aria-label="Buscar município ou estado" /></div><button className="filter-button"><SlidersHorizontal size={14} /> Filtros <span>{filteredMunicipalities.length}</span></button></div><div className="overflow-x-auto"><table className="gh-table"><thead><tr><th>Município</th><th>Tipologia dominante</th><th>Risco</th><th>Cobertura</th><th>Score GeoHidro</th><th /></tr></thead><tbody>{filteredMunicipalities.length > 0 ? filteredMunicipalities.map((city) => <tr key={city.name}><td><button className="table-place" onClick={() => onSelect(city.name)}><span className="table-avatar" style={{ background: `${city.color}20`, color: city.color }}>{city.state}</span><span><strong>{city.name}</strong><small>{city.state} · atualizado há 6 min</small></span></button></td><td>{city.type}</td><td><span className={`risk-pill ${riskClass(city.risk)}`}>{city.risk}</span></td><td><span className={`coverage-label ${city.coverage.toLowerCase()}`}>{city.coverage}</span></td><td><div className="score-cell"><span>{city.score}</span><div><i style={{ width: `${city.score}%` }} /></div></div></td><td><MoreHorizontal size={17} className="text-slate-500" /></td></tr>) : <tr><td colSpan={6} className="py-10 text-center text-xs text-slate-500">Nenhum município ou estado encontrado.</td></tr>}</tbody></table></div></div></div>;
}

function AppOverview({ selected, onSelect, alerts, onAction }: { selected: string; onSelect: (name: string) => void; alerts: AlertItem[]; onAction: (id: string, action: string) => void }) {
  return <div className="space-y-6"><div className="hero-strip"><div><div className="flex items-center gap-2"><span className="status-chip coral"><span className="pulse-dot" /> Operação assistida</span><span className="text-[11px] text-slate-500">24/7 · traceável</span></div><h2 className="mt-4 max-w-3xl">Mais território observado.<br /><em>Mais tempo para decidir.</em></h2><p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">O GeoHidro AI combina dados geo-hidrológicos e modelos probabilísticos para ampliar o monitoramento, mantendo a decisão final com o especialista.</p></div><div className="hero-orbit"><div className="orbit-ring one" /><div className="orbit-ring two" /><div className="orbit-core"><Sparkles size={24} /></div><span className="orbit-label top">IA + dados</span><span className="orbit-label bottom">human-in-the-loop</span></div></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Municípios monitorados" value="1.295" detail="+162 desde a linha de base" accent="#6ee7b7" icon={MapIcon} progress={51.8} /><MetricCard label="Lacuna até 2035" value="1.205" detail="48,2% da meta final" accent="#ffb454" icon={Target} /><MetricCard label="Alertas em análise" value="03" detail="1 crítico · 2 altos" accent="#f36a4f" icon={BellRing} /><MetricCard label="Saúde do pipeline" value="98,6%" detail="p95 inferência · 2,4 s" accent="#8ca6ff" icon={Activity} /></div><div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><div className="gh-card map-panel"><div className="flex items-start justify-between"><div><p className="eyebrow">Visão territorial</p><h3 className="panel-title mt-1">Cobertura GeoHidro AI</h3></div><div className="flex gap-2"><button className="icon-button" onClick={() => toast.success("Camadas atualizadas", { description: "Risco, cobertura e exposição sincronizados." })}><RefreshCw size={15} /></button><button className="icon-button" onClick={() => toast.info("Filtros de mapa", { description: "Camadas demonstrativas disponíveis no próximo release." })}><SlidersHorizontal size={15} /></button></div></div><div className="mt-5"><BrazilMap selected={selected} onSelect={onSelect} /></div></div><AlertQueue alerts={alerts} onAction={onAction} /></div><div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="space-y-6"><CoveragePanel /><MavPanel /></div><DataHealth /></div></div>;
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState("");
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsSeed);
  const [simulating, setSimulating] = useState(false);
  const selectedCity = useMemo(() => municipalities.find((item) => item.name === selected) ?? municipalities[0], [selected]);

  const handleAction = (id: string, action: string) => {
    setAlerts((current) => current.map((item) => item.id === id ? { ...item, status: action === "aprovar" ? "Aprovado" : action === "rejeitar" ? "Rejeitado" : "Reavaliar" } : item));
    toast.success(action === "aprovar" ? "Recomendação aprovada" : action === "rejeitar" ? "Recomendação rejeitada" : "Alerta enviado para reavaliação", { description: `${id} · decisão registrada na trilha de auditoria.` });
  };

  const runSimulation = () => {
    setSimulating(true);
    toast.info("Simulação de ingestão iniciada", { description: "Reproduzindo dados de chuva e nível para o município selecionado." });
    window.setTimeout(() => { setSimulating(false); toast.success("Pipeline concluído", { description: `${selectedCity.name} · features atualizadas · modelo v0.9.4.` }); }, 1400);
  };

  const nav = [
    { id: "overview" as View, label: "Visão operacional", icon: Activity },
    { id: "municipalities" as View, label: "Municípios", icon: MapIcon },
    { id: "alerts" as View, label: "Fila de alertas", icon: BellRing, count: alerts.filter((a) => a.status !== "Aprovado").length },
    { id: "architecture" as View, label: "Arquitetura", icon: GitBranch },
  ];

  return <div className="min-h-screen bg-[#07131c] text-slate-100"><aside className="gh-sidebar"><div className="brand-lockup"><div className="brand-mark"><Waves size={20} /></div><div><p className="brand-name">GeoHidro <span>AI</span></p><p className="brand-sub">DECISION CONSOLE</p></div></div><div className="sidebar-divider" /><p className="sidebar-label">Monitoramento</p><nav className="sidebar-nav">{nav.map((item) => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => setView(item.id)}><Icon size={17} strokeWidth={view === item.id ? 2.2 : 1.7} /><span>{item.label}</span>{item.count !== undefined && <b>{item.count}</b>}</button>; })}</nav><div className="sidebar-bottom"><div className="goal-card"><div className="flex items-center justify-between"><span className="eyebrow">Meta PN-PDC</span><Target size={15} className="text-cyan-300" /></div><p className="mt-3 text-sm font-semibold text-slate-100">2.2.4</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500">2.500 municípios monitorados até 2035</p><div className="progress-track mt-3"><div className="progress-fill" style={{ width: "51.8%", background: "#6ee7b7" }} /></div><div className="mt-2 flex justify-between font-mono text-[10px] text-slate-500"><span>1.295</span><span>2.500</span></div></div><div className="user-chip"><div className="avatar">RK</div><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-200">Rodério Kunz</p><p className="truncate text-[10px] text-slate-500">Analista · Cemaden</p></div><MoreHorizontal size={15} className="ml-auto text-slate-500" /></div></div></aside><main className="gh-main"><header className="topbar"><div className="flex items-center gap-3"><button className="mobile-menu icon-button"><Menu size={18} /></button><div className="breadcrumb"><span>GeoHidro AI</span><ChevronRight size={13} /><strong>{nav.find((item) => item.id === view)?.label}</strong></div></div><div className="topbar-actions"><span className="system-status"><i /> Sistema estável</span><span className="topbar-time">09:41:22 UTC</span><button className="icon-button" onClick={() => toast.info("Centro de notificações", { description: "Nenhuma nova notificação crítica." })}><BellRing size={16} /></button></div></header><div className="page-content">{view === "overview" && <AppOverview selected={selected} onSelect={setSelected} alerts={alerts} onAction={handleAction} />}{view === "municipalities" && <MunicipalitiesView onSelect={(name) => { setSelected(name); setView("overview"); toast.info(`${name} selecionado`, { description: "Visão territorial atualizada." }); }} />}{view === "alerts" && <div className="space-y-6"><div className="page-heading"><div><p className="eyebrow">Decisão supervisionada</p><h2>Fila de alertas.</h2><p>O modelo recomenda. O especialista decide. Cada ação deixa uma evidência.</p></div><Button className="bg-cyan-400 font-bold text-slate-950 hover:bg-cyan-300" onClick={runSimulation} disabled={simulating}>{simulating ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />} {simulating ? "Processando" : "Simular ingestão"}</Button></div><div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><AlertQueue alerts={alerts} onAction={handleAction} /><div className="gh-card detail-card"><p className="eyebrow">Contexto de evidência</p><h3 className="panel-title mt-1">{selectedCity.name} · {selectedCity.state}</h3><div className="detail-risk"><div><span className="text-[11px] text-slate-500">Risco composto</span><p className="mt-1 text-4xl font-bold" style={{ color: selectedCity.color }}>{selectedCity.score}<small>/100</small></p></div><div className={`risk-orbit ${riskClass(selectedCity.risk)}`}><div style={{ transform: `rotate(${selectedCity.score * 3.6}deg)` }} /><span>{selectedCity.risk}</span></div></div><div className="evidence-list"><div><span>Chuva antecedente</span><strong>+38%</strong></div><div><span>Umidade do solo</span><strong>0,82 m³/m³</strong></div><div><span>Confiança calibrada</span><strong className="text-emerald-300">0,86</strong></div><div><span>Modelo / versão</span><strong className="font-mono text-[10px]">GH-HYDRO · v0.9.4</strong></div></div><button className="panel-link mt-5" onClick={() => toast.info("Lineage da inferência", { description: "Inputs, features e versão do modelo estão disponíveis no registro." })}><span>Ver trilha completa</span><ArrowUpRight size={14} /></button></div></div></div>}{view === "architecture" && <ArchitectureView />}</div></main></div>;
}
