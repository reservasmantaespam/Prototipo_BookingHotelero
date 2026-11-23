import { tx, useLang } from "./i18n";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import { calculateDistanceKm, formatDistanceString, type Hotel } from "./mantaHotels";

export interface ParishSector {
  id: string;
  name: string;
  query: string;
  type: "Parroquia Urbana" | "Parroquia Rural";
  lat: number;
  lng: number;
  zoom: number;
  hotels: number;
  icon: string;
  badge: string;
  desc: string;
  highlights: string[];
}

export const MANTA_OFFICIAL_SECTORS: ParishSector[] = [
  {
    id: "manta",
    name: "Manta (Matriz)",
    query: "Manta",
    type: "Parroquia Urbana",
    lat: -0.9525,
    lng: -80.7300,
    zoom: 14,
    hotels: 66,
    icon: "",
    badge: "Urbana · Barbasquillo & Murciélago",
    desc: "Zona hotelera y comercial de Manta: Barbasquillo, Malecón Escénico y Playa El Murciélago.",
    highlights: ["Barbasquillo", "Playa El Murciélago", "Malecón Escénico", "Centro"],
  },
  {
    id: "tarqui",
    name: "Tarqui",
    query: "Tarqui",
    type: "Parroquia Urbana",
    lat: -0.9565,
    lng: -80.7080,
    zoom: 14,
    hotels: 16,
    icon: "",
    badge: "Urbana · Playa & Gastronomía",
    desc: "Zona comercial y hotelera tradicional cerca de Playa Tarqui.",
    highlights: ["Playa Tarqui", "Comercio Tradicional"],
  },
  {
    id: "los-esteros",
    name: "Los Esteros",
    query: "Los Esteros",
    type: "Parroquia Urbana",
    lat: -0.9570,
    lng: -80.6860,
    zoom: 14,
    hotels: 21,
    icon: "",
    badge: "Urbana · Zona Norte & Aeropuerto",
    desc: "Zona costera norte cercana al Aeropuerto Eloy Alfaro.",
    highlights: ["Playas del Norte", "Aeropuerto"],
  },
  {
    id: "san-mateo",
    name: "San Mateo",
    query: "San Mateo",
    type: "Parroquia Urbana",
    lat: -0.9625,
    lng: -80.8065,
    zoom: 14,
    hotels: 2,
    icon: "",
    badge: "Urbana · Surf & Puerto",
    desc: "Puerto pesquero artesanal, miradores y olas para surf.",
    highlights: ["Puerto Pesquero", "Surf"],
  },
  {
    id: "santa-marianita",
    name: "Santa Marianita",
    query: "Santa Marianita",
    type: "Parroquia Rural",
    lat: -0.9980,
    lng: -80.8375,
    zoom: 14,
    hotels: 7,
    icon: "",
    badge: "Rural · Kitesurf",
    desc: "Playa abierta reconocida por el kitesurf y su ambiente tranquilo.",
    highlights: ["Kitesurf", "Playa Abierta"],
  },
  {
    id: "san-lorenzo",
    name: "San Lorenzo",
    query: "San Lorenzo",
    type: "Parroquia Rural",
    lat: -1.0632,
    lng: -80.9035,
    zoom: 14,
    hotels: 3,
    icon: "",
    badge: "Rural · Reserva Pacoche",
    desc: "Reserva Marina y Bosque de Pacoche, El Faro y playas tranquilas.",
    highlights: ["Bosque de Pacoche", "El Faro"],
  },
  {
    id: "eloy-alfaro",
    name: "Eloy Alfaro",
    query: "Eloy Alfaro",
    type: "Parroquia Urbana",
    lat: -0.9680,
    lng: -80.6860,
    zoom: 14,
    hotels: 1,
    icon: "",
    badge: "Urbana · Comercial & Residencial",
    desc: "Zona comercial y residencial con acceso hacia Montecristi.",
    highlights: ["Zona Comercial", "Sector Residencial"],
  },
];

interface MapSpot {
  id: string;
  label: string;
  shortPinLabel?: string;
  lat: number;
  lng: number;
  zoom: number;
  isLandmark?: boolean;
  maxRadiusKm?: number;
  beachMode?: boolean;
}

