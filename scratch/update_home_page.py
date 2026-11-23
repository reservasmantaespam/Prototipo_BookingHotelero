import re

with open('src/GuestPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Hero title and subtitle
old_hero_text = '''          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Encuentra tu hotel en Manta")}</h1>
          <p className="text-white/80 text-sm sm:text-base mb-6 sm:mb-8 max-w-lg mx-auto">
            {tx("Compara y reserva en hoteles, hostales y hosterías de Barbasquillo, El Murciélago, Tarqui, Los Esteros, San Mateo, Santa Marianita y San Lorenzo.")}
          </p>'''

new_hero_text = '''          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Tu estancia perfecta en Manta: La Puerta del Pacífico")}</h1>
          <p className="text-white/85 text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            {tx("Hoteles, hostales y cabañas frente al mar, cerca del Aeropuerto MEC o del Terminal Terrestre. Precios directos con IVA 15% u 8% y tasa de pernoctación.")}
          </p>'''

content = content.replace(old_hero_text, new_hero_text)

# Replace the 8 parish cards section with 4 travel intentions cards
old_section = '''        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
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
              {tx("116 Alojamientos")}
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

new_section = '''        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>{tx("Encuentra tu hotel según el plan de tu viaje")}</h2>
            <p className="text-xs text-muted-foreground">{tx("Alojamientos agrupados por ubicación estratégica y propósito de viaje en Manta")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHomeMapOpen(true)}
              className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
            >
              <span>🗺️</span>
              <span>{tx("Ver Mapa con Precios Google Hotels")}</span>
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
              desc: "Cabañas costeras con viento constante en Santa Marianita y olas de San Mateo.",
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

content = content.replace(old_section, new_section)

with open('src/GuestPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Home page updated!")
