import fs from "fs";

let content = fs.readFileSync("src/GuestPage.tsx", "utf-8");

// 1. Updated HotelCard with onOpenMap and Scarcity / Badges
const newHotelCardCode = `// ─── Hotel card ───────────────────────────────────────────────────────────────

function HotelCard({
  hotel,
  nights,
  onSelect,
  onOpenMap,
}: {
  hotel: Hotel;
  nights: number;
  onSelect: () => void;
  onOpenMap?: (hotelId: string) => void;
}) {
  const tx = useI18n();
  const n = Math.max(nights, 1);
  return (
    <div className="rounded-2xl overflow-hidden border bg-card transition-all hover:shadow-lg cursor-pointer group" style={{ borderColor: "var(--border)" }} onClick={onSelect}>
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-64 flex-shrink-0 relative overflow-hidden" style={{ height: 200 }}>
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {hotel.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "#ffffff" }}>{tx(t)}</span>)}
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div className="flex items-center gap-2 mb-0.5"><StarsRow n={hotel.stars} /><span className="text-xs ttext-muted-foreground">{tx(hotel.city)}</span></div>
                <h3 className="font-bold text-foreground text-base group-hover:text-amber-600 transition-colors">{hotel.name}</h3>
                <p className="text-xs ttext-muted-foreground mt-0.5">{hotel.address}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "#1e3a5f" }}>
                  <span className="font-bold text-white text-sm">{hotel.rating}</span><span className="text-white/60 text-xs">/ 5</span>
                </div>
                <p className="text-[10px] ttext-muted-foreground mt-0.5">{hotel.reviews} {tx("opiniones")}</p>
              </div>
            </div>
            <p className="text-sm ttext-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{txDesc(hotel.description)}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-xs font-medium" style={{ color: "#059669" }}>📍 {tx(hotel.distance)}</p>
              {onOpenMap && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMap(hotel.id);
                  }}
                  className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300 transition-colors cursor-pointer flex items-center gap-1 hover:scale-105"
                  title="Ver ubicación exacta en el mapa de Manta"
                >
                  <span>🗺️</span>
                  <span>{tx("Ver en Mapa")}</span>
                </button>
              )}
            </div>

            {/* Alertas de Escasez y Prueba Social (Booking.com style) */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              {hotel.rooms.some(r => r.available <= 2) && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <span>🔥</span>
                  <span>¡Solo quedan {Math.min(...hotel.rooms.map(r => r.available))} cupos!</span>
                </span>
              )}
              {hotel.rating >= 4.4 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <span>⚡</span>
                  <span>Alta demanda</span>
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span>✓</span>
                <span>Paga en el hotel o en línea</span>
              </span>
              {hotel.tags.some(t => t.toLowerCase().includes("pet") || t.toLowerCase().includes("mascota")) && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <span>🐾</span>
                  <span>Pet Friendly</span>
                </span>
              )}
              {hotel.amenities.some(a => a.toLowerCase().includes("parqueadero") || a.toLowerCase().includes("estacionamiento")) && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <span>🅿️</span>
                  <span>Parqueadero</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {hotel.amenities.slice(0, 5).map(a => <span key={a} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--muted)", color: "#475569" }}>{tx(a)}</span>)}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--muted)" }}>
            <div>
              <p className="text-[10px] ttext-muted-foreground uppercase tracking-wide">{tx("Precio desde")}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-foreground leading-none">US\${hotel.priceFrom}</span>
                <span className="text-xs ttext-muted-foreground font-medium">{tx("/ noche")}</span>
              </div>
              <p className="text-[11px] font-semibold ttext-muted-foreground mt-1">
                + US\${(((hotel.priceFrom * n) * (getActiveIvaPercent(hotel.id) / 100)) + (hotel.gravaServicio10 ? ((hotel.priceFrom * n) * 0.10) : 0)).toFixed(2)} {tx("de impuestos")} ({n}n)
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-foreground font-medium border border-border">
                  {hotel.gravaServicio10
                    ? \`\${getActiveIvaPercent(hotel.id)}% IVA + \${tx("10% Servicio Turístico")}\`
                    : \`\${getActiveIvaPercent(hotel.id)}% IVA (\${tx("Hostal Exento 10% Serv.")})\`}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  ✓ {tx("Reserva Garantizada")}
                </span>
              </div>
            </div>
            <button className="px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all self-end sm:self-auto shadow-sm" style={{ background: "#f59e0b", color: "#0c1220" }}>
              {tx("Ver habitaciones →")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`;