const MAP_SPOTS: MapSpot[] = [
  { id: "playas", label: "Cerca de la playa", lat: -0.9495, lng: -80.7380, zoom: 14.5, beachMode: true },
  { id: "mall", label: "Mall del Pacífico", shortPinLabel: "Mall del Pacífico", lat: -0.9485, lng: -80.7290, zoom: 15.5, isLandmark: true, maxRadiusKm: 2.5 },
  { id: "aeropuerto", label: "Aeropuerto", shortPinLabel: "Aeropuerto MEC", lat: -0.9500, lng: -80.6800, zoom: 15, isLandmark: true, maxRadiusKm: 3.5 },
  { id: "terminal", label: "Terminal Terrestre", shortPinLabel: "Terminal Terrestre", lat: -0.9645, lng: -80.6830, zoom: 15, isLandmark: true, maxRadiusKm: 3.5 },
  { id: "murcielago", label: "Playa El Murciélago", shortPinLabel: "Playa El Murciélago", lat: -0.9440, lng: -80.7330, zoom: 15.5, isLandmark: true, maxRadiusKm: 2.5 },
  { id: "barbasquillo", label: "Barbasquillo", lat: -0.9565, lng: -80.7510, zoom: 15, maxRadiusKm: 2.8 },
  { id: "tarqui", label: "Tarqui", lat: -0.9545, lng: -80.7090, zoom: 15, maxRadiusKm: 2.5 },
  { id: "esteros", label: "Los Esteros", lat: -0.9560, lng: -80.6870, zoom: 15, maxRadiusKm: 2.5 },
  { id: "santa-marianita", label: "Santa Marianita", shortPinLabel: "Playa Santa Marianita", lat: -1.0050, lng: -80.8380, zoom: 14, isLandmark: true, maxRadiusKm: 4 },
  { id: "san-mateo", label: "San Mateo", lat: -0.9640, lng: -80.8080, zoom: 14, maxRadiusKm: 3.5 },
  { id: "san-lorenzo", label: "San Lorenzo", lat: -1.0640, lng: -80.9040, zoom: 13.5, maxRadiusKm: 6 },
];

const BEACH_ANCHORS = [
  { name: "Playa El Murciélago", lat: -0.9440, lng: -80.7330 },
  { name: "Playa Barbasquillo", lat: -0.9555, lng: -80.7525 },
  { name: "Playa Tarqui", lat: -0.9505, lng: -80.7095 },
  { name: "Playa Los Esteros", lat: -0.9515, lng: -80.6875 },
  { name: "Playa San Mateo", lat: -0.9615, lng: -80.8090 },
  { name: "Playa Santa Marianita", lat: -1.0030, lng: -80.8420 },
  { name: "Playa San Lorenzo", lat: -1.0650, lng: -80.9080 },
];

function nearestBeachDistanceKm(lat: number, lng: number): number {
  return Math.min(...BEACH_ANCHORS.map(b => calculateDistanceKm(lat, lng, b.lat, b.lng)));
}

// Encuadre centrado en la franja urbana/hotelera de Manta
const MANTA_CENTER_COORDS: [number, number] = [-0.9580, -80.7180];
const DEFAULT_ZOOM = 13.5;

interface MantaMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination: (dest: string) => void;
  hotels?: Hotel[];
  initialHotelId?: string;
  onSelectHotel?: (hotel: Hotel) => void;
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop&auto=format";

// Esri no requiere API key y muestra calles, playas y aeropuerto de Manta con nitidez
function getTileUrl(layer: "streets" | "satellite"): string {
  return layer === "satellite"
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
}

