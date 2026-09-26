import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type CoveragePoint = {
  name: string;
  state: string;
  region: string;
  lat: number;
  lng: number;
  risk: string;
  type: string;
  score: number;
  rain: string;
  model: string;
  coverage: string;
  color: string;
};

type IframeCoverageMapProps = {
  points: CoveragePoint[];
  selected: string;
  onSelect: (name: string) => void;
  className?: string;
};

const MAP_CONFIG = { center: { lat: -14.235, lng: -51.9253 }, zoom: 4, tileSize: 256 };
const MAP_URL = "https://maps.google.com/maps?ll=-14.2350,-51.9253&z=4&output=embed";

function mercator(lat: number, lng: number, zoom: number) {
  const scale = MAP_CONFIG.tileSize * 2 ** zoom;
  const safeLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const sin = Math.sin((safeLat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function projectPoint(point: CoveragePoint, width: number, height: number) {
  const centerWorld = mercator(MAP_CONFIG.center.lat, MAP_CONFIG.center.lng, MAP_CONFIG.zoom);
  const currentWorld = mercator(point.lat, point.lng, MAP_CONFIG.zoom);
  return {
    left: width / 2 + (currentWorld.x - centerWorld.x),
    top: height / 2 + (currentWorld.y - centerWorld.y),
  };
}

export function MapView({ points, selected, onSelect, className }: IframeCoverageMapProps) {
  const [viewport, setViewport] = useState({ width: 900, height: 440 });
  const [ufFilter, setUfFilter] = useState("Todas");
  const [riskFilter, setRiskFilter] = useState("Todos");
  const [lastSync, setLastSync] = useState(() => new Date());
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const ufs = useMemo(() => ["Todas", ...Array.from(new Set(points.map((point) => point.state))).sort()], [points]);
  const risks = useMemo(() => ["Todos", ...Array.from(new Set(points.map((point) => point.risk))).sort()], [points]);
  const filteredPoints = useMemo(
    () => points.filter((point) => (ufFilter === "Todas" || point.state === ufFilter) && (riskFilter === "Todos" || point.risk === riskFilter)),
    [points, riskFilter, ufFilter],
  );

  useEffect(() => {
    const updateSize = () => {
      const element = document.querySelector<HTMLElement>(".iframe-map-frame");
      if (element) setViewport({ width: element.clientWidth, height: element.clientHeight });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    const element = document.querySelector<HTMLElement>(".iframe-map-frame");
    if (element) observer.observe(element);
    const timer = window.setInterval(() => setLastSync(new Date()), 30000);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className={cn("map-stage iframe-map-stage", className)}>
      <div className="map-toolbar iframe-map-toolbar">
        <div className="flex items-center gap-2"><span className="live-dot" /> <span className="text-xs font-semibold text-slate-200">Google Maps · Brasil</span></div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400"><span><i className="legend-dot" style={{ background: "#d9283e" }} /> Alto</span><span><i className="legend-dot" style={{ background: "#F37021" }} /> Crítico</span><span><i className="legend-dot" style={{ background: "#1d5fa7" }} /> Moderado</span></div>
      </div>
      <div className="iframe-map-frame fixed-brazil-viewport">
        <iframe
          title="Google Maps — Brasil, estados e municípios GeoHidro AI"
          className="iframe-google-map"
          src={MAP_URL}
          loading="eager"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          tabIndex={-1}
          aria-hidden="true"
        />
        <div className="iframe-city-layer" aria-label="Municípios monitorados pelo GeoHidro AI">
          {filteredPoints.map((point) => {
            const position = projectPoint(point, viewport.width, viewport.height);
            const isSelected = selected === point.name;
            const isHovered = hoveredCity === point.name;
            const tooltipPlacement = position.left > viewport.width - 150 ? "left" : position.left < 150 ? "right" : position.top < 110 ? "below" : "above";
            return (
              <button
                key={point.name}
                type="button"
                className={`iframe-city-marker ${isSelected ? "selected" : ""} ${isHovered ? "hovered" : ""}`}
                style={{ left: `${position.left}px`, top: `${position.top}px`, "--marker-color": point.color, "--tooltip-accent": point.color } as CSSProperties}
                onClick={() => onSelect(point.name)}
                onMouseEnter={() => setHoveredCity(point.name)}
                onMouseLeave={() => setHoveredCity(null)}
                onFocus={() => setHoveredCity(point.name)}
                onBlur={() => setHoveredCity(null)}
                aria-label={`${point.name}, ${point.state}, ${point.coverage}, risco ${point.risk}`}
              >
                <span className="iframe-city-pulse" />
                <span className="iframe-city-circle" />
                <span className={`iframe-city-tooltip tooltip-${tooltipPlacement}`} role="tooltip">
                  <strong>{point.name} - {point.state}</strong>
                  <small>Modelo: {point.model}</small>
                  <span className="iframe-tooltip-divider" />
                  <span className="iframe-tooltip-row"><span>P(Risco):</span><b>{point.score}%</b></span>
                  <span className="iframe-tooltip-row"><span>Impacto 24h:</span><b>{point.rain}</b></span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="iframe-map-filters">
          <label>UF<select value={ufFilter} onChange={(event) => setUfFilter(event.target.value)}>{ufs.map((uf) => <option key={uf}>{uf}</option>)}</select></label>
          <label>Risco<select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>{risks.map((risk) => <option key={risk}>{risk}</option>)}</select></label>
          <span className="iframe-map-count">{filteredPoints.length} / {points.length} municípios</span>
        </div>
      </div>
      <div className="map-footnote"><span className="flex items-center gap-2">Camada fixa · círculos por latitude/longitude · sem API key no front-end</span><span className="font-mono text-[10px] text-slate-500">SYNC {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span></div>
    </div>
  );
}
