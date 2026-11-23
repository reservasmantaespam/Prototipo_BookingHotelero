import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { tx } from "../../i18n";
import type { MyReservation } from "../reservations/types";
import { getReservationStatus, reservationStatusLabels } from "../reservations/status";
import {
  type ChatThread,
  type MessageCategory,
  useMessagingThreads,
  ensureReservationThread,
  ensureGuestSupportThread,
  ensureHotelSupportThread,
  sendThreadMessage,
  escalateReservationThread,
  markThreadIssueResolved,
  markThreadRead,
  countUnreadForGuest,
  OPEN_GUEST_CHAT_EVENT,
} from "./messagingStore";

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function fmtShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function IconMessenger({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. COMPONENTE LADO HUÉSPED: Ícono tipo Messenger + Lista desplegable + Ventana flotante
// ═════════════════════════════════════════════════════════════════════════════

export function GuestMessengerBarAndDock({
  user,
  reservations,
}: {
  user: { name: string; email: string } | null;
  reservations: MyReservation[];
}) {
  const threads = useMessagingThreads();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [guestMode, setGuestMode] = useState<"normal" | "lodging_issue">("normal");
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reservas pertenecientes al huésped autenticado
  const myReservations = user
    ? reservations.filter(r => r.guestEmail.trim().toLowerCase() === user.email.trim().toLowerCase())
    : [];

  // Asegurar que cada reserva del huésped tenga su hilo disponible
  useEffect(() => {
    if (!user) return;
    myReservations.forEach(res => {
      ensureReservationThread(res);
    });
  }, [user?.email, myReservations.length]);

  // Escuchar apertura directa desde "Escribir al hotel" (Mis Reservas / Voucher) o "Soporte AlojaManta"
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ threadId: string; initialMode?: "normal" | "lodging_issue" | "app_issue" }>;
      if (!custom.detail?.threadId) return;
      setActiveThreadId(custom.detail.threadId);
      if (custom.detail.initialMode === "lodging_issue") {
        setGuestMode("lodging_issue");
      } else {
        setGuestMode("normal");
      }
      setMinimized(false);
      setDropdownOpen(false);
      markThreadRead(custom.detail.threadId, "guest");
    };
    window.addEventListener(OPEN_GUEST_CHAT_EVENT, handler);
    return () => window.removeEventListener(OPEN_GUEST_CHAT_EVENT, handler);
  }, []);

  const activeThread = threads.find(t => t.id === activeThreadId) ?? null;

  useEffect(() => {
    if (activeThread && !minimized) {
      markThreadRead(activeThread.id, "guest");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeThread?.id, activeThread?.messages.length, minimized]);

  if (!user) return null;

  const myReservationThreadIds = new Set(myReservations.map(r => `res:${r.id}`));
  const myHotelThreads = threads.filter(t => t.channel === "reservation" && myReservationThreadIds.has(t.id));
  const mySupportThread = threads.find(
    t => t.channel === "support" && t.requesterKind === "guest" && t.guestEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
  );
  const totalUnread = countUnreadForGuest(threads, user.email);

  const activeReservation = activeThread?.reservationId
    ? myReservations.find(r => r.id === activeThread.reservationId) ?? null
    : null;
  const activeResStatus = activeReservation ? getReservationStatus(activeReservation) : null;
  const isClosedReservation =
    activeThread?.channel === "reservation" &&
    (activeResStatus === "cancelled" || activeResStatus === "rejected" || activeResStatus === "expired");

  function handleOpenThread(thread: ChatThread, mode: "normal" | "lodging_issue" = "normal") {
    setActiveThreadId(thread.id);
    setGuestMode(mode);
    setMinimized(false);
    setDropdownOpen(false);
    markThreadRead(thread.id, "guest");
  }

  function handleOpenSupport() {
    if (!user) return;
    const sup = ensureGuestSupportThread(user.name, user.email);
    setActiveThreadId(sup.id);
    setMinimized(false);
    setDropdownOpen(false);
    markThreadRead(sup.id, "guest");
  }

  function handleSend(e?: React.FormEvent, quickText?: string) {
    if (e) e.preventDefault();
    if (!user || !activeThread) return;
    const textToSend = (quickText ?? draft).trim();
    if (!textToSend) return;

    const category: MessageCategory =
      activeThread.channel === "support"
        ? "app_issue"
        : guestMode === "lodging_issue"
          ? "lodging_issue"
          : "normal";

    sendThreadMessage({
      threadId: activeThread.id,
      senderSide: "guest",
      senderName: user.name,
      senderRoleLabel: category === "lodging_issue" ? tx("Huésped · Reporte a Admin Hotel") : tx("Huésped"),
      text: textToSend,
      category,
    });
    if (!quickText) setDraft("");
  }

  function handleEscalate() {
    if (!user || !activeThread) return;
    escalateReservationThread(activeThread.id, user.name);
  }

  const quickChips =
    activeThread?.channel === "support"
      ? [
          tx("Tengo una novedad con la aplicación"),
          tx("Consulta sobre el cobro o voucher"),
          tx("Necesito ayuda con mi reserva"),
        ]
      : guestMode === "lodging_issue"
        ? [
            tx("Inconveniente con A/C o servicios en habitación"),
            tx("Problema de limpieza o ruido en el piso"),
            tx("Solicito apoyo del Administrador del Hotel"),
          ]
        : [
            tx("¿A qué hora puedo hacer el check-in?"),
            tx("¿Cuentan con parqueadero disponible?"),
            tx("Llegaré después de las 18:00, por favor confirmar"),
          ];

  return (
    <>
      {/* Botón de Mensajes en la barra superior (estilo Facebook Messenger) */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setDropdownOpen(prev => !prev)}
          className="relative p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title={tx("Mensajes con el hotel y soporte")}
          aria-label={tx("Mensajes")}
        >
          <IconMessenger className="w-4 h-4" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center shadow-xs">
              {totalUnread}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border bg-card shadow-2xl z-50 overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/40" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="font-bold text-sm text-foreground">{tx("Mensajes")}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {tx("Comunicación directa con tus hoteles reservados y soporte")}
                  </p>
                </div>
                {totalUnread > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {totalUnread} {tx("sin leer")}
                  </span>
                )}
              </div>

              {/* Lista de conversaciones con hoteles donde ya tiene reserva */}
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                <div className="px-3.5 py-1.5 bg-background/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tx("Mis reservas · Chat con el hotel")}
                </div>

                {myHotelThreads.length === 0 ? (
                  <div className="p-4 text-center space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      {tx("Aún no tienes chats con hoteles")}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {tx("El chat con recepción y administración del hotel se habilita automáticamente cuando tienes una reserva registrada.")}
                    </p>
                  </div>
                ) : (
                  myHotelThreads.map(thread => {
                    const lastMsg = thread.messages[thread.messages.length - 1];
                    const unreadCount = thread.messages.filter(m => !m.readByGuest && m.senderSide !== "guest").length;
                    return (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => handleOpenThread(thread)}
                        className="w-full px-4 py-3 text-left hover:bg-muted/60 transition-colors cursor-pointer flex items-start justify-between gap-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-foreground truncate">{thread.hotelName}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {thread.reservationId}
                            </span>
                            {thread.hasLodgingIssue && !thread.issueResolved && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400">
                                {tx("Inconveniente")}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {thread.roomType ? tx(thread.roomType) : ""} · {thread.checkIn} → {thread.checkOut}
                          </p>
                          {lastMsg && (
                            <p className={`text-xs truncate mt-1 ${unreadCount > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                              {lastMsg.senderSide === "guest" ? `${tx("Tú")}: ` : ""}
                              {lastMsg.text}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          {lastMsg && <span className="text-[10px] text-muted-foreground">{fmtTime(lastMsg.createdAt)}</span>}
                          {unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}

                {/* Canal B: Soporte AlojaManta para novedades de la aplicación */}
                <div className="px-3.5 py-1.5 bg-background/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tx("Soporte de la plataforma")}
                </div>
                <button
                  type="button"
                  onClick={handleOpenSupport}
                  className="w-full px-4 py-3 text-left hover:bg-muted/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-bold text-xs text-foreground">{tx("Soporte AlojaManta")}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        {tx("App y Pagos")}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {mySupportThread?.messages[mySupportThread.messages.length - 1]?.text ??
                        tx("¿Novedades con la aplicación, tu cuenta o un pago? Escríbenos")}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 shrink-0">→</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Ventana Flotante de Chat (Esquina inferior derecha, estilo Facebook Messenger) */}
      {activeThread &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-print-ui
            className="fixed bottom-0 right-3 sm:right-6 z-50 w-[340px] sm:w-[380px] max-w-[calc(100vw-1.5rem)] rounded-t-2xl border border-b-0 bg-card text-foreground shadow-2xl overflow-hidden flex flex-col"
            style={{ borderColor: "var(--border)" }}
          >
            {/* Cabecera de la ventana flotante */}
            <div
              onClick={() => setMinimized(prev => !prev)}
              className="px-3.5 py-2.5 bg-slate-950 text-white flex items-center justify-between gap-2 cursor-pointer select-none"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <p className="font-bold text-xs text-amber-400 truncate">
                    {activeThread.channel === "support"
                      ? tx("Soporte AlojaManta")
                      : activeThread.hotelName}
                  </p>
                  {activeThread.reservationId && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-200 shrink-0">
                      {activeThread.reservationId}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">
                  {activeThread.channel === "support"
                    ? tx("Atención de plataforma · Novedades de la app y pagos")
                    : `${activeThread.roomType ? tx(activeThread.roomType) : ""} · ${activeThread.checkIn} → ${activeThread.checkOut}`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setMinimized(prev => !prev)}
                  className="w-6 h-6 rounded hover:bg-white/15 flex items-center justify-center text-xs text-slate-300 hover:text-white cursor-pointer"
                  title={minimized ? tx("Expandir chat") : tx("Minimizar chat")}
                >
                  {minimized ? "▲" : "—"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveThreadId(null)}
                  className="w-6 h-6 rounded hover:bg-white/15 flex items-center justify-center text-xs text-slate-300 hover:text-white cursor-pointer"
                  title={tx("Cerrar chat")}
                >
                  ✕
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Barra de contexto y selector Recepción vs. Admin del Hotel (Inconveniente en hospedaje) */}
                {activeThread.channel === "reservation" && (
                  <div className="px-3 py-2 border-b bg-muted/40 space-y-1.5" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="text-muted-foreground font-semibold">{tx("Destinatario en el hotel:")}</span>
                      {activeResStatus && (
                        <span className="font-mono font-bold text-foreground">
                          {tx(reservationStatusLabels[activeResStatus])}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGuestMode("normal")}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          guestMode === "normal"
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500"
                            : "bg-card text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {tx("Recepción · Consulta")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuestMode("lodging_issue")}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          guestMode === "lodging_issue"
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-card text-muted-foreground border-border hover:text-red-600"
                        }`}
                      >
                        {tx("Admin Hotel · Problema")}
                      </button>
                    </div>
                    {guestMode === "lodging_issue" && (
                      <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px] text-red-700 dark:text-red-300">
                        <span>{tx("Se alertará con prioridad al Administrador del Hotel.")}</span>
                        {!activeThread.escalatedToSuperadmin ? (
                          <button
                            type="button"
                            onClick={handleEscalate}
                            className="font-bold underline shrink-0 cursor-pointer"
                          >
                            {tx("Escalar a AlojaManta")}
                          </button>
                        ) : (
                          <span className="font-mono font-bold text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0">
                            {tx("Escalado")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Cuerpo de mensajes */}
                <div className="h-72 overflow-y-auto p-3 space-y-2.5 bg-background/60">
                  {activeThread.messages.map(m => {
                    if (m.senderSide === "system") {
                      return (
                        <div key={m.id} className="text-center my-1">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-muted text-[10px] text-muted-foreground leading-relaxed border border-border">
                            {m.text}
                          </span>
                        </div>
                      );
                    }
                    const isMe = m.senderSide === "guest";
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-1.5 mb-0.5 px-1">
                          <span className="text-[10px] font-bold text-foreground">{m.senderName}</span>
                          <span className="text-[9px] text-muted-foreground">· {m.senderRoleLabel}</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-2xs ${
                            isMe
                              ? m.category === "lodging_issue"
                                ? "bg-red-600 text-white rounded-br-xs"
                                : "bg-amber-500 text-slate-950 font-medium rounded-br-xs"
                              : m.senderSide === "support"
                                ? "bg-slate-900 text-white border border-amber-500/40 rounded-bl-xs"
                                : "bg-card text-foreground border border-border rounded-bl-xs"
                          }`}
                        >
                          {m.category === "lodging_issue" && (
                            <span className="block text-[9px] font-bold uppercase tracking-wider opacity-90 mb-0.5">
                              {tx("Reporte de inconveniente en hospedaje")}
                            </span>
                          )}
                          <p className="break-words">{m.text}</p>
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
                          {fmtTime(m.createdAt)}
                          {isMe && (
                            <>
                              {" · "}
                              {(activeThread.channel === "support" ? m.readBySupport : m.readByHotel)
                                ? tx("Leído")
                                : tx("Enviado")}
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chips rápidos + Caja de texto */}
                {isClosedReservation ? (
                  <div className="p-3 border-t bg-muted/50 text-center space-y-1.5" style={{ borderColor: "var(--border)" }}>
                    <p className="text-[11px] text-muted-foreground">
                      {tx("Esta reserva está cerrada y el chat permanece en solo lectura como respaldo.")}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenSupport}
                      className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                    >
                      {tx("¿Necesitas ayuda? Escribir a Soporte AlojaManta →")}
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 border-t bg-card space-y-2" style={{ borderColor: "var(--border)" }}>
                    <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
                      {quickChips.map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSend(undefined, chip)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={handleSend} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder={
                          activeThread.channel === "support"
                            ? tx("Describe tu consulta o novedad de la app...")
                            : guestMode === "lodging_issue"
                              ? tx("Describe el inconveniente para el Admin del Hotel...")
                              : tx("Escribe un mensaje a recepción...")
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={!draft.trim()}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 cursor-pointer transition-colors shrink-0"
                      >
                        {tx("Enviar")}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. COMPONENTE LADO PANEL HOTELERO Y SUPERADMIN: Bandeja completa de Mensajes
// ═════════════════════════════════════════════════════════════════════════════

export function PanelMessagesView({
  hotelId,
  hotelName,
  role,
  operatorName,
  reservations,
  initialThreadId,
}: {
  hotelId: string;
  hotelName: string;
  role: "superadmin" | "admin" | "manager" | "receptionist" | "auditor";
  operatorName: string;
  reservations: MyReservation[];
  initialThreadId?: string | null;
}) {
  const threads = useMessagingThreads();
  const [filter, setFilter] = useState<"all" | "unread" | "issues" | "support">("all");
  const [selectedId, setSelectedId] = useState<string | null>(initialThreadId ?? null);
  const [draft, setDraft] = useState("");
  const isReadOnly = role === "auditor";

  // Asegurar que las reservas de este hotel tengan hilo creado
  const hotelReservations = reservations.filter(r => r.hotelId === hotelId);
  useEffect(() => {
    hotelReservations.forEach(res => ensureReservationThread(res));
    if (hotelId && hotelName) {
      ensureHotelSupportThread(hotelId, hotelName, operatorName);
    }
  }, [hotelId, hotelName, hotelReservations.length]);

  useEffect(() => {
    if (initialThreadId) {
      setSelectedId(initialThreadId);
    }
  }, [initialThreadId]);

  // Filtrar conversaciones según el rol
  const relevantThreads = threads.filter(t => {
    if (role === "superadmin") {
      // Superadmin ve todos los canales de soporte, los casos escalados y los chats del hotel supervisado
      return t.channel === "support" || t.escalatedToSuperadmin || t.hotelId === hotelId;
    }
    // Personal del hotel solo ve reservas de su hotel activo + su canal de soporte B2B con AlojaManta
    return t.hotelId === hotelId;
  });

  const filteredThreads = relevantThreads.filter(t => {
    if (filter === "unread") {
      return role === "superadmin"
        ? t.messages.some(m => !m.readBySupport && m.senderSide !== "support")
        : t.messages.some(m => !m.readByHotel && m.senderSide !== "hotel");
    }
    if (filter === "issues") {
      return t.hasLodgingIssue || t.escalatedToSuperadmin;
    }
    if (filter === "support") {
      return t.channel === "support";
    }
    return true;
  });

  const activeThread =
    filteredThreads.find(t => t.id === selectedId) ??
    relevantThreads.find(t => t.id === selectedId) ??
    filteredThreads[0] ??
    null;

  useEffect(() => {
    if (!activeThread) return;
    if (role === "superadmin" && (activeThread.channel === "support" || activeThread.escalatedToSuperadmin)) {
      markThreadRead(activeThread.id, "support");
    } else {
      markThreadRead(activeThread.id, "hotel");
    }
  }, [activeThread?.id, activeThread?.messages.length, role]);

  const linkedReservation = activeThread?.reservationId
    ? reservations.find(r => r.id === activeThread.reservationId) ?? null
    : null;

  function getReplyIdentity(): { side: "hotel" | "support"; roleLabel: string } {
    if (role === "superadmin") {
      return { side: "support", roleLabel: tx("Superadministrador · Soporte AlojaManta") };
    }
    if (role === "admin") {
      return { side: "hotel", roleLabel: tx("Administrador del Hotel") };
    }
    if (role === "manager") {
      return { side: "hotel", roleLabel: tx("Gerencia / Revenue") };
    }
    return { side: "hotel", roleLabel: tx("Recepción del Hotel") };
  }

  function handleSend(e?: React.FormEvent, quickText?: string) {
    if (e) e.preventDefault();
    if (!activeThread || isReadOnly) return;
    const textToSend = (quickText ?? draft).trim();
    if (!textToSend) return;

    // Si es un hotel escribiendo en su canal B2B a Soporte AlojaManta, envía del lado "hotel"
    const isHotelAskingSupport =
      activeThread.channel === "support" && activeThread.requesterKind === "hotel" && role !== "superadmin";

    const identity = getReplyIdentity();
    sendThreadMessage({
      threadId: activeThread.id,
      senderSide: isHotelAskingSupport ? "hotel" : identity.side,
      senderName: operatorName,
      senderRoleLabel: identity.roleLabel,
      text: textToSend,
      category: activeThread.channel === "support" ? "app_issue" : "normal",
    });
    if (!quickText) setDraft("");
  }

  const quickTemplates =
    role === "superadmin"
      ? [
          tx("Hemos recibido tu reporte en Soporte AlojaManta y lo estamos verificando."),
          tx("El caso fue coordinado con la administración del establecimiento."),
          tx("La novedad técnica ha sido revisada y actualizada en tu cuenta."),
        ]
      : activeThread?.channel === "support"
        ? [
            tx("Solicitamos apoyo con la configuración de nuestro establecimiento."),
            tx("Consulta sobre liquidación mensual y convenio."),
          ]
        : [
            tx("¡Hola! Tu habitación estará lista para el check-in desde las 15:00."),
            tx("Sí contamos con parqueadero disponible para tu estancia."),
            tx("Administración del hotel ya está atendiendo tu solicitud en habitación."),
            tx("Te esperamos en recepción presentando tu código de reserva y documento."),
          ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{tx("Centro de Mensajes y Soporte")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {role === "superadmin"
              ? tx("Supervisión cantonal · Tickets de soporte de la aplicación, mediaciones escaladas y chats del hotel seleccionado")
              : `${tx("Comunicación con huéspedes con reserva activa y soporte de plataforma")} · ${hotelName}`}
          </p>
        </div>

        {/* Filtros de bandeja */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: "all" as const, label: tx("Todos") },
            { id: "unread" as const, label: tx("Sin leer") },
            { id: "issues" as const, label: tx("Inconvenientes / Escalados") },
            { id: "support" as const, label: tx("Soporte AlojaManta") },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors cursor-pointer ${
                filter === tab.id
                  ? "bg-amber-500 text-slate-950 border-amber-500"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layout dividido: Lista de conversaciones a la izquierda + Chat y contexto a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Columna izquierda: Hilos */}
        <div
          className="lg:col-span-4 rounded-xl border bg-card overflow-hidden flex flex-col"
          style={{ borderColor: "var(--border)", minHeight: 480 }}
        >
          <div className="px-3.5 py-2.5 border-b bg-muted/40 flex items-center justify-between text-xs font-bold text-foreground" style={{ borderColor: "var(--border)" }}>
            <span>{tx("Conversaciones")} ({filteredThreads.length})</span>
            <span className="text-[10px] font-normal text-muted-foreground">{tx("Solo reservas y soporte")}</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center space-y-1.5">
                <p className="text-xs font-semibold text-foreground">{tx("No hay conversaciones en este filtro")}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {tx("Los hilos con huéspedes se crean automáticamente cuando existe una reserva en este establecimiento.")}
                </p>
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isSelected = activeThread?.id === thread.id;
                const lastMsg = thread.messages[thread.messages.length - 1];
                const unread =
                  role === "superadmin"
                    ? thread.messages.filter(m => !m.readBySupport && m.senderSide !== "support").length
                    : thread.messages.filter(m => !m.readByHotel && m.senderSide !== "hotel").length;

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedId(thread.id)}
                    className={`w-full p-3.5 text-left transition-colors cursor-pointer block ${
                      isSelected ? "bg-amber-500/12 border-l-3 border-l-amber-500" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-foreground truncate">
                            {thread.channel === "support"
                              ? thread.requesterKind === "hotel"
                                ? `${tx("Soporte Hotel")} · ${thread.hotelName}`
                                : `${tx("Soporte App")} · ${thread.guestName}`
                              : thread.guestName}
                          </span>
                          {thread.reservationId && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {thread.reservationId}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {thread.channel === "support"
                            ? thread.subject || tx("Soporte Técnico AlojaManta")
                            : `${thread.hotelName} · ${thread.roomType ? tx(thread.roomType) : ""}`}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black flex items-center justify-center shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {thread.channel === "support" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-300">
                          {tx("Soporte Plataforma")}
                        </span>
                      )}
                      {thread.hasLodgingIssue && !thread.issueResolved && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400">
                          {tx("Prioridad Admin Hotel")}
                        </span>
                      )}
                      {thread.escalatedToSuperadmin && thread.channel === "reservation" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          {tx("Escalado a Superadmin")}
                        </span>
                      )}
                      {thread.issueResolved && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          {tx("Resuelto")}
                        </span>
                      )}
                    </div>

                    {lastMsg && (
                      <p className="text-[11px] text-muted-foreground truncate mt-1.5">
                        <span className="font-semibold text-foreground">{lastMsg.senderName}: </span>
                        {lastMsg.text}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Columna derecha: Conversación activa + Ficha de la Reserva */}
        <div
          className="lg:col-span-8 rounded-xl border bg-card overflow-hidden flex flex-col"
          style={{ borderColor: "var(--border)", minHeight: 480 }}
        >
          {!activeThread ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
              {tx("Selecciona una conversación para ver el historial y responder.")}
            </div>
          ) : (
            <>
              {/* Encabezado contextual de la reserva o ticket */}
              <div className="p-4 border-b bg-muted/30 flex flex-wrap items-start justify-between gap-3" style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-base text-foreground">
                      {activeThread.channel === "support"
                        ? activeThread.subject || tx("Soporte AlojaManta")
                        : `${activeThread.guestName} · ${activeThread.reservationId}`}
                    </h2>
                    {linkedReservation && (
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        {tx(reservationStatusLabels[getReservationStatus(linkedReservation)])}
                      </span>
                    )}
                    {activeThread.hasLodgingIssue && !activeThread.issueResolved && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                        {tx("Inconveniente en el hospedaje · Atención Admin Hotel")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeThread.channel === "support"
                      ? `${tx("Contacto")}: ${activeThread.guestName} (${activeThread.guestEmail})`
                      : `${activeThread.hotelName} · ${activeThread.roomType ? tx(activeThread.roomType) : ""} · ${activeThread.checkIn} → ${activeThread.checkOut} · ${activeThread.guestEmail}`}
                  </p>
                </div>

                {/* Acciones de resolución o escalamiento */}
                {!isReadOnly && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeThread.hasLodgingIssue && !activeThread.issueResolved && (role === "admin" || role === "superadmin") && (
                      <button
                        type="button"
                        onClick={() => markThreadIssueResolved(activeThread.id, operatorName, getReplyIdentity().roleLabel)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors"
                      >
                        {tx("Marcar inconveniente como resuelto")}
                      </button>
                    )}
                    {activeThread.channel === "reservation" && !activeThread.escalatedToSuperadmin && role !== "superadmin" && (
                      <button
                        type="button"
                        onClick={() => escalateReservationThread(activeThread.id, `${operatorName} (${hotelName})`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-muted text-foreground cursor-pointer transition-colors"
                      >
                        {tx("Escalar a Superadmin AlojaManta")}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Historial de mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/40" style={{ maxHeight: 360 }}>
                {activeThread.messages.map(m => {
                  if (m.senderSide === "system") {
                    return (
                      <div key={m.id} className="text-center my-1.5">
                        <span className="inline-block px-3 py-1 rounded-lg bg-muted text-[11px] text-muted-foreground border border-border">
                          {m.text} · {fmtShortDate(m.createdAt)}
                        </span>
                      </div>
                    );
                  }
                  const isStaffSide = m.senderSide === "hotel" || m.senderSide === "support";
                  return (
                    <div key={m.id} className={`flex flex-col ${isStaffSide ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-1.5 mb-0.5 px-1">
                        <span className="text-[11px] font-bold text-foreground">{m.senderName}</span>
                        <span className="text-[10px] text-muted-foreground">· {m.senderRoleLabel}</span>
                        <span className="text-[10px] text-muted-foreground">· {fmtShortDate(m.createdAt)}</span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          m.category === "lodging_issue"
                            ? "bg-red-600 text-white"
                            : isStaffSide
                              ? m.senderSide === "support"
                                ? "bg-slate-900 text-white border border-amber-500/40"
                                : "bg-amber-500 text-slate-950 font-medium"
                              : "bg-card text-foreground border border-border"
                        }`}
                      >
                        {m.category === "lodging_issue" && (
                          <span className="block text-[9px] font-bold uppercase tracking-wider opacity-90 mb-0.5">
                            {tx("Inconveniente reportado en el hospedaje")}
                          </span>
                        )}
                        <p className="break-words">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Plantillas rápidas y formulario de respuesta */}
              {isReadOnly ? (
                <div className="p-3 border-t bg-muted/40 text-xs text-muted-foreground text-center" style={{ borderColor: "var(--border)" }}>
                  {tx("Modo Auditor (Solo lectura): puedes auditar el historial de conversaciones sin enviar mensajes.")}
                </div>
              ) : (
                <div className="p-3.5 border-t bg-card space-y-2.5" style={{ borderColor: "var(--border)" }}>
                  <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap pb-0.5">
                    {quickTemplates.map(tpl => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => handleSend(undefined, tpl)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-border bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      placeholder={`${tx("Responder como")} ${operatorName} (${getReplyIdentity().roleLabel})...`}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 cursor-pointer transition-colors shrink-0"
                    >
                      {tx("Enviar respuesta")}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