// Replace HotelCard
const cardStart = "// ─── Hotel card ───────────────────────────────────────────────────────────────";
const cardEnd = "// ─── Hotel detail ─────────────────────────────────────────────────────────────";
const c1 = content.indexOf(cardStart);
const c2 = content.indexOf(cardEnd);
if (c1 !== -1 && c2 !== -1) {
  content = content.substring(0, c1) + newHotelCardCode + "\n\n" + content.substring(c2);
  console.log("Updated HotelCard successfully!");
}

// 2. Updated ResultsView with popular filters and onOpenMap
const newResultsViewCode = `// ─── Results ──────────────────────────────────────────────────────────────────

function ResultsView({
  params,
  onChange,
  onSearch,
  onSelect,
  onOpenMap,
}: {
  params: SearchParams;
  onChange: (p: SearchParams) => void;
  onSearch: () => void;
  onSelect: (h: Hotel) => void;
  onOpenMap?: (hotelId?: string) => void;
}) {
  const tx = useI18n();
  const [stars, setStars] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(250);
  const [classification, setClassification] = useState<string>("all");
  const [parish, setParish] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "rating">("rating");
  const [showResultsMap, setShowResultsMap] = useState(false);

  // Filtros de Estancia Populares (Booking/Expedia style)
  const [filterParking, setFilterParking] = useState(false);
  const [filterPetFriendly, setFilterPetFriendly] = useState(false);
  const [filterBreakfast, setFilterBreakfast] = useState(false);
  const [filterPool, setFilterPool] = useState(false);
  const [filterAC, setFilterAC] = useState(false);
  const [filterBeachfront, setFilterBeachfront] = useState(false);

  const nights = nightsBetween(params.checkIn, params.checkOut);
  let results = HOTELS.filter(h => {
    const d = !params.destination || h.city.toLowerCase().includes(params.destination.toLowerCase()) || (h.parish && h.parish.toLowerCase().includes(params.destination.toLowerCase()));
    const s = stars.length === 0 || stars.includes(h.stars);
    const p = h.priceFrom <= maxPrice;
    const c = h.rooms.some(r => r.capacity >= params.adults);
    const cl = classification === "all" || (h.classification && h.classification.toLowerCase() === classification.toLowerCase());
    const pa = parish === "all" || (h.parish && h.parish.toLowerCase() === parish.toLowerCase());

    const matchPark = !filterParking || h.amenities.some(a => a.toLowerCase().includes("parqueadero") || a.toLowerCase().includes("estacionamiento")) || h.tags.some(t => t.toLowerCase().includes("parqueadero"));
    const matchPet = !filterPetFriendly || h.amenities.some(a => a.toLowerCase().includes("mascota") || a.toLowerCase().includes("pet")) || h.tags.some(t => t.toLowerCase().includes("mascota") || t.toLowerCase().includes("pet"));
    const matchBf = !filterBreakfast || h.amenities.some(a => a.toLowerCase().includes("desayuno")) || h.rooms.some(r => r.breakfastIncluded);
    const matchPool = !filterPool || h.amenities.some(a => a.toLowerCase().includes("piscina")) || h.tags.some(t => t.toLowerCase().includes("piscina"));
    const matchAC = !filterAC || h.amenities.some(a => a.toLowerCase().includes("aire") || a.toLowerCase().includes("a/c") || a.toLowerCase().includes("climatizado"));
    const matchBeach = !filterBeachfront || h.tags.some(t => t.toLowerCase().includes("mar") || t.toLowerCase().includes("playa"));

    return d && s && p && c && cl && pa && matchPark && matchPet && matchBf && matchPool && matchAC && matchBeach;
  });
  if (sortBy === "price") results = [...results].sort((a, b) => a.priceFrom - b.priceFrom);
  if (sortBy === "rating") results = [...results].sort((a, b) => b.rating - a.rating);

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <div className="sticky top-0 z-20 border-b shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <SearchBar params={params} onChange={onChange} onSearch={onSearch} variant="sticky" onSelectHotel={onSelect} />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-5">
        <aside className="w-56 flex-shrink-0 hidden lg:block space-y-4">
          <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-foreground text-sm">{tx("Categoría")}</h4>
              {stars.length > 0 && (
                <button onClick={() => setStars([])} className="text-[11px] text-amber-600 hover:underline">{tx("Limpiar")}</button>
              )}
            </div>
            {[5, 4, 3, 2, 1].map(s => (
              <label key={s} className="flex items-center justify-between gap-1 mb-2 cursor-pointer hover:bg-background p-1 rounded transition-colors">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    className="accent-amber-400"
                    checked={stars.includes(s)}
                    onChange={() => setStars(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  />
                  <div className="flex gap-0.5">
                    {Array.from({ length: s }).map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 11 }}>★</span>)}
                    {Array.from({ length: 5 - s }).map((_, i) => <span key={i} style={{ color: "#d1d5db", fontSize: 11 }}>★</span>)}
                  </div>
                  <span className="text-[11px] ttext-muted-foreground font-medium">
                    {s === 5 ? tx("5★ Lujo") : s === 4 ? tx("4★ Primera") : s === 3 ? tx("3★ Superior") : s === 2 ? tx("2★ Turista") : tx("1★ Económico")}
                  </span>
                </div>
                <span className="text-[10px] ttext-muted-foreground font-mono">({HOTELS.filter(h => h.stars === s).length})</span>
              </label>
            ))}
          </div>

          {/* Filtros Populares de Estancia (Parking, Pet Friendly, Desayuno, A/C, Piscina) */}
          <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-foreground text-sm">{tx("Filtros Populares")}</h4>
              {(filterParking || filterPetFriendly || filterBreakfast || filterPool || filterAC || filterBeachfront) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterParking(false);
                    setFilterPetFriendly(false);
                    setFilterBreakfast(false);
                    setFilterPool(false);
                    setFilterAC(false);
                    setFilterBeachfront(false);
                  }}
                  className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  {tx("Limpiar")}
                </button>
              )}
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between gap-1.5 cursor-pointer hover:bg-muted/40 p-1 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterParking}
                    onChange={e => setFilterParking(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-foreground font-medium">🅿️ {tx("Parqueadero")}</span>
                </div>
              </label>

              <label className="flex items-center justify-between gap-1.5 cursor-pointer hover:bg-muted/40 p-1 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterPetFriendly}
                    onChange={e => setFilterPetFriendly(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-foreground font-medium">🐾 {tx("Pet Friendly")}</span>
                </div>
              </label>

              <label className="flex items-center justify-between gap-1.5 cursor-pointer hover:bg-muted/40 p-1 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterBreakfast}
                    onChange={e => setFilterBreakfast(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-foreground font-medium">☕ {tx("Desayuno incluido")}</span>
                </div>
              </label>

              <label className="flex items-center justify-between gap-1.5 cursor-pointer hover:bg-muted/40 p-1 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterPool}
                    onChange={e => setFilterPool(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-foreground font-medium">🏊 {tx("Piscina")}</span>
                </div>
              </label>

              <label className="flex items-center justify-between gap-1.5 cursor-pointer hover:bg-muted/40 p-1 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterAC}
                    onChange={e => setFilterAC(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-foreground font-medium">❄️ {tx("Aire Acondicionado")}</span>
                </div>
              </label>

              <label className="flex items-center justify-between gap-1.5 cursor-pointer hover:bg-muted/40 p-1 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterBeachfront}
                    onChange={e => setFilterBeachfront(e.target.checked)}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-foreground font-medium">🌊 {tx("Frente al Mar / Playa")}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "var(--border)" }}>
            <h4 className="font-bold text-foreground text-sm mb-2">{tx("Clasificación")}</h4>
            <div className="space-y-1">
              {[
                { id: "all", label: tx("Todos los tipos"), count: HOTELS.length },
                { id: "Hotel", label: "Hotel", count: HOTELS.filter(h => h.classification === "Hotel").length },
                { id: "Hostal", label: "Hostal", count: HOTELS.filter(h => h.classification === "Hostal").length },
                { id: "Hostería", label: "Hostería", count: HOTELS.filter(h => h.classification === "Hostería").length },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setClassification(item.id)}
                  className={\`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg text-left transition-all \${classification === item.id ? "bg-amber-100 text-amber-900 font-bold dark:bg-amber-950 dark:text-amber-200" : "ttext-muted-foreground hover:bg-background"
                    }\`}
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-[10px] ttext-muted-foreground">({item.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "var(--border)" }}>
            <h4 className="font-bold text-foreground text-sm mb-2">{tx("Parroquia")}</h4>
            <select
              value={parish}
              onChange={e => setParish(e.target.value)}
              className="w-full text-xs rounded-lg border p-2 bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">{tx("Todas las parroquias (116)")}</option>
              {Array.from(new Set(HOTELS.map(h => h.parish).filter(Boolean))).sort().map(p => (
                <option key={p} value={p}>{p} ({HOTELS.filter(h => h.parish === p).length})</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl p-4 border bg-card" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-foreground text-sm">{tx("Precio máx./noche")}</h4>
              <span className="font-bold text-amber-600 text-sm font-mono">\${maxPrice}</span>
            </div>
            <input
              type="range"
              min={25}
              max={300}
              step={5}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] ttext-muted-foreground mt-1">
              <span>\$25</span>
              <span>\$150</span>
              <span>\$300+</span>
            </div>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-foreground">{results.length} {results.length !== 1 ? tx("alojamientos") : tx("alojamiento")}{params.destination ? \` \${tx("en")} \${params.destination}\` : ""}</h2>
              {nights > 0 && <p className="text-xs ttext-muted-foreground">{nights} {nights > 1 ? tx("noches") : tx("noche")} · {params.adults} {params.adults > 1 ? tx("adultos") : tx("adulto")}</p>}
            </div>
            <div className="flex gap-1.5 text-xs items-center">
              <button onClick={() => setShowResultsMap(true)} className="px-3 py-1.5 rounded-lg font-semibold border bg-card hover:bg-background transition-all" style={{ borderColor: "var(--border)", color: "#334155" }}>🗺️ {tx("Ver en mapa")}</button>
              <span className="ttext-muted-foreground self-center">{tx("Ordenar:")}</span>
              {[{ k: "rating" as const, l: tx("Valoración") }, { k: "price" as const, l: tx("Precio") }].map(s => (
                <button key={s.k} onClick={() => setSortBy(s.k)} className="px-3 py-1.5 rounded-lg font-semibold border transition-all" style={{ background: sortBy === s.k ? "#f59e0b" : "var(--card)", color: sortBy === s.k ? "#0c1220" : "var(--muted-foreground)", borderColor: sortBy === s.k ? "#f59e0b" : "var(--border)" }}>{s.l}</button>
              ))}
            </div>
          </div>
          <MantaMapModal
            isOpen={showResultsMap}
            onClose={() => setShowResultsMap(false)}
            onSelectDestination={dest => {
              setShowResultsMap(false);
              onChange({ ...params, destination: dest });
            }}
            onSelectHotel={h => {
              setShowResultsMap(false);
              onSelect(h);
            }}
            hotels={results}
          />
          <div className="space-y-4">
            {results.map(h => (
              <HotelCard
                key={h.id}
                hotel={h}
                nights={nights}
                onSelect={() => onSelect(h)}
                onOpenMap={() => {
                  setShowResultsMap(true);
                }}
              />
            ))}
            {results.length === 0 && (
              <div className="text-center py-16 rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
                <p className="text-4xl mb-3">🏨</p>
                <p className="font-semibold text-foreground">{tx("No encontramos alojamientos con estos filtros.")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}`;

// Replace ResultsView
const resStart = "// ─── Results ──────────────────────────────────────────────────────────────────";
const resEnd = "// ─── Home ─────────────────────────────────────────────────────────────────────";
const r1 = content.indexOf(resStart);
const r2 = content.indexOf(resEnd);
if (r1 !== -1 && r2 !== -1) {
  content = content.substring(0, r1) + newResultsViewCode + "\n\n" + content.substring(r2);
  console.log("Updated ResultsView successfully!");
}

fs.writeFileSync("src/GuestPage.tsx", content, "utf-8");

