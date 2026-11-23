with open('src/PaymentLinkModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace header styling
old_header = '''        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border)", background: "rgba(12, 18, 32, 0.6)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-base">
              🔗
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                {linkGenerated ? "Link de Pago Generado" : "Crear Link de Pago Seguro"}
              </h2>
              <p className="text-xs text-amber-500 font-medium">{hotelName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-sm hover:bg-slate-800 transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            ✕
          </button>
        </div>'''

new_header = '''        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base">
              🔗
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {linkGenerated ? "Link de Pago Generado" : "Crear Link de Pago Seguro"}
              </h2>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">{hotelName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>'''

# Replace gateways mapping block
old_gateways = '''            {/* Pasarelas de Pago de Ecuador e Internacionales */}
            <div>
              <label className="block font-medium mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                {tx("Pasarela de Pago Habilitada")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GATEWAYS.map(g => (
                  <div
                    key={g.id}
                    onClick={() => setGateway(g.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                      gateway === g.id
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : "hover:border-slate-700 bg-slate-900/40 border-slate-800"
                    }`}
                  >
                    <span className="text-base mt-0.5">{g.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs truncate" style={{ color: "var(--foreground)" }}>
                          {tx(g.name)}
                        </span>
                        <span className="mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold whitespace-nowrap">
                          {tx(g.tag)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{tx(g.desc)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>'''

new_gateways = '''            {/* Pasarelas de Pago de Ecuador e Internacionales */}
            <div>
              <label className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                {tx("Pasarela de Pago Habilitada")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GATEWAYS.map(g => (
                  <div
                    key={g.id}
                    onClick={() => setGateway(g.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      gateway === g.id
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-500/15 ring-2 ring-amber-500/30 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="text-lg mt-0.5">{g.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate text-slate-900 dark:text-slate-100">
                          {tx(g.name)}
                        </span>
                        <span className={`mono text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${
                          gateway === g.id
                            ? "bg-amber-500 text-slate-950"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {tx(g.tag)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5 font-medium">{tx(g.desc)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>'''

# Replace inputs styling
text = text.replace(old_header.replace('\n', '\r\n'), new_header.replace('\n', '\r\n'))
text = text.replace(old_header, new_header)

text = text.replace(old_gateways.replace('\n', '\r\n'), new_gateways.replace('\n', '\r\n'))
text = text.replace(old_gateways, new_gateways)

# Replace input styles for clean background in light mode
text = text.replace(
    'className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-amber-500 transition-colors"\r\n                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}',
    'className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 transition-colors"'
)
text = text.replace(
    'className="w-full rounded-lg border px-3 py-2 text-xs outline-none focus:border-amber-500 transition-colors"\n                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}',
    'className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 transition-colors"'
)

text = text.replace(
    'className="w-full rounded-lg border pl-7 pr-3 py-2 text-xs font-mono font-bold outline-none focus:border-amber-500 transition-colors"\r\n                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}',
    'className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 transition-colors"'
)
text = text.replace(
    'className="w-full rounded-lg border pl-7 pr-3 py-2 text-xs font-mono font-bold outline-none focus:border-amber-500 transition-colors"\n                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}',
    'className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 transition-colors"'
)

# Label styling
text = text.replace('style={{ color: "var(--muted-foreground)" }}', 'className="text-slate-700 dark:text-slate-300 font-semibold"')

# Cancel button
text = text.replace(
    'className="px-4 py-2 rounded text-xs font-medium text-slate-400 hover:text-white transition-colors"',
    'className="px-4 py-2 rounded text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"'
)

# Vigencia select
text = text.replace(
    'style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}',
    'className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-900 dark:text-slate-100 outline-none"'
)

with open('src/PaymentLinkModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("PaymentLinkModal updated successfully")

