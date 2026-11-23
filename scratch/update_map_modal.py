with open('src/MantaMapModal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
old_import = 'import type { Hotel } from "./mantaHotels";'
new_import = 'import { MANTA_LANDMARKS, calculateDistanceKm, formatDistanceString, type Hotel, type MantaLandmark } from "./mantaHotels";'
code = code.replace(old_import, new_import)

# 2. Add landmark filter state in MantaMapModal
old_state = '  const [sidebarTab, setSidebarTab] = useState<"hoteles" | "parroquias">("hoteles");'
new_state = '''  const [sidebarTab, setSidebarTab] = useState<"hoteles" | "hitos">("hoteles");
  const [selectedLandmark, setSelectedLandmark] = useState<MantaLandmark | null>(null);
  const [priceRangeFilter, setPriceRangeFilter] = useState<"all" | "eco" | "mid" | "lux">("all");'''
code = code.replace(old_state, new_state)

# 3. Add flyToLandmark callback
old_fly = '  const flyToParish = useCallback((sec: ParishSector) => {'
new_fly = '''  // Volar a un hito estratégico de Manta (Aeropuerto, Terminal, Playa, etc.)
  const flyToLandmark = useCallback((lm: MantaLandmark) => {
    setSelectedLandmark(lm);
    setHotelFilterTag("TODOS");
    setSidebarTab("hoteles");
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lm.lat, lm.lng], 15, {
      duration: 0.8,
      easeLinearity: 0.25,
    });
  }, []);

  const flyToParish = useCallback((sec: ParishSector) => {'''
code = code.replace(old_fly, new_fly)

# 4. Filter logic to include priceRange and selectedLandmark
old_filter_start = '  const filteredHotels = useMemo(() => {\n    return hotelsWithCoords.filter(h => {'
new_filter_start = '''  const filteredHotels = useMemo(() => {
    let list = hotelsWithCoords.filter(h => {
      // Filtro por rango de precio
      if (priceRangeFilter === "eco" && h.priceFrom > 25) return false;
      if (priceRangeFilter === "mid" && (h.priceFrom <= 25 || h.priceFrom > 50)) return false;
      if (priceRangeFilter === "lux" && h.priceFrom <= 50) return false;'''
code = code.replace(old_filter_start, new_filter_start)

# In the return of filteredHotels, if landmark is selected, sort by distance to landmark
old_filter_end = '      return true;\n    });\n  }, [hotelsWithCoords, filterType, hotelFilterTag, hotelSearch]);'
new_filter_end = '''      return true;
    });

    if (selectedLandmark) {
      list = [...list].sort((a, b) => {
        const distA = calculateDistanceKm(a.lat, a.lng, selectedLandmark.lat, selectedLandmark.lng);
        const distB = calculateDistanceKm(b.lat, b.lng, selectedLandmark.lat, selectedLandmark.lng);
        return distA - distB;
      });
    }

    return list;
  }, [hotelsWithCoords, filterType, hotelFilterTag, hotelSearch, priceRangeFilter, selectedLandmark]);'''
code = code.replace(old_filter_end, new_filter_end)

# 5. Add landmarkLayer to Leaflet map initialization
old_groups = '''    const parishGroup = L.layerGroup();
    parishGroupRef.current = parishGroup;

    const hotelGroup = L.layerGroup().addTo(map);
    hotelGroupRef.current = hotelGroup;'''

new_groups = '''    const parishGroup = L.layerGroup();
    parishGroupRef.current = parishGroup;

    const landmarkGroup = L.layerGroup().addTo(map);

    const hotelGroup = L.layerGroup().addTo(map);
    hotelGroupRef.current = hotelGroup;

    // Marcadores persistentes de Hitos Clave de Manta (Aeropuerto, Terminal, Playas, Mall)
    MANTA_LANDMARKS.forEach(lm => {
      const isAero = lm.category === "aeropuerto";
      const isTerm = lm.category === "terminal";
      const isBeach = lm.category === "playa";
      const borderCol = isAero ? "#818cf8" : isTerm ? "#fbbf24" : isBeach ? "#38bdf8" : "#c084fc";
      const bgCol = isAero ? "#1e1b4b" : isTerm ? "#451a03" : isBeach ? "#082f49" : "#3b0764";

      const html = `
        <div style="cursor:pointer; transform:translate(-50%, -50%); will-change:transform;">
          <div style="background:${bgCol}; color:#ffffff; border:2px solid ${borderCol}; padding:4px 10px; border-radius:9999px; box-shadow:0 6px 16px rgba(0,0,0,0.4); display:flex; align-items:center; gap:5px; font-size:11px; font-weight:800; font-family:system-ui, sans-serif; white-space:nowrap;">
            <span style="font-size:13px;">${lm.icon}</span>
            <span>${lm.shortName}</span>
          </div>
        </div>
      `;
      const icon = L.divIcon({ className: "landmark-pin", html, iconSize: [130, 28], iconAnchor: [65, 14] });
      const marker = L.marker([lm.lat, lm.lng], { icon, zIndexOffset: 800 }).addTo(landmarkGroup);
      marker.on("click", () => flyToLandmark(lm));
    });'''
code = code.replace(old_groups, new_groups)

# 6. Update hotel pin style to Google Hotels style (white pill, price in bold, colored border)
old_hotel_pin = '''        <div class="manta-hotel-marker-pin" id="marker-pin-${h.id}" style="cursor:pointer; transform:translate(-50%, -50%); will-change:transform; transition:transform 0.15s ease;">
          <div style="background:#0f172a; color:#ffffff; border:1px solid #ffffff; padding:2px 7px; border-radius:9999px; box-shadow:0 3px 8px rgba(0,0,0,0.25); font-size:10px; font-weight:800; font-family:monospace; display:flex; align-items:center; gap:3px; white-space:nowrap;">
            <span style="font-size:9px;">🏨</span>
            <span style="color:#fbbf24;">$${h.priceFrom}</span>
          </div>
        </div>'''

new_hotel_pin = '''        <div class="manta-hotel-marker-pin" id="marker-pin-${h.id}" style="cursor:pointer; transform:translate(-50%, -50%); will-change:transform; transition:all 0.15s ease;">
          <div style="background:#ffffff; color:#0f172a; border:2px solid ${h.priceFrom <= 25 ? '#10b981' : h.priceFrom <= 50 ? '#0284c7' : '#d97706'}; padding:2px 7px; border-radius:9999px; box-shadow:0 4px 10px rgba(0,0,0,0.28); font-size:11px; font-weight:900; font-family:'JetBrains Mono', monospace; display:flex; align-items:center; gap:2px; white-space:nowrap;">
            <span style="color:${h.priceFrom <= 25 ? '#059669' : h.priceFrom <= 50 ? '#0284c7' : '#d97706'};">$${h.priceFrom}</span>
          </div>
        </div>'''
code = code.replace(old_hotel_pin, new_hotel_pin)

# 7. Add distance indicators in selectedHotel preview card
old_preview_details = '''                    <h4 className="font-bold text-foreground text-sm truncate mt-1">
                      {selectedHotel.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      📍 {selectedHotel.address}
                    </p>'''

new_preview_details = '''                    <h4 className="font-bold text-foreground text-sm truncate mt-1">
                      {selectedHotel.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      📍 {selectedHotel.address}
                    </p>

                    {/* Referencias reales a Hitos de Manta */}
                    <div className="grid grid-cols-2 gap-1.5 mt-2 py-1.5 border-t border-border/80 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <span>🏖️</span>
                        <span>{formatDistanceString(calculateDistanceKm(selectedHotel.lat ?? -0.9520, selectedHotel.lng ?? -80.7250, -0.9440, -80.7330))} a la playa</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <span>✈️</span>
                        <span>{formatDistanceString(calculateDistanceKm(selectedHotel.lat ?? -0.9520, selectedHotel.lng ?? -80.7250, -0.9500, -80.6800))} al aeropuerto</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <span>🚌</span>
                        <span>{formatDistanceString(calculateDistanceKm(selectedHotel.lat ?? -0.9520, selectedHotel.lng ?? -80.7250, -0.9645, -80.6830))} al terminal</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <span>🛍️</span>
                        <span>{formatDistanceString(calculateDistanceKm(selectedHotel.lat ?? -0.9520, selectedHotel.lng ?? -80.7250, -0.9485, -80.7290))} al mall</span>
                      </div>
                    </div>'''
code = code.replace(old_preview_details, new_preview_details)

# 8. Update sidebar tab from 'parroquias' to 'hitos' (Puntos Clave)
old_tabs_render = '''              <div className="flex border-b border-border text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSidebarTab("hoteles")}
                  className={`flex-1 py-2 border-b-2 text-center transition-all cursor-pointer ${
                    sidebarTab === "hoteles"
                      ? "border-amber-500 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🏨 {tx("Alojamientos")} ({filteredHotels.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("parroquias")}
                  className={`flex-1 py-2 border-b-2 text-center transition-all cursor-pointer ${
                    sidebarTab === "parroquias"
                      ? "border-amber-500 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🏛️ {tx("7 Parroquias")}
                </button>
              </div>'''

new_tabs_render = '''              <div className="flex border-b border-border text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSidebarTab("hoteles")}
                  className={`flex-1 py-2 border-b-2 text-center transition-all cursor-pointer ${
                    sidebarTab === "hoteles"
                      ? "border-amber-500 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🏨 {tx("Alojamientos")} ({filteredHotels.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab("hitos")}
                  className={`flex-1 py-2 border-b-2 text-center transition-all cursor-pointer ${
                    sidebarTab === "hitos"
                      ? "border-amber-500 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📍 {tx("Puntos Clave de Manta")}
                </button>
              </div>'''
code = code.replace(old_tabs_render, new_tabs_render)

# 9. Add Price Filter Chips and Landmark Quick Chips above search
old_chips = '''              {/* Chips de filtro rápido */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
                {["TODOS", "Frente al Mar", "Piscina", "Económicos", "4-5 Estrellas"].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setHotelFilterTag(tag)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-bold ${
                      hotelFilterTag === tag
                        ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950"
                        : "bg-card text-muted-foreground hover:bg-muted border border-border"
                    }`}
                  >
                    {tx(tag)}
                  </button>
                ))}
              </div>'''

new_chips = '''              {/* Selector de Rango de Precios estilo Google Hotels */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
                {[
                  { id: "all", label: "Todos los precios" },
                  { id: "eco", label: "Económicos (≤ $25)" },
                  { id: "mid", label: "Estándar ($26 - $50)" },
                  { id: "lux", label: "Premium (+$50)" },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriceRangeFilter(p.id as any)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-bold ${
                      priceRangeFilter === p.id
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "bg-card text-muted-foreground hover:bg-muted border border-border"
                    }`}
                  >
                    {tx(p.label)}
                  </button>
                ))}
              </div>

              {/* Hitos de Referencia: Aeropuerto, Terminal, Playa, Mall */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => { setSelectedLandmark(null); setHotelFilterTag("TODOS"); }}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-bold ${
                    !selectedLandmark
                      ? "bg-slate-900 text-white dark:bg-slate-700 dark:text-white"
                      : "bg-card text-muted-foreground hover:bg-muted border border-border"
                  }`}
                >
                  🌐 Toda Manta
                </button>
                {MANTA_LANDMARKS.map(lm => (
                  <button
                    key={lm.id}
                    type="button"
                    onClick={() => flyToLandmark(lm)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-bold flex items-center gap-1 ${
                      selectedLandmark?.id === lm.id
                        ? "bg-sky-500 text-white shadow-xs"
                        : "bg-card text-muted-foreground hover:bg-muted border border-border"
                    }`}
                  >
                    <span>{lm.icon}</span>
                    <span>{lm.shortName}</span>
                  </button>
                ))}
              </div>'''
code = code.replace(old_chips, new_chips)

# 10. In sidebarTab === 'hitos', display the list of landmarks
old_parroquias_view = '''            {/* Lista de Parroquias */}
            {sidebarTab === "parroquias" && ('''
new_parroquias_view = '''            {/* Lista de Hitos y Puntos Clave de Manta */}
            {sidebarTab === "hitos" && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>🧭</span>
                    <span>Hitos Estratégicos de Manta</span>
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Haz clic en cualquier punto para volar en el mapa y ver los hoteles más cercanos ordenados por proximidad y tarifa.
                  </p>
                </div>

                {MANTA_LANDMARKS.map(lm => (
                  <div
                    key={lm.id}
                    onClick={() => flyToLandmark(lm)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      selectedLandmark?.id === lm.id
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : "border-border hover:border-slate-400 bg-card hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{lm.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-foreground truncate">{lm.name}</h4>
                        <span className="mono text-[9px] px-2 py-0.5 rounded font-bold bg-muted text-muted-foreground shrink-0">
                          {lm.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{lm.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lista de Parroquias (antigua) */}
            {false && ('''
code = code.replace(old_parroquias_view, new_parroquias_view)

# In each hotel card in the sidebar list, show distance to the selected landmark or to beach/airport:
old_card_dist = '<p className="text-[11px] text-muted-foreground truncate">📍 {h.address}</p>'
new_card_dist = '''<p className="text-[11px] text-muted-foreground truncate">📍 {h.address}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium">
                          <span>🏖️ {formatDistanceString(calculateDistanceKm(h.lat, h.lng, -0.9440, -80.7330))} a playa</span>
                          <span>·</span>
                          <span>✈️ {formatDistanceString(calculateDistanceKm(h.lat, h.lng, -0.9500, -80.6800))} al aeropuerto</span>
                        </div>'''
code = code.replace(old_card_dist, new_card_dist)

with open('src/MantaMapModal.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated MantaMapModal with real landmarks, price pills, and distances!')
