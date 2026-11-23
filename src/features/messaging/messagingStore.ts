import { useEffect, useState } from "react";
import type { MyReservation } from "../reservations/types";

export const MESSAGING_STORAGE_KEY = "alojamanta.messaging.v1";
export const MESSAGING_CHANGED_EVENT = "alojamanta-messaging-changed";
export const OPEN_GUEST_CHAT_EVENT = "alojamanta-open-guest-chat";
export const OPEN_PANEL_CHAT_EVENT = "alojamanta-open-panel-chat";

export type ChatChannel = "reservation" | "support";
export type MessageSenderSide = "guest" | "hotel" | "support" | "system";
export type MessageCategory = "normal" | "lodging_issue" | "app_issue" | "escalation";

export interface ChatMessage {
  id: string;
  senderSide: MessageSenderSide;
  senderName: string;
  senderRoleLabel: string;
  text: string;
  category: MessageCategory;
  createdAt: string;
  readByGuest: boolean;
  readByHotel: boolean;
  readBySupport: boolean;
}

export interface ChatThread {
  id: string;
  channel: ChatChannel;
  // Reservation thread fields (Canal A: Huésped <-> Hotel, solo con reserva)
  reservationId?: string;
  hotelId?: string;
  hotelName?: string;
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  // Support thread fields (Canal B: Huésped o Hotel <-> Soporte AlojaManta)
  requesterKind?: "guest" | "hotel";
  subject?: string;
  // Shared guest/requester identity
  guestName: string;
  guestEmail: string;
  // Issue & escalation flags
  hasLodgingIssue: boolean;
  escalatedToSuperadmin: boolean;
  issueResolved?: boolean;
  updatedAt: string;
  messages: ChatMessage[];
}

function notifyMessagingChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MESSAGING_CHANGED_EVENT));
  }
}

export function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MESSAGING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MESSAGING_STORAGE_KEY, JSON.stringify(threads));
    notifyMessagingChanged();
  } catch {
    // ignore storage errors
  }
}

export function reservationThreadId(reservationId: string): string {
  return `res:${reservationId}`;
}

export function guestSupportThreadId(guestEmail: string): string {
  return `sup:guest:${guestEmail.trim().toLowerCase()}`;
}

export function hotelSupportThreadId(hotelId: string): string {
  return `sup:hotel:${hotelId}`;
}

export function ensureReservationThread(res: MyReservation): ChatThread {
  const threads = readThreads();
  const id = reservationThreadId(res.id);
  const existing = threads.find(t => t.id === id);
  if (existing) {
    // Keep metadata synced with reservation
    const updated: ChatThread = {
      ...existing,
      hotelId: res.hotelId,
      hotelName: res.hotel,
      roomType: res.room,
      checkIn: res.checkIn,
      checkOut: res.checkOut,
      guestName: res.guestName,
      guestEmail: res.guestEmail,
    };
    return updated;
  }

  const now = res.createdAt || new Date().toISOString();
  const created: ChatThread = {
    id,
    channel: "reservation",
    reservationId: res.id,
    hotelId: res.hotelId,
    hotelName: res.hotel,
    roomType: res.room,
    checkIn: res.checkIn,
    checkOut: res.checkOut,
    guestName: res.guestName,
    guestEmail: res.guestEmail,
    hasLodgingIssue: false,
    escalatedToSuperadmin: false,
    issueResolved: false,
    updatedAt: now,
    messages: [
      {
        id: `msg-init-${res.id}`,
        senderSide: "system",
        senderName: "AlojaManta",
        senderRoleLabel: "Sistema",
        text: `Canal oficial habilitado para la reserva ${res.id} en ${res.hotel} (${res.checkIn} → ${res.checkOut}).`,
        category: "normal",
        createdAt: now,
        readByGuest: true,
        readByHotel: true,
        readBySupport: true,
      },
    ],
  };
  saveThreads([created, ...threads]);
  return created;
}

