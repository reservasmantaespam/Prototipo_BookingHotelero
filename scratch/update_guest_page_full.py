import re

with open('src/GuestPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Clean typo ttext-muted-foreground -> text-muted-foreground
content = content.replace('ttext-muted-foreground', 'text-muted-foreground')

# 2. Update SearchBar popover & inputs
searchbar_old_label = '''<label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <span>📍</span>
            <span>{tx("¿A dónde vas en Manta?")}</span>
          </label>'''

searchbar_new_label = '''<label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <span>📍</span>
            <span>{tx("¿Cerca de dónde necesitas estar?")}</span>
          </label>'''

content = content.replace(searchbar_old_label, searchbar_new_label)

content = content.replace(
    'placeholder={tx("Parroquia, playa o sector de Manta...")}',
    'placeholder={tx("Aeropuerto, Terminal, Playa Murciélago, Mall o nombre de hotel...")}'
)

# 3. In BookingModal, add tasa de pernoctacion calculation
old_bm_calc = '''  const ivaPct = getActiveIvaPercent(hotel.id);
  const iva = parseFloat((base * (ivaPct / 100)).toFixed(2));
  const hasService = hotel.gravaServicio10 ?? false;
  const servicio = hasService ? parseFloat((base * 0.10).toFixed(2)) : 0;
  const total = parseFloat((base + iva + servicio).toFixed(2));'''

new_bm_calc = '''  const ivaPct = getActiveIvaPercent(hotel.id);
  const iva = parseFloat((base * (ivaPct / 100)).toFixed(2));
  const hasService = hotel.gravaServicio10 ?? false;
  const servicio = hasService ? parseFloat((base * 0.10).toFixed(2)) : 0;
  // Tasa de Pernoctación Turística Municipal (GAD Manta): US$ 2.50 por noche
  const tasaPernoctacion = parseFloat((TASA_PERNOCTACION_MANTA * nights).toFixed(2));
  const total = parseFloat((base + iva + servicio + tasaPernoctacion).toFixed(2));'''

content = content.replace(old_bm_calc, new_bm_calc)

# 4. In HotelCard, add 4 detailed distances (Centro, Playa, Mall, Aeropuerto) and Tasa de Pernoctación
old_card_dist = '<p className="text-xs mt-1 font-medium" style={{ color: "#059669" }}>📍 {tx(hotel.distance)}</p>'

new_card_dist = '''<p className="text-xs mt-1 font-medium" style={{ color: "#059669" }}>📍 {tx(hotel.distance)}</p>
            {(() => {
              const d = getHotelDetailedDistances(hotel.lat, hotel.lng);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2 py-1.5 px-2 rounded-xl bg-muted/40 border border-border/60 text-[10px]">
                  <div className="flex items-center gap-1 text-foreground" title="Distancia al Centro Histórico y Plaza Cívica">
                    <span>🏙️</span>
                    <span className="truncate"><strong>Centro:</strong> {d.centro.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-foreground" title={d.playa.name}>
                    <span>🏖️</span>
                    <span className="truncate"><strong>Playa:</strong> {d.playa.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-foreground" title="Distancia al Mall del Pacífico">
                    <span>🛍️</span>
                    <span className="truncate"><strong>Mall:</strong> {d.mall.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-foreground" title="Distancia al Aeropuerto Internacional Eloy Alfaro">
                    <span>✈️</span>
                    <span className="truncate"><strong>Aerop. MEC:</strong> {d.aeropuerto.label}</span>
                  </div>
                </div>
              );
            })()}'''

content = content.replace(old_card_dist, new_card_dist)

# 5. In ResultsView, use matchSmartDestination
old_results_filter = '''  let results = getPublicHotels().filter(h => {
    const d = !params.destination || h.city.toLowerCase().includes(params.destination.toLowerCase()) || (h.parish && h.parish.toLowerCase().includes(params.destination.toLowerCase()));'''

new_results_filter = '''  let results = getPublicHotels().filter(h => {
    const d = !params.destination || matchSmartDestination(h, params.destination);'''

content = content.replace(old_results_filter, new_results_filter)

# 6. Change "Con Desayuno Buffet" to "Con Desayuno Incluido"
content = content.replace("Con Desayuno Buffet", "Con Desayuno Incluido")
content = content.replace("con Desayuno Buffet", "con Desayuno Incluido")
content = content.replace("Desayuno buffet", "Desayuno incluido")
content = content.replace("desayuno buffet", "desayuno incluido")

# 7. Add 8% IVA Switch in GuestPage Header
old_header_start = '''          <div className="flex items-center gap-2 sm:gap-3 shrink-0">'''

new_header_start = '''          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Switch Rápido IVA 15% / 8% (Tarifa Feriado SRI / Ley de Turismo) */}
            {(() => {
              const [ivaCfg, setIvaCfg] = useState(() => getIvaDecretoConfig());
              useEffect(() => {
                const sync = () => setIvaCfg(getIvaDecretoConfig());
                window.addEventListener("alojamanta-iva-change", sync);
                return () => window.removeEventListener("alojamanta-iva-change", sync);
              }, []);

              const is8 = ivaCfg.enabledGlobal;
              return (
                <button
                  type="button"
                  onClick={() => {
                    const next = !is8;
                    setIvaDecretoConfig({ enabledGlobal: next });
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                    is8
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500/20"
                      : "bg-muted text-foreground border-border hover:bg-muted/80"
                  }`}
                  title="Conmutador SRI: Activar o desactivar tarifa reducida de IVA 8% por feriado turístico"
                >
                  <span>{is8 ? "🌴 IVA 8% Feriado" : "🏛️ IVA 15%"}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-black ${is8 ? "bg-emerald-800 text-emerald-100" : "bg-card text-muted-foreground border border-border"}`}>
                    {is8 ? "ACTIVO" : "NORMAL"}
                  </span>
                </button>
              );
            })()}'''

content = content.replace(old_header_start, new_header_start, 1)

with open('src/GuestPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("GuestPage updated successfully!")
