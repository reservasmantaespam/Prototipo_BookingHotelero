// ─── Home ─────────────────────────────────────────────────────────────────────

function HomePage({
  params,
  onChange,
  onSearch,
  onSelectHotel,
  theme,
  onToggleTheme,
  onOpenConsult,
  onOpenAbout,
  onOpenLegal,
}: {
  params: SearchParams;
  onChange: (p: SearchParams) => void;
  onSearch: () => void;
  onSelectHotel?: (h: Hotel) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  onOpenConsult?: () => void;
  onOpenAbout?: () => void;
  onOpenLegal?: () => void;
}) {
  const tx = useI18n();
  const [isHomeMapOpen, setIsHomeMapOpen] = useState(false);

  return (
    <div style={{ background: "var(--background)" }}>
      <div className="relative" style={{ minHeight: 400 }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0c1220 0%, #1e3a5f 50%, #0f2744 100%)" }}>
          <img src="https://images.unsplash.com/photo-1722191847760-8426e74d4b3d?w=1400&h=600&fit=crop&auto=format" alt="" className="w-full h-full object-cover opacity-25" />
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(12,18,32,0.3) 0%, rgba(12,18,32,0.75) 100%)" }} />
        <div className="relative max-w-5xl mx-auto px-4 pt-12 sm:pt-20 pb-8 sm:pb-12 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Encuentra tu hotel en Manta")}</h1>
          <p className="text-white/80 text-sm sm:text-base mb-6 sm:mb-8 max-w-lg mx-auto">
            {tx("Compara y reserva en hoteles, hostales y hosterías de Barbasquillo, El Murciélago, Tarqui, Los Esteros, San Mateo, Santa Marianita y San Lorenzo.")}
          </p>
          <div className="max-w-4xl mx-auto"><SearchBar params={params} onChange={onChange} onSearch={onSearch} onSelectHotel={onSelectHotel} /></div>
        </div>
      </div>
      <div className="border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[tx("Pago digital seguro"), tx("Confirmación de reserva inmediata"), tx("Cancelación flexible"), tx("Tarifa directa sin comisiones ocultas"), tx("Atención local en Manta")].map(text => (
            <div key={text} className="flex items-center gap-1.5 text-xs font-medium ttext-muted-foreground shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Sectores y Playas de Manta")}</h2>
            <p className="text-xs ttext-muted-foreground">{tx("Distribución en las 7 parroquias del cantón Manta")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHomeMapOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105"
            >
              <span>🗺️</span>
              <span>{tx("Ver en Mapa")}</span>
            </button>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-foreground">
              {tx("116 Alojamientos Catastrados")}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-12">
          {DESTINATIONS.map(d => (
            <button
              key={d.city}
              onClick={() => { onChange({ ...params, destination: d.city }); onSearch(); }}
              className="relative rounded-2xl overflow-hidden transition-all hover:scale-[1.03] hover:shadow-xl cursor-pointer group text-left border border-border/50"
              style={{ height: 125 }}
            >
              <img src={d.img} alt={d.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 mb-1 inline-block">
                  {tx(d.type || "Manta")}
                </span>
                <p className="text-white font-bold text-sm leading-tight truncate">{d.city.replace("Manta - ", "")}</p>
                <p className="text-white/80 text-[10px] mt-0.5">{d.hotels} {tx("hoteles")}</p>
              </div>
            </button>
          ))}
        </div>
        <h2 className="text-xl font-bold text-foreground mb-5" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Alojamientos Destacados de Manta")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {HOTELS.filter(h => h.rating >= 4.4).slice(0, 6).map(h => (
            <button key={h.id} onClick={() => { onChange({ ...params, destination: h.city }); onSearch(); }} className="rounded-2xl overflow-hidden border bg-card text-left hover:shadow-lg group transition-all cursor-pointer" style={{ borderColor: "var(--border)" }}>
              <div style={{ height: 160 }} className="overflow-hidden"><img src={h.image} alt={h.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /></div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-0.5"><StarsRow n={h.stars} /><span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#1e3a5f", color: "#93c5fd" }}>{h.rating}</span></div>
                <p className="font-bold text-foreground text-sm group-hover:text-amber-600 transition-colors">{h.name}</p>
                <p className="text-xs ttext-muted-foreground">{h.city}</p>
                <div className="flex items-baseline gap-1 mt-2"><span className="font-bold" style={{ color: "#f59e0b" }}>{tx("desde")} {fmt(h.priceFrom)}</span><span className="text-xs ttext-muted-foreground">{tx("/ noche")}</span></div>
              </div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            [tx("Tarifa directa"), tx("Reserva directamente con el establecimiento sin recargos adicionales de intermediarios internacionales.")],
            [tx("Alojamientos verificados"), tx("Establecimientos registrados y validados en el cantón Manta.")],
            [tx("Confirmación inmediata"), tx("Comprobante digital emitido al instante con código de reserva para validar a tu llegada.")]
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl p-5 border bg-card" style={{ borderColor: "var(--border)" }}>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs mb-3">✓</div>
              <h4 className="font-bold text-foreground mb-1 text-sm">{title}</h4>
              <p className="text-xs ttext-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <footer className="border-t mt-10" style={{ background: "var(--foreground)", borderColor: "#1e293b" }}>
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-wrap gap-8 justify-between">
          <div className="max-w-xs space-y-2">
            <p className="font-bold text-white text-xl" style={{ fontFamily: "DM Serif Display, serif" }}>AlojaManta</p>
            <p className="text-xs ttext-muted-foreground leading-relaxed">{tx("Plataforma oficial de reservas directas y comercialización para el cantón Manta, Manabí. Sin comisiones abusivas ni sobreprecios OTA.")}</p>
            <div className="pt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {tx("116 Alojamientos Catastrados")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-10 text-xs ttext-muted-foreground">
            <div className="space-y-2">
              <p className="font-bold text-slate-200 mb-2 uppercase tracking-wider text-[11px]">{tx("Sectores y Playas")}</p>
              <button
                type="button"
                onClick={() => { onChange({ ...params, destination: "Manta - Barbasquillo" }); onSearch(); }}
                className="hover:text-amber-400 ttext-muted-foreground transition-colors text-left block cursor-pointer"
              >
                Barbasquillo & El Murciélago
              </button>
              <button
                type="button"
                onClick={() => { onChange({ ...params, destination: "Manta - Tarqui" }); onSearch(); }}
                className="hover:text-amber-400 ttext-muted-foreground transition-colors text-left block cursor-pointer"
              >
                Tarqui & Los Esteros
              </button>
              <button
                type="button"
                onClick={() => { onChange({ ...params, destination: "Manta - Santa Marianita" }); onSearch(); }}
                className="hover:text-amber-400 ttext-muted-foreground transition-colors text-left block cursor-pointer"
              >
                Santa Marianita & San Mateo
              </button>
              <button
                type="button"
                onClick={() => { onChange({ ...params, destination: "Manta - San Lorenzo" }); onSearch(); }}
                className="hover:text-amber-400 ttext-muted-foreground transition-colors text-left block cursor-pointer"
              >
                San Lorenzo & Reserva Pacoche
              </button>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-200 mb-2 uppercase tracking-wider text-[11px]">{tx("Ayuda & Información")}</p>
              {onOpenAbout && (
                <button
                  type="button"
                  onClick={onOpenAbout}
                  className="hover:text-amber-400 ttext-muted-foreground transition-colors text-left block cursor-pointer"
                >
                  {tx("Acerca de AlojaManta")}
                </button>
              )}
              {onOpenConsult && (
                <button
                  type="button"
                  onClick={onOpenConsult}
                  className="hover:text-amber-400 ttext-muted-foreground transition-colors text-left block cursor-pointer"
                >
                  {tx("Consultar mi reserva")}
                </button>
              )}
              {onOpenLegal && (
                <button
                  type="button"
                  onClick={onOpenLegal}
                  className="hover:text-amber-400 ttext-muted-foreground transition-colors text-left block cursor-pointer"
                >
                  {tx("Términos y Privacidad")}
                </button>
              )}
              <a
                href="https://wa.me/593998765432?text=Hola%2C%20requiero%20asistencia%20en%20AlojaManta"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 ttext-muted-foreground transition-colors text-left flex items-center gap-1 cursor-pointer"
              >
                <span>WhatsApp: +593 99 876 5432</span>
              </a>
              <a
                href="tel:+59352628900"
                className="hover:text-amber-400 ttext-muted-foreground transition-colors text-left flex items-center gap-1 cursor-pointer"
              >
                <span>Central: +593 5 262 8900</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t py-4 px-4 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] ttext-muted-foreground" style={{ borderColor: "#1e293b" }}>
          <span>{tx("© 2026 AlojaManta · Red Oficial de Alojamientos del Cantón Manta · 116 Alojamientos Catastrados")}</span>
          <div className="flex items-center gap-4">
            {onOpenAbout && (
              <button
                type="button"
                onClick={onOpenAbout}
                className="ttext-muted-foreground hover:text-amber-400 transition-colors cursor-pointer"
              >
                {tx("Acerca de la Plataforma")}
              </button>
            )}
            {onOpenLegal && (
              <button
                type="button"
                onClick={onOpenLegal}
                className="ttext-muted-foreground hover:text-amber-400 transition-colors cursor-pointer"
              >
                {tx("Comprobantes y Contacto")}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* ─── Modal de Mapa Geográfico Real ─── */}
      <MantaMapModal
        isOpen={isHomeMapOpen}
        onClose={() => setIsHomeMapOpen(false)}
        onSelectDestination={dest => {
          onChange({ ...params, destination: dest });
          onSearch();
        }}
        onSelectHotel={h => {
          setIsHomeMapOpen(false);
          if (onSelectHotel) onSelectHotel(h);
        }}
        hotels={HOTELS}
      />
    </div>
  );
}