export function ensureGuestSupportThread(guestName: string, guestEmail: string): ChatThread {
  const threads = readThreads();
  const id = guestSupportThreadId(guestEmail);
  const existing = threads.find(t => t.id === id);
  if (existing) return existing;

  const now = new Date().toISOString();
  const created: ChatThread = {
    id,
    channel: "support",
    requesterKind: "guest",
    subject: "Soporte y novedades de la aplicación",
    guestName,
    guestEmail,
    hasLodgingIssue: false,
    escalatedToSuperadmin: true,
    issueResolved: false,
    updatedAt: now,
    messages: [
      {
        id: `msg-sup-init-${Date.now()}`,
        senderSide: "support",
        senderName: "Soporte AlojaManta",
        senderRoleLabel: "Soporte Plataforma",
        text: "Hola, este es el canal directo con Soporte Técnico de AlojaManta para dudas o novedades de la aplicación, pagos o cuenta.",
        category: "app_issue",
        createdAt: now,
        readByGuest: true,
        readByHotel: true,
        readBySupport: true,
      },
    ],
  };
  saveThreads([created, ...threads]);
  return created;
}

export function ensureHotelSupportThread(hotelId: string, hotelName: string, operatorName: string): ChatThread {
  const threads = readThreads();
  const id = hotelSupportThreadId(hotelId);
  const existing = threads.find(t => t.id === id);
  if (existing) return existing;

  const now = new Date().toISOString();
  const created: ChatThread = {
    id,
    channel: "support",
    requesterKind: "hotel",
    hotelId,
    hotelName,
    subject: `Soporte B2B · ${hotelName}`,
    guestName: operatorName || hotelName,
    guestEmail: `${hotelId}@hotel.alojamanta.ec`,
    hasLodgingIssue: false,
    escalatedToSuperadmin: true,
    issueResolved: false,
    updatedAt: now,
    messages: [
      {
        id: `msg-hsup-init-${Date.now()}`,
        senderSide: "support",
        senderName: "Administración Cantonal AlojaManta",
        senderRoleLabel: "Superadministrador",
        text: `Canal directo de soporte técnico y operativo para ${hotelName} con la administración de AlojaManta.`,
        category: "app_issue",
        createdAt: now,
        readByGuest: true,
        readByHotel: true,
        readBySupport: true,
      },
    ],
  };
  saveThreads([created, ...threads]);
  return created;
}

export function sendThreadMessage(params: {
  threadId: string;
  senderSide: MessageSenderSide;
  senderName: string;
  senderRoleLabel: string;
  text: string;
  category?: MessageCategory;
}): ChatThread | null {
  const clean = params.text.trim();
  if (!clean) return null;
  const threads = readThreads();
  const idx = threads.findIndex(t => t.id === params.threadId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const category = params.category ?? "normal";
  const current = threads[idx];

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    senderSide: params.senderSide,
    senderName: params.senderName,
    senderRoleLabel: params.senderRoleLabel,
    text: clean,
    category,
    createdAt: now,
    readByGuest: params.senderSide === "guest" || params.senderSide === "system",
    readByHotel: params.senderSide === "hotel" || params.senderSide === "system",
    readBySupport: params.senderSide === "support" || params.senderSide === "system",
  };

  const updated: ChatThread = {
    ...current,
    hasLodgingIssue: current.hasLodgingIssue || category === "lodging_issue",
    escalatedToSuperadmin: current.escalatedToSuperadmin || category === "escalation" || current.channel === "support",
    issueResolved: category === "lodging_issue" || category === "escalation" ? false : current.issueResolved,
    updatedAt: now,
    messages: [...current.messages, newMessage],
  };

  const next = [updated, ...threads.filter((_, i) => i !== idx)];
  saveThreads(next);
  return updated;
}

export function escalateReservationThread(threadId: string, actorName: string, reason?: string): ChatThread | null {
  const threads = readThreads();
  const idx = threads.findIndex(t => t.id === threadId);
  if (idx === -1) return null;
  const current = threads[idx];
  const now = new Date().toISOString();

  const note = reason?.trim()
    ? `Caso escalado a Superadministración de AlojaManta por ${actorName}: "${reason.trim()}".`
    : `Caso escalado a Superadministración de AlojaManta por ${actorName} para mediación y seguimiento.`;

  const sysMsg: ChatMessage = {
    id: `msg-esc-${Date.now()}`,
    senderSide: "system",
    senderName: "AlojaManta",
    senderRoleLabel: "Mediación",
    text: note,
    category: "escalation",
    createdAt: now,
    readByGuest: true,
    readByHotel: false,
    readBySupport: false,
  };

  const updated: ChatThread = {
    ...current,
    hasLodgingIssue: true,
    escalatedToSuperadmin: true,
    issueResolved: false,
    updatedAt: now,
    messages: [...current.messages, sysMsg],
  };

  const next = [updated, ...threads.filter((_, i) => i !== idx)];
  saveThreads(next);
  return updated;
}

