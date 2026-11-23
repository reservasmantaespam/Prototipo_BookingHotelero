with open('src/App.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix the hover color on the rates table
old_tr = '<tr key={r.type} className="hover:bg-[#1a2540] transition-colors" style={{ borderBottom: i < roomTypes.length - 1 ? "1px solid var(--border)" : "none" }}>'
new_tr = '<tr key={r.type} className="hover:bg-amber-50/70 dark:hover:bg-slate-800/60 transition-colors" style={{ borderBottom: i < roomTypes.length - 1 ? "1px solid var(--border)" : "none" }}>'
text = text.replace(old_tr, new_tr)

# 2. Fix room name and prices contrast inside the rates table
old_td_room = '<p className="font-medium" style={{ color: "var(--foreground)" }}>{r.icon} {r.type}</p>'
new_td_room = '<p className="font-bold text-slate-900 dark:text-slate-100">{r.icon} {r.type}</p>'
text = text.replace(old_td_room, new_td_room)

old_td_base = '<td className="px-4 py-3 mono font-semibold" style={{ color: "var(--primary)" }}>{fmtUsd(r.basePrice)}</td>'
new_td_base = '<td className="px-4 py-3 mono font-bold text-slate-900 dark:text-slate-100">{fmtUsd(r.basePrice)}</td>'
text = text.replace(old_td_base, new_td_base)

# Multipliers colors:
old_multipliers = '''                  {seasons.map(s => (
                    <td key={s.name} className="px-4 py-3">
                      <div className="mono text-sm font-medium" style={{ color: s.multiplier > 1 ? "#fcd34d" : s.multiplier < 1 ? "#93c5fd" : "#6ee7b7" }}>
                        {fmtUsd(r.basePrice * s.multiplier)}
                      </div>
                    </td>
                  ))}'''

new_multipliers = '''                  {seasons.map(s => {
                    const priceVal = fmtUsd(r.basePrice * s.multiplier);
                    const colorClass = s.multiplier > 1
                      ? "text-amber-700 dark:text-amber-400 font-bold"
                      : s.multiplier < 1
                        ? "text-blue-700 dark:text-blue-400 font-bold"
                        : "text-emerald-700 dark:text-emerald-400 font-bold";
                    return (
                      <td key={s.name} className="px-4 py-3">
                        <div className={`mono text-sm font-semibold ${colorClass}`}>
                          {priceVal}
                        </div>
                      </td>
                    );
                  })}'''
text = text.replace(old_multipliers.replace('\n', '\r\n'), new_multipliers.replace('\n', '\r\n'))
text = text.replace(old_multipliers, new_multipliers)

# 3. Fix channel commission text color (#e8edf5 was white on white)
old_comm = '<p className="mono text-2xl font-bold leading-none" style={{ color: ch.commission === 0 ? ch.color : "#e8edf5" }}>{ch.commission}%</p>'
new_comm = '<p className="mono text-2xl font-bold leading-none text-slate-900 dark:text-slate-100" style={{ color: ch.commission === 0 ? ch.color : undefined }}>{ch.commission}%</p>'
text = text.replace(old_comm, new_comm)

# 4. Fix statusBadges in client_choices
old_badges = '''  const statusBadges: Record<string, { bg: string; color: string; label: string }> = {
    upcoming: { bg: "rgba(59, 130, 246, 0.15)", color: "#93c5fd", label: "Próxima estancia" },
    completed: { bg: "rgba(16, 185, 129, 0.15)", color: "#6ee7b7", label: "Pagada / Finalizada" },
    cancelled: { bg: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", label: "Cancelada" },
  };'''

new_badges = '''  const statusBadges: Record<string, { bg: string; color: string; label: string; border?: string }> = {
    upcoming: { bg: "#dbeafe", color: "#1d4ed8", label: "Próxima estancia", border: "#93c5fd" },
    completed: { bg: "#dcfce7", color: "#15803d", label: "Pagada / En estancia", border: "#86efac" },
    cancelled: { bg: "#fee2e2", color: "#b91c1c", label: "Cancelada", border: "#fca5a5" },
  };'''
text = text.replace(old_badges.replace('\n', '\r\n'), new_badges.replace('\n', '\r\n'))
text = text.replace(old_badges, new_badges)

# In the badge render:
old_badge_span = '''                        <span
                          className="mono text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide flex-shrink-0"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {tx(badge.label)}
                        </span>'''

new_badge_span = '''                        <span
                          className="mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide flex-shrink-0 border"
                          style={{ background: badge.bg, color: badge.color, borderColor: badge.border || badge.color }}
                        >
                          {tx(badge.label)}
                        </span>'''
text = text.replace(old_badge_span.replace('\n', '\r\n'), new_badge_span.replace('\n', '\r\n'))
text = text.replace(old_badge_span, new_badge_span)

# 5. Fix card texts in client_choices:
# res.id
text = text.replace(
    'className="mono text-[10px] text-amber-400 font-bold tracking-wider"',
    'className="mono text-[11px] text-amber-700 dark:text-amber-400 font-bold tracking-wider"'
)

# Total cobrado
text = text.replace(
    'className="mono font-bold text-base text-amber-400"',
    'className="mono font-bold text-base text-amber-700 dark:text-amber-400"'
)

# Hotel names in hotels catalog
text = text.replace(
    'className="text-[10px] text-amber-400 font-bold"\r\n                        style={{',
    'className="text-[10px] text-amber-600 dark:text-amber-400 font-bold"\r\n                        style={{'
)
text = text.replace(
    'className="text-[10px] text-amber-400 font-bold"\n                        style={{',
    'className="text-[10px] text-amber-600 dark:text-amber-400 font-bold"\n                        style={{'
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated rates hover and contrast in App.tsx successfully")