export default function MantaMapModal({
  isOpen,
  onClose,
  onSelectDestination,
  hotels = [],
  initialHotelId,
  onSelectHotel,
}: MantaMapModalProps) {
  useLang();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const landmarkGroupRef = useRef<L.LayerGroup | null>(null);

  const [viewLayout, setViewLayout] = useState<"split" | "fullMap" | "grid">("split");
  const [mapLayer, setMapLayer] = useState<"streets" | "satellite">("streets");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [activeSpot, setActiveSpot] = useState<MapSpot | null>(null);
  const [hotelSearch, setHotelSearch] = useState<string>("");
  const [priceRangeFilter, setPriceRangeFilter] = useState<"all" | "eco" | "mid" | "lux">("all");
  const [mapRevision, setMapRevision] = useState(0);

  const hotelsWithCoords = useMemo(() => {
    return hotels.map(h => ({
      ...h,
      lat: h.lat ?? MANTA_CENTER_COORDS[0],
      lng: h.lng ?? MANTA_CENTER_COORDS[1],
    }));
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    let list = hotelsWithCoords.filter(h => {
      if (priceRangeFilter === "eco" && h.priceFrom > 25) return false;
      if (priceRangeFilter === "mid" && (h.priceFrom <= 25 || h.priceFrom > 50)) return false;
      if (priceRangeFilter === "lux" && h.priceFrom <= 50) return false;

      if (hotelSearch.trim()) {
        const q = hotelSearch.toLowerCase().trim();
        const hay = `${h.name} ${h.address} ${h.city} ${h.parish ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (activeSpot?.beachMode) {
        return nearestBeachDistanceKm(h.lat, h.lng) <= 1.2;
      }

      if (activeSpot?.maxRadiusKm) {
        const d = calculateDistanceKm(h.lat, h.lng, activeSpot.lat, activeSpot.lng);
        const matchesName = `${h.city} ${h.parish ?? ""} ${h.address}`.toLowerCase().includes(activeSpot.label.toLowerCase());
        return d <= activeSpot.maxRadiusKm || matchesName;
      }

      return true;
    });

    if (activeSpot?.beachMode) {
      list = [...list].sort(
        (a, b) => nearestBeachDistanceKm(a.lat, a.lng) - nearestBeachDistanceKm(b.lat, b.lng)
      );
    } else if (activeSpot) {
      list = [...list].sort(
        (a, b) =>
          calculateDistanceKm(a.lat, a.lng, activeSpot.lat, activeSpot.lng) -
          calculateDistanceKm(b.lat, b.lng, activeSpot.lat, activeSpot.lng)
      );
    }

    return list;
  }, [hotelsWithCoords, hotelSearch, priceRangeFilter, activeSpot]);

  const handleSwitchLayer = useCallback((layer: "streets" | "satellite") => {
    setMapLayer(layer);
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(getTileUrl(layer), {
      maxZoom: 19,
      attribution: "© Esri, OpenStreetMap",
    }).addTo(map);
  }, []);

  const flyToHotel = useCallback((hotel: Hotel) => {
    setSelectedHotel(hotel);
    const map = mapInstanceRef.current;
    if (!map) return;
    const lat = hotel.lat ?? MANTA_CENTER_COORDS[0];
    const lng = hotel.lng ?? MANTA_CENTER_COORDS[1];
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, []);

  const selectSpot = useCallback((spot: MapSpot | null) => {
    setActiveSpot(spot);
    if (viewLayout === "grid") setViewLayout("split");
    const map = mapInstanceRef.current;
    if (!map) return;
    if (!spot) {
      map.flyTo(MANTA_CENTER_COORDS, DEFAULT_ZOOM, { duration: 0.6 });
    } else {
      map.flyTo([spot.lat, spot.lng], spot.zoom, { duration: 0.6 });
    }
  }, [viewLayout]);

  // Inicialización de Leaflet
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
      return;
    }

    const initialHotel = initialHotelId ? hotelsWithCoords.find(h => h.id === initialHotelId) : undefined;
    const initialCenter: [number, number] = initialHotel
      ? [initialHotel.lat, initialHotel.lng]
      : MANTA_CENTER_COORDS;
    const initialZoom = initialHotel ? 16 : DEFAULT_ZOOM;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      fadeAnimation: true,
      zoomAnimation: true,
    });
    mapInstanceRef.current = map;

    tileLayerRef.current = L.tileLayer(getTileUrl(mapLayer), {
      maxZoom: 19,
      attribution: "© Esri, OpenStreetMap",
    }).addTo(map);

    landmarkGroupRef.current = L.layerGroup().addTo(map);
    markerGroupRef.current = L.layerGroup().addTo(map);

    const onViewportChange = () => setMapRevision(r => r + 1);
    map.on("zoomend", onViewportChange);
    map.on("moveend", onViewportChange);

    if (initialHotel) setSelectedHotel(initialHotel);

    setTimeout(() => {
      map.invalidateSize();
      setMapRevision(r => r + 1);
    }, 180);

    return () => {
      map.off("zoomend", onViewportChange);
      map.off("moveend", onViewportChange);
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markerGroupRef.current = null;
      landmarkGroupRef.current = null;
    };
  }, [isOpen]);

  // Reajustar tamaño del mapa al cambiar layout
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const t = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
      setMapRevision(r => r + 1);
    }, 160);
    return () => clearTimeout(t);
  }, [viewLayout]);

  // Renderizado limpio: puntos clave visibles + agrupación de hoteles sin solapamientos ni cortes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;
    const landmarkGroup = landmarkGroupRef.current;
    if (!map || !markerGroup || !landmarkGroup) return;

    markerGroup.clearLayers();
    landmarkGroup.clearLayers();

    // Referencias clave de Manta (Aeropuerto, Mall, Terminal, Playas) — discretas, claras y clicables
    MAP_SPOTS.filter(s => s.isLandmark).forEach(spot => {
      const isActive = activeSpot?.id === spot.id;
      const bg = isActive ? "#d97706" : "rgba(255,255,255,0.94)";
      const color = isActive ? "#ffffff" : "#334155";
      const border = isActive ? "1.5px solid #b45309" : "1px solid rgba(15,23,42,0.22)";
      const dotColor = isActive ? "#ffffff" : "#d97706";

      const html = `
        <div style="width:max-content;transform:translate(-50%,-100%);cursor:pointer;">
          <div style="width:max-content;display:inline-flex;align-items:center;gap:5px;background:${bg};color:${color};border:${border};padding:3px 9px;border-radius:7px;font-size:11px;font-weight:600;font-family:system-ui,-apple-system,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(15,23,42,0.16);">
            <span style="width:6px;height:6px;border-radius:9999px;background:${dotColor};flex-shrink:0;"></span>
            <span>${tx(spot.shortPinLabel || spot.label)}</span>
          </div>
        </div>
      `;
      const m = L.marker([spot.lat, spot.lng], {
        icon: L.divIcon({ className: "map-anchor-pin", html, iconSize: [0, 0], iconAnchor: [0, 0] }),
        zIndexOffset: isActive ? 900 : 180,
      });
      m.on("click", () => selectSpot(spot));
      m.addTo(landmarkGroup);
    });

    const zoom = map.getZoom();
    const bounds = map.getBounds().pad(0.12);
    const inView = filteredHotels.filter(h => bounds.contains([h.lat, h.lng]));

    const buildPricePin = (h: Hotel & { lat: number; lng: number }, isSelected: boolean) => {
      const bg = isSelected ? "#0f172a" : "#ffffff";
      const color = isSelected ? "#ffffff" : "#0f172a";
      const border = isSelected ? "1.5px solid #0f172a" : "1px solid rgba(15,23,42,0.22)";
      const shadow = isSelected
        ? "0 6px 16px rgba(15,23,42,0.35)"
        : "0 2px 6px rgba(15,23,42,0.18)";
      const scale = isSelected ? "scale(1.08)" : "scale(1)";

      const html = `
        <div style="width:max-content;transform:translate(-50%,-50%) ${scale};cursor:pointer;">
          <div style="width:max-content;display:inline-flex;align-items:center;background:${bg};color:${color};border:${border};padding:3px 8px;border-radius:9999px;box-shadow:${shadow};font-size:12px;font-weight:700;font-family:system-ui,-apple-system,sans-serif;white-space:nowrap;line-height:1.2;">
            $${h.priceFrom}
          </div>
        </div>
      `;
      const marker = L.marker([h.lat, h.lng], {
        icon: L.divIcon({ className: "clean-price-pin", html, iconSize: [0, 0], iconAnchor: [0, 0] }),
        zIndexOffset: isSelected ? 1000 : 300,
      });
      marker.on("click", () => {
        setSelectedHotel(h);
        if (map.getZoom() < 15.5) {
          map.flyTo([h.lat, h.lng], 16, { duration: 0.5 });
        }
      });
      marker.addTo(markerGroup);
    };

    const selectedItem = selectedHotel ? inView.find(h => h.id === selectedHotel.id) : undefined;
    const placedPoints: { x: number; y: number }[] = [];

    if (selectedItem) {
      buildPricePin(selectedItem, true);
      placedPoints.push(map.latLngToContainerPoint([selectedItem.lat, selectedItem.lng]));
    }

    const others = inView.filter(h => h.id !== selectedItem?.id);

    if (zoom < 15.5) {
      const RADIUS_PX = 54;
      type Cluster = { items: (Hotel & { lat: number; lng: number })[]; cx: number; cy: number };
      const clusters: Cluster[] = [];

      for (const h of others) {
        const pt = map.latLngToContainerPoint([h.lat, h.lng]);
        if (selectedItem && Math.hypot(pt.x - placedPoints[0].x, pt.y - placedPoints[0].y) < 38) {
          continue;
        }
        let target: Cluster | undefined;
        for (const c of clusters) {
          if (Math.hypot(pt.x - c.cx, pt.y - c.cy) < RADIUS_PX) {
            target = c;
            break;
          }
        }
        if (target) {
          const n = target.items.length;
          target.cx = (target.cx * n + pt.x) / (n + 1);
          target.cy = (target.cy * n + pt.y) / (n + 1);
          target.items.push(h);
        } else {
          clusters.push({ items: [h], cx: pt.x, cy: pt.y });
        }
      }

      for (const c of clusters) {
        if (c.items.length === 1) {
          buildPricePin(c.items[0], false);
        } else {
          const avgLat = c.items.reduce((s, x) => s + x.lat, 0) / c.items.length;
          const avgLng = c.items.reduce((s, x) => s + x.lng, 0) / c.items.length;
          const minPrice = Math.min(...c.items.map(x => x.priceFrom));
          const html = `
            <div style="width:max-content;transform:translate(-50%,-50%);cursor:pointer;">
              <div style="width:max-content;display:inline-flex;align-items:center;gap:5px;background:#1e293b;color:#ffffff;border:2px solid #ffffff;padding:4px 10px;border-radius:9999px;box-shadow:0 4px 12px rgba(15,23,42,0.28);font-size:11px;font-weight:700;font-family:system-ui,-apple-system,sans-serif;white-space:nowrap;">
                <span>${c.items.length}</span>
                <span style="opacity:0.55;">·</span>
                <span style="font-weight:500;opacity:0.95;">$${minPrice}+</span>
              </div>
            </div>
          `;
          const clusterMarker = L.marker([avgLat, avgLng], {
            icon: L.divIcon({ className: "clean-cluster-pin", html, iconSize: [0, 0], iconAnchor: [0, 0] }),
            zIndexOffset: 350,
          });
          clusterMarker.on("click", () => {
            const clusterBounds = L.latLngBounds(c.items.map(x => [x.lat, x.lng] as [number, number]));
            map.flyToBounds(clusterBounds.pad(0.35), { maxZoom: 16.5, duration: 0.55 });
          });
          clusterMarker.addTo(markerGroup);
        }
      }
    } else {
      const MIN_PILL_GAP = 42;
      for (const h of others) {
        const pt = map.latLngToContainerPoint([h.lat, h.lng]);
        const collides = placedPoints.some(p => Math.hypot(pt.x - p.x, pt.y - p.y) < MIN_PILL_GAP);
        if (!collides) {
          buildPricePin(h, false);
          placedPoints.push(pt);
        } else {
          const dotHtml = `
            <div title="${h.name} · $${h.priceFrom}" style="width:max-content;transform:translate(-50%,-50%);cursor:pointer;">
              <div style="width:11px;height:11px;border-radius:9999px;background:#0f172a;border:2px solid #ffffff;box-shadow:0 2px 5px rgba(15,23,42,0.3);"></div>
            </div>
          `;
          const dot = L.marker([h.lat, h.lng], {
            icon: L.divIcon({ className: "clean-dot-pin", html: dotHtml, iconSize: [0, 0], iconAnchor: [0, 0] }),
            zIndexOffset: 120,
          });
          dot.on("click", () => setSelectedHotel(h));
          dot.addTo(markerGroup);
        }
      }
    }
  }, [filteredHotels, selectedHotel, activeSpot, mapRevision, selectSpot]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-card text-foreground rounded-2xl shadow-2xl w-full max-w-7xl h-[94vh] max-h-[860px] flex flex-col overflow-hidden border border-border">
        {/* Encabezado claro */}
        <div className="px-4 sm:px-5 py-3 bg-card border-b border-border flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
                {tx("Mapa de Manta")}
              </h3>
              <span className="text-xs text-muted-foreground">
                {filteredHotels.length} {tx("alojamientos")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center bg-muted p-0.5 rounded-lg border border-border text-xs">
              {([
                ["split", "Dividida"],
                ["fullMap", "Solo Mapa"],
                ["grid", "Catálogo"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewLayout(key)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    viewLayout === key
                      ? "bg-card text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tx(label)}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center bg-muted p-0.5 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => handleSwitchLayer("streets")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  mapLayer === "streets"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tx("Callejero")}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLayer("satellite")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  mapLayer === "satellite"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tx("Satélite HD")}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors text-sm"
              title={tx("Cerrar")}
              aria-label={tx("Cerrar")}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Única barra clara: Zonas y puntos de interés */}
        <div className="px-4 sm:px-5 py-2 bg-background border-b border-border flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground mr-1 shrink-0">
            {tx("Zonas y puntos de interés")}:
          </span>
          <button
            type="button"
            onClick={() => selectSpot(null)}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer border ${
              !activeSpot
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
            }`}
          >
            {tx("Toda Manta")}
          </button>
          {MAP_SPOTS.map((spot, idx) => {
            const isActive = activeSpot?.id === spot.id;
            return (
              <div key={spot.id} className="contents">
                {idx === 4 && <span className="h-4 w-px bg-border mx-1 shrink-0" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => selectSpot(spot)}
                  className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer border ${
                    isActive
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tx(spot.label)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex min-h-0 relative">
          <div
            className={`relative transition-all duration-200 ${
              viewLayout === "grid" ? "hidden" : viewLayout === "fullMap" ? "w-full" : "w-full lg:w-[60%]"
            }`}
          >
            <div
              ref={mapContainerRef}
              className={`w-full h-full bg-slate-100 ${mapLayer === "streets" ? "[&_.leaflet-tile-pane]:saturate-[0.78] [&_.leaflet-tile-pane]:brightness-[1.03]" : ""}`}
            />

            <div className="absolute top-3 right-3 z-[400] flex flex-col bg-card/95 rounded-xl shadow-md border border-border overflow-hidden divide-y divide-border">
              <button
                type="button"
                onClick={() => mapInstanceRef.current?.zoomIn()}
                className="w-9 h-9 hover:bg-muted text-foreground font-semibold text-base flex items-center justify-center cursor-pointer transition-colors"
                title={tx("Acercar")}
                aria-label={tx("Acercar")}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => mapInstanceRef.current?.zoomOut()}
                className="w-9 h-9 hover:bg-muted text-foreground font-semibold text-base flex items-center justify-center cursor-pointer transition-colors"
                title={tx("Alejar")}
                aria-label={tx("Alejar")}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => selectSpot(null)}
                className="w-9 h-9 hover:bg-muted text-foreground flex items-center justify-center cursor-pointer transition-colors"
                title={tx("Centrar Manta")}
                aria-label={tx("Centrar Manta")}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
              </button>
            </div>

            {selectedHotel && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[400px] z-[400] bg-card rounded-xl shadow-xl border border-border p-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                    <img
                      src={selectedHotel.image}
                      alt={selectedHotel.name}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground truncate">{selectedHotel.city}</p>
                        <h4 className="font-semibold text-foreground text-sm truncate mt-0.5">
                          {selectedHotel.name}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedHotel(null)}
                        className="text-muted-foreground hover:text-foreground text-xs p-0.5 cursor-pointer"
                        title={tx("Cerrar ficha")}
                        aria-label={tx("Cerrar ficha")}
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-[11px] text-muted-foreground truncate mt-1">
                      ★ {selectedHotel.rating} · {selectedHotel.reviews} {tx("opiniones")}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {tx("Playa")} {formatDistanceString(nearestBeachDistanceKm(selectedHotel.lat ?? -0.9520, selectedHotel.lng ?? -80.7250))} · {tx("Aeropuerto")} {formatDistanceString(calculateDistanceKm(selectedHotel.lat ?? -0.9520, selectedHotel.lng ?? -80.7250, -0.9500, -80.6800))}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border">
                      <div>
                        <span className="text-base font-bold text-foreground">
                          US${selectedHotel.priceFrom}
                        </span>
                        <span className="text-[11px] text-muted-foreground ml-1">/ {tx("noche")}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectHotel) {
                            onSelectHotel(selectedHotel);
                          } else {
                            onSelectDestination(selectedHotel.name);
                            onClose();
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        {tx("Ver Hotel")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`flex flex-col bg-card border-l border-border transition-all duration-200 ${
              viewLayout === "fullMap" ? "hidden" : viewLayout === "grid" ? "w-full" : "w-full lg:w-[40%]"
            }`}
          >
            <div className="p-3 bg-card border-b border-border space-y-2.5 shrink-0">
              <div className="relative">
                <svg className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder={tx("Buscar por hotel, sector o playa...")}
                  value={hotelSearch}
                  onChange={e => setHotelSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-foreground"
                />
                {hotelSearch && (
                  <button
                    type="button"
                    onClick={() => setHotelSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                {([
                  { id: "all", label: "Todos" },
                  { id: "eco", label: "Hasta $25" },
                  { id: "mid", label: "$26 – $50" },
                  { id: "lux", label: "Más de $50" },
                ] as const).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriceRangeFilter(p.id)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-medium border ${
                      priceRangeFilter === p.id
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-semibold"
                        : "bg-card text-muted-foreground hover:bg-muted border-border"
                    }`}
                  >
                    {tx(p.label)}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-3 ${viewLayout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start" : "space-y-2"}`}>
              {filteredHotels.map(h => {
                const isSelected = selectedHotel?.id === h.id;
                const beachDist = formatDistanceString(nearestBeachDistanceKm(h.lat, h.lng));
                const spotDist = activeSpot
                  ? activeSpot.beachMode
                    ? `${beachDist} · ${tx("Playa")}`
                    : `${formatDistanceString(calculateDistanceKm(h.lat, h.lng, activeSpot.lat, activeSpot.lng))} · ${tx(activeSpot.label)}`
                  : `${h.city} · ${tx("Playa")} ${beachDist}`;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => flyToHotel(h)}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors cursor-pointer flex gap-3 border ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500"
                        : "bg-card border-border hover:bg-muted/60"
                    }`}
                  >
                    <div className="w-[72px] h-[72px] rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                      <img
                        src={h.image}
                        alt={h.name}
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-[13px] text-foreground truncate leading-snug">
                            {h.name}
                          </h4>
                          <span className="font-semibold text-[13px] text-foreground whitespace-nowrap shrink-0">
                            ${h.priceFrom}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {h.address || h.city}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mt-1.5">
                        <span className={`truncate ${activeSpot ? "font-medium text-foreground" : ""}`}>
                          {spotDist}
                        </span>
                        <span className="shrink-0 font-medium text-foreground">
                          ★ {h.rating}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredHotels.length === 0 && (
                <div className="p-8 text-center text-muted-foreground col-span-full">
                  <p className="font-semibold text-sm text-foreground">{tx("No hay resultados")}</p>
                  <p className="text-xs mt-1">{tx("Prueba buscando por otra zona o retirando los filtros")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