export function markThreadIssueResolved(threadId: string, actorName: string, actorRole: string): ChatThread | null {
  const threads = readThreads();
  const idx = threads.findIndex(t => t.id === threadId);
  if (idx === -1) return null;
  const current = threads[idx];
  const now = new Date().toISOString();

  const sysMsg: ChatMessage = {
    id: `msg-res-${Date.now()}`,
    senderSide: "system",
    senderName: actorName,
    senderRoleLabel: actorRole,
    text: `Inconveniente marcado como atendido y resuelto por ${actorName} (${actorRole}).`,
    category: "normal",
    createdAt: now,
    readByGuest: false,
    readByHotel: true,
    readBySupport: true,
  };

  const updated: ChatThread = {
    ...current,
    issueResolved: true,
    updatedAt: now,
    messages: [...current.messages, sysMsg],
  };

  const next = [updated, ...threads.filter((_, i) => i !== idx)];
  saveThreads(next);
  return updated;
}

export function appendReservationSystemEvent(res: MyReservation, eventText: string): void {
  const thread = ensureReservationThread(res);
  const threads = readThreads();
  const idx = threads.findIndex(t => t.id === thread.id);
  if (idx === -1) return;
  const now = new Date().toISOString();

  const sysMsg: ChatMessage = {
    id: `msg-evt-${Date.now()}`,
    senderSide: "system",
    senderName: res.hotel,
    senderRoleLabel: "Actualización de Reserva",
    text: eventText,
    category: "normal",
    createdAt: now,
    readByGuest: false,
    readByHotel: true,
    readBySupport: true,
  };

  const updated: ChatThread = {
    ...threads[idx],
    updatedAt: now,
    messages: [...threads[idx].messages, sysMsg],
  };

  const next = [updated, ...threads.filter((_, i) => i !== idx)];
  saveThreads(next);
}

export function markThreadRead(threadId: string, viewer: "guest" | "hotel" | "support"): void {
  const threads = readThreads();
  const idx = threads.findIndex(t => t.id === threadId);
  if (idx === -1) return;

  let changed = false;
  const updatedMessages = threads[idx].messages.map(m => {
    if (viewer === "guest" && !m.readByGuest) {
      changed = true;
      return { ...m, readByGuest: true };
    }
    if (viewer === "hotel" && !m.readByHotel) {
      changed = true;
      return { ...m, readByHotel: true };
    }
    if (viewer === "support" && !m.readBySupport) {
      changed = true;
      return { ...m, readBySupport: true };
    }
    return m;
  });

  if (!changed) return;
  const next = [...threads];
  next[idx] = { ...threads[idx], messages: updatedMessages };
  saveThreads(next);
}

export function countUnreadForGuest(threads: ChatThread[], guestEmail: string): number {
  const clean = guestEmail.trim().toLowerCase();
  if (!clean) return 0;
  return threads
    .filter(t => t.guestEmail.trim().toLowerCase() === clean && t.requesterKind !== "hotel")
    .reduce((sum, t) => sum + t.messages.filter(m => !m.readByGuest && m.senderSide !== "guest").length, 0);
}

export function countUnreadForHotel(threads: ChatThread[], hotelId: string): number {
  if (!hotelId) return 0;
  return threads
    .filter(t => t.hotelId === hotelId)
    .reduce((sum, t) => sum + t.messages.filter(m => !m.readByHotel && m.senderSide !== "hotel").length, 0);
}

export function countUnreadForSuperadmin(threads: ChatThread[]): number {
  return threads
    .filter(t => t.channel === "support" || t.escalatedToSuperadmin)
    .reduce((sum, t) => sum + t.messages.filter(m => !m.readBySupport && m.senderSide !== "support").length, 0);
}

export function openGuestChatForReservation(res: MyReservation, initialMode: "normal" | "lodging_issue" = "normal"): void {
  const thread = ensureReservationThread(res);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_GUEST_CHAT_EVENT, { detail: { threadId: thread.id, initialMode } }));
  }
}

export function openGuestSupportChat(guestName: string, guestEmail: string): void {
  const thread = ensureGuestSupportThread(guestName, guestEmail);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_GUEST_CHAT_EVENT, { detail: { threadId: thread.id, initialMode: "app_issue" } }));
  }
}

export function useMessagingThreads(): ChatThread[] {
  const [threads, setThreads] = useState<ChatThread[]>(() => readThreads());

  useEffect(() => {
    const sync = () => setThreads(readThreads());
    window.addEventListener(MESSAGING_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MESSAGING_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return threads;
}
