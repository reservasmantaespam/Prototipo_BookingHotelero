with open('src/GuestPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports in GuestPage.tsx
if 'MANTA_LANDMARKS' not in code:
    code = code.replace(
        'import type { Hotel } from "./mantaHotels";',
        'import { MANTA_LANDMARKS, calculateDistanceKm, formatDistanceString, type Hotel, type MantaLandmark } from "./mantaHotels";'
    )

# 2. Update Hero headline and subtitle
old_hero_title = '<h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Encuentra tu hotel en Manta")}</h1>'
new_hero_title = '<h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Tu estancia perfecta en Manta")}</h1>'
code = code.replace(old_hero_title, new_hero_title)

old_hero_sub = '<p className="text-white/80 text-sm sm:text-base mb-6 sm:mb-8 max-w-lg mx-auto">\n            {tx("Compara y reserva en hoteles, hostales y hosterías de Barbasquillo, El Murciélago, Tarqui, Los Esteros, San Mateo, Santa Marianita y San Lorenzo.")}\n          </p>'
new_hero_sub = '<p className="text-white/85 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto font-medium">\n            {tx("Hoteles, hostales y cabañas frente al mar, cerca del Aeropuerto o del Terminal Terrestre. Precios directos con IVA 15% incluido y sin cargos sorpresa.")}\n          </p>'
code = code.replace(old_hero_sub, new_hero_sub)

# 3. Update SearchBar label and placeholder
code = code.replace(
    '<span>{tx("¿A dónde vas en Manta?")}</span>',
    '<span>{tx("¿Cerca de dónde necesitas estar?")}</span>'
)
code = code.replace(
    'placeholder={tx("Parroquia, playa o sector de Manta...")}',
    'placeholder={tx("Aeropuerto, Terminal, Playa Murciélago, Centro o nombre de hotel...")}'
)

# 4. Update the Popover inside SearchBar: change activeTab to 'hitos' | 'experiencias' | 'todo'
code = code.replace(
    'const [activeTab, setActiveTab] = useState<"parroquias" | "sectores" | "todo">("parroquias");',
    'const [activeTab, setActiveTab] = useState<"hitos" | "experiencias" | "todo">("hitos");'
)

# Replace popover header text
code = code.replace(
    '<h4 className="font-bold text-xs text-foreground">{tx("Explora Manta por zona")}</h4>',
    '<h4 className="font-bold text-xs text-foreground">{tx("¿Cerca de qué punto necesitas hospedarte?")}</h4>'
)
code = code.replace(
    '{tx("Elige una parroquia oficial o una playa turística destacada")}',
    '{tx("Selecciona un hito clave de Manta o busca libremente")}'
)

# Replace popover tabs
old_popover_tabs = '''              <button
                type="button"
                onClick={() => setActiveTab("parroquias")}
                className={`py-1 px-2.5 rounded-full whitespace-nowrap transition-all cursor-pointer font-semibold flex items-center gap-1 text-[11px] ${activeTab === "parroquias"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                  }`}
              >
                <span>🏛️</span>
                <span>{tx("7 Parroquias Oficiales")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sectores")}
                className={`py-1 px-2.5 rounded-full whitespace-nowrap transition-all cursor-pointer font-semibold flex items-center gap-1 text-[11px] ${activeTab === "sectores"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                  }`}
              >
                <span>🏖️</span>
                <span>{tx("Playas & Sectores")}</span>
              </button>'''

new_popover_tabs = '''              <button
                type="button"
                onClick={() => setActiveTab("hitos")}
                className={`py-1 px-2.5 rounded-full whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 text-[11px] ${activeTab === "hitos"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                  }`}
              >
                <span>📍</span>
                <span>{tx("Hitos y Puntos Clave")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("experiencias")}
                className={`py-1 px-2.5 rounded-full whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 text-[11px] ${activeTab === "experiencias"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-card text-muted-foreground border border-border hover:bg-muted"
                  }`}
              >
                <span>🏖️</span>
                <span>{tx("Por Tipo de Viaje")}</span>
              </button>'''
code = code.replace(old_popover_tabs, new_popover_tabs)

# Replace popover content for 'hitos' tab:
old_parroquias_grid = '''              {/* Pestaña 1: Parroquias Oficiales en Cuadrícula */}
              {activeTab === "parroquias" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MANTA_PARROQUIAS_OFICIALES.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectDestination(p.query)}
                      className="p-2.5 rounded-xl border border-border/80 hover:border-amber-400 bg-background/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-left transition-all cursor-pointer flex items-start gap-2.5 group"
                    >
                      <span className="text-xl shrink-0 mt-0.5">{p.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-xs text-foreground group-hover:text-amber-600 transition-colors truncate">
                            {p.name}
                          </p>
                          <span className="mono text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.2 rounded shrink-0">
                            {p.count}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}'''

new_hitos_grid = '''              {/* Pestaña 1: Hitos Estratégicos de Manta (Aeropuerto, Terminal, Playas, Mall) */}
              {activeTab === "hitos" && (
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200">
                    <strong>Puntos más buscados:</strong> Elige un hito para ver los hoteles a poca distancia y con cálculo de minutos de traslado.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MANTA_LANDMARKS.map(lm => (
                      <button
                        key={lm.id}
                        type="button"
                        onClick={() => handleSelectDestination(lm.shortName)}
                        className="p-2.5 rounded-xl border border-border/80 hover:border-amber-400 bg-background/50 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 text-left transition-all cursor-pointer flex items-start gap-2.5 group"
                      >
                        <span className="text-2xl shrink-0 mt-0.5">{lm.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-xs text-foreground group-hover:text-amber-600 transition-colors truncate">
                              {lm.name}
                            </p>
                            <span className="mono text-[9px] font-bold text-slate-700 dark:text-slate-300 bg-muted px-1.5 py-0.5 rounded shrink-0">
                              {lm.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{lm.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}'''
code = code.replace(old_parroquias_grid, new_hitos_grid)

# Replace 'sectores' tab with 'experiencias' tab
old_sectores_content = '''              {/* Pestaña 2: Playas y Sectores Turísticos Destacados */}
              {activeTab === "sectores" && ('''
new_experiencias_content = '''              {/* Pestaña 2: Por Tipo de Viaje / Experiencia */}
              {activeTab === "experiencias" && ('''
code = code.replace(old_sectores_content, new_experiencias_content)

# 5. In the homepage categories (lines 4455-4494), replace the 8 parish cards with 4 rich experiential cards with verified images
old_home_destinations = '''          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Sectores y Playas de Manta")}</h2>
            <p className="text-xs text-muted-foreground">{tx("Distribución en las 7 parroquias del cantón Manta")}</p>
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
        </div>'''

new_home_destinations = '''          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Encuentra tu hotel según el plan de tu viaje")}</h2>
            <p className="text-xs text-muted-foreground">{tx("Alojamientos agrupados por ubicación estratégica y propósito de viaje")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHomeMapOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-105"
            >
              <span>🗺️</span>
              <span>{tx("Ver Mapa con Precios")}</span>
            </button>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-foreground">
              {tx("116 Alojamientos")}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            {
              title: "Frente a la Playa & Atardeceres",
              badge: "🏖️ Frente al Mar",
              price: "Desde $35",
              count: "42 Hoteles",
              desc: "Despierta frente al Pacífico en Barbasquillo y Murciélago. Piscina y cocteles.",
              img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
              query: "Playa",
            },
            {
              title: "Cerca al Aeropuerto Internacional (MEC)",
              badge: "✈️ Conexión Aérea",
              price: "Desde $18",
              count: "21 Hoteles",
              desc: "A 3-5 minutos del Aeropuerto Eloy Alfaro. Con wifi rápido y traslados ejecutivos.",
              img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop",
              query: "Aeropuerto",
            },
            {
              title: "Cerca al Terminal Terrestre & Económicos",
              badge: "🚌 Terminal & Conectividad",
              price: "Desde $16",
              count: "28 Hoteles",
              desc: "La mejor opción para viajeros de paso y mochileros en El Palmar y Tarqui.",
              img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
              query: "Terminal",
            },
            {
              title: "Deportes Acuáticos & Kitesurf",
              badge: "🏄 Surf & Kitesurf",
              price: "Desde $28",
              count: "11 Lodges",
              desc: "Cabañas costeras con viento constante en Santa Marianita y la rompiente de San Mateo.",
              img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600&h=400&fit=crop",
              query: "Santa Marianita",
            },
          ].map(c => (
            <button
              key={c.title}
              type="button"
              onClick={() => { onChange({ ...params, destination: c.query }); onSearch(); }}
              className="relative rounded-2xl overflow-hidden text-left bg-card border border-border group hover:border-amber-400 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {c.badge}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-mono font-black shadow-xs">
                  {c.price}
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <h3 className="font-bold text-sm text-foreground group-hover:text-amber-600 transition-colors leading-snug">{c.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-tight">{c.desc}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold pt-1">{c.count} disponibles</p>
              </div>
            </button>
          ))}
        </div>'''
code = code.replace(old_home_destinations, new_home_destinations)

with open('src/GuestPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated GuestPage with humanized search and landmark references successfully!')
