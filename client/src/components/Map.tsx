import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

export type CoveragePoint = {
  name: string;
  state: string;
  lat: number;
  lng: number;
  risk: string;
  type: string;
  score: number;
  coverage: string;
  color: string;
};

type IframeCoverageMapProps = {
  points: CoveragePoint[];
  selected: string;
  onSelect: (name: string) => void;
  className?: string;
};

type LatLng = { lat: number; lng: number };
const MAP_CONFIG = { center: { lat: -14.2, lng: -51.9 }, zoom: 4, tileSize: 256 };

function mercator(lat: number, lng: number, zoom: number) {
  const scale = MAP_CONFIG.tileSize * 2 ** zoom;
  const safeLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const sin = Math.sin((safeLat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function inverseMercator(x: number, y: number, zoom: number): LatLng {
  const scale = MAP_CONFIG.tileSize * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  return { lat: (180 / Math.PI) * Math.atan(Math.sinh(n)), lng: ((lng + 540) % 360) - 180 };
}

function projectPoint(point: CoveragePoint, center: LatLng, zoom: number, width: number, height: number) {
  const centerWorld = mercator(center.lat, center.lng, zoom);
  const currentWorld = mercator(point.lat, point.lng, zoom);
  const scale = 2 ** (zoom - MAP_CONFIG.zoom);
  return {
    left: width / 2 + (currentWorld.x - centerWorld.x) * scale,
    top: height / 2 + (currentWorld.y - centerWorld.y) * scale,
  };
}

function mapUrl(center: LatLng, zoom: number) {
  return `https://maps.google.com/maps?ll=${center.lat.toFixed(5)},${center.lng.toFixed(5)}&z=${zoom}&output=embed`;
}

export function MapView({ points, selected, onSelect, className }: IframeCoverageMapProps) {
  const [viewport, setViewport] = useState({ width: 900, height: 440 });
  const [ufFilter, setUfFilter] = useState("Todas");
  const [riskFilter, setRiskFilter] = useState("Todos");
  const [mapCenter, setMapCenter] = useState<LatLng>(MAP_CONFIG.center);
  const [mapZoom, setMapZoom] = useState(MAP_CONFIG.zoom);
  const [iframeCenter, setIframeCenter] = useState<LatLng>(MAP_CONFIG.center);
  const [iframeZoom, setIframeZoom] = useState(MAP_CONFIG.zoom);
  const [isDragging, setIsDragging] = useState(false);
  const [lastSync, setLastSync] = useState(() => new Date());
  const dragRef = useRef({ x: 0, y: 0, center: MAP_CONFIG.center, currentCenter: MAP_CONFIG.center });

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

  const syncIframe = (center: LatLng, zoom: number) => {
    setIframeCenter(center);
    setIframeZoom(zoom);
    setLastSync(new Date());
  };

  const zoomMap = (delta: number) => {
    const nextZoom = Math.max(3, Math.min(8, mapZoom + delta));
    setMapZoom(nextZoom);
    syncIframe(mapCenter, nextZoom);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, center: mapCenter, currentCenter: mapCenter };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const scale = 2 ** (mapZoom - MAP_CONFIG.zoom);
    const centerWorld = mercator(dragRef.current.center.lat, dragRef.current.center.lng, mapZoom);
    const nextCenter = inverseMercator(centerWorld.x - (event.clientX - dragRef.current.x) / scale, centerWorld.y - (event.clientY - dragRef.current.y) / scale, mapZoom);
    dragRef.current.currentCenter = nextCenter;
    setMapCenter(nextCenter);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    syncIframe(dragRef.current.currentCenter, mapZoom);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoomMap(event.deltaY < 0 ? 1 : -1);
  };

  return (
    <div className={cn("map-stage iframe-map-stage", className)}>
      <div className="map-toolbar iframe-map-toolbar">
        <div className="flex items-center gap-2"><span className="live-dot" /> <span className="text-xs font-semibold text-slate-200">Google Maps · camada GeoHidro AI</span></div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400"><span><i className="legend-dot" style={{ background: "#ef4444" }} /> Crítico/alto</span><span><i className="legend-dot" style={{ background: "#ffc857" }} /> Monitorado</span><span><i className="legend-dot" style={{ background: "#6ee7b7" }} /> Candidato</span></div>
      </div>
      <div className="iframe-map-frame">
        <iframe
          title="Google Maps — Brasil e municípios GeoHidro AI"
          className="iframe-google-map"
          src={mapUrl(iframeCenter, iframeZoom)}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className={`iframe-map-interaction ${isDragging ? "dragging" : ""}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel} aria-label="Arraste para navegar no mapa e use a roda do mouse para zoom" />
        <div className="iframe-city-layer" aria-label="Municípios monitorados pelo GeoHidro AI">
          {filteredPoints.map((point) => {
            const position = projectPoint(point, mapCenter, mapZoom, viewport.width, viewport.height);
            const isSelected = selected === point.name;
            return (
              <button
                key={point.name}
                type="button"
                className={`iframe-city-marker ${isSelected ? "selected" : ""}`}
                style={{ left: `${position.left}px`, top: `${position.top}px`, "--marker-color": point.color } as CSSProperties}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onSelect(point.name)}
                aria-label={`${point.name}, ${point.state}, ${point.coverage}, risco ${point.risk}`}
              >
                <span className="iframe-city-pulse" />
                <span className="iframe-city-circle" />
                <span className="iframe-city-tooltip"><strong>{point.name} · {point.state}</strong><small>{point.coverage} · {point.risk} · score {point.score}</small><em>{point.type}</em></span>
              </button>
            );
          })}
        </div>
        <div className="iframe-map-controls" aria-label="Controles de navegação do mapa">
          <button type="button" onClick={() => zoomMap(1)} aria-label="Aumentar zoom">+</button>
          <button type="button" onClick={() => zoomMap(-1)} aria-label="Reduzir zoom">−</button>
          <button type="button" onClick={() => { setMapCenter(MAP_CONFIG.center); setMapZoom(MAP_CONFIG.zoom); syncIframe(MAP_CONFIG.center, MAP_CONFIG.zoom); }} aria-label="Voltar para o Brasil">⌖</button>
        </div>
        <div className="iframe-map-hint">Arraste para navegar · roda do mouse para zoom · {mapZoom}x</div>
        <div className="iframe-map-filters">
          <label>UF<select value={ufFilter} onChange={(event) => setUfFilter(event.target.value)}>{ufs.map((uf) => <option key={uf}>{uf}</option>)}</select></label>
          <label>Risco<select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>{risks.map((risk) => <option key={risk}>{risk}</option>)}</select></label>
          <span className="iframe-map-count">{filteredPoints.length} / {points.length} municípios</span>
        </div>
      </div>
      <div className="map-footnote"><span className="flex items-center gap-2">Círculos por latitude/longitude · sem API key no front-end</span><span className="font-mono text-[10px] text-slate-500">SYNC {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span></div>
    </div>
  );
}
