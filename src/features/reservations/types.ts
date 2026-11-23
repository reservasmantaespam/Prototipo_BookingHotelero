import type { HotelReceipt } from "../payments/receipts";

export type ReservationStatus = "pending" | "confirmed" | "validated" | "completed" | "cancelled" | "rejected" | "expired";

export interface MyReservation {
  id: string;
  hotel: string;
  hotelId: string;
  city: string;
  room: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  status: ReservationStatus | "upcoming";
  paymentStatus?: "pending" | "paid";
  roomId?: string;
  inventoryMode?: "nightly";
  createdAt?: string;
  expiredAt?: string;
  arrivalAt?: string;
  acceptedAt?: string;
  validatedAt?: string;
  adults?: number;
  children?: number;
  notes?: string;
  image: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  payMethod?: string;
  guestDocumentType?: string;
  guestDocument?: string;
  guestRazonSocial?: string;
  guestProvince?: string;
  guestCity?: string;
  guestCountry?: string;
  guestAddress?: string;
  travelPurpose?: string;
  lopdpConsent?: boolean;
  cardLast4?: string;
  cardBrand?: string;
  breakdown?: {
    roomSubtotal: number;
    extrasSubtotal: number;
    ivaAmount: number;
    ivaPercent: number;
    service10Amount: number;
    tasaPernoctacionAmount: number;
    commissionPercent: number;
    retentionCommissionAmount: number;
    netHotelAmount: number;
    inAgreement: boolean;
  };
  receiptHistory?: HotelReceipt[];
  payment?: {
    amount: number;
    method: "Efectivo" | "Transferencia externa" | "Tarjeta externa";
    reference: string;
    recordedAt: string;
    recordedBy: string;
  };
}

export interface ReservationStay {
  checkIn: string;
  checkOut: string;
}

export type ReservationRequest = Pick<MyReservation,
  "id" | "hotel" | "hotelId" | "city" | "room" | "checkIn" | "checkOut" |
  "total" | "image" | "guestName" | "guestEmail" | "guestPhone" | "adults" | "children" | "notes" |
  "guestDocumentType" | "guestDocument" | "guestCity" | "guestCountry" | "guestAddress"
>;

export interface AvailabilityRoom {
  id: string;
  available: number;
}
