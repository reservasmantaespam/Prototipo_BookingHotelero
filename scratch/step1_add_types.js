import fs from "fs";

let guestPage = fs.readFileSync("src/GuestPage.tsx", "utf-8");

// 1. Add WhatsApp helper & HotelReview interface after Types
const typesMarker = "type GuestView = \"home\" | \"results\" | \"hotel\" | \"account\";";
const whatsappAndReviews = `
type GuestView = "home" | "results" | "hotel" | "account";

// ─── Helper de Enlace Directo a WhatsApp para Hoteles de Manta ────────────────
export function buildWhatsAppUrl(
  phone: string | undefined,
  hotelName: string,
  resId?: string,
  guestName?: string,
  checkIn?: string,
  checkOut?: string,
  roomType?: string,
  paymentMethod?: string,
  balanceDue?: number
): string {
  const raw = (phone || "593999999999").replace(/\\D/g, "");
  let formatted = raw;
  if (!formatted.startsWith("593")) {
    if (formatted.startsWith("0")) {
      formatted = "593" + formatted.slice(1);
    } else {
      formatted = "593" + formatted;
    }
  }
  let msg = "";
  if (resId) {
    const payText = paymentMethod && paymentMethod.includes("HOTEL")
      ? \`Modalidad: Pago en recepción al llegar (Saldo a liquidar en check-in: US$\${(balanceDue ?? 0).toFixed(2)})\`
      : \`Modalidad: Pagado 100% en línea (Saldo: US$0.00)\`;
    msg = \`¡Hola \${hotelName}! Acabo de confirmar mi reserva #\${resId} a través del portal oficial de Manta para el \${checkIn || ""} al \${checkOut || ""} (\${roomType || "Habitación"}). Mi nombre es \${guestName || "Huésped"}. \${payText}. Quisiera coordinar detalles de mi llegada.\`;
  } else {
    msg = \`¡Hola \${hotelName}! Vi su alojamiento en el portal oficial de Manta y quisiera consultar sobre disponibilidad y tarifas para mi estancia.\`;
  }
  return \`https://wa.me/\${formatted}?text=\${encodeURIComponent(msg)}\`;
}

export interface HotelReview {
  id: string;
  hotelId: string;
  guestName: string;
  city: string;
  resId: string;
  rating: number; // 1.0 to 5.0
  title: string;
  comment: string;
  tripType: "PAREJA" | "FAMILIAR" | "NEGOCIOS" | "SOLO" | "AMIGOS";
  date: string;
  pros?: string;
  cons?: string;
  hotelResponse?: {
    author: string;
    date: string;
    text: string;
  };
}

export const DEFAULT_HOTEL_REVIEWS: Record<string, HotelReview[]> = {
  "hotel-voyager-manta": [
    {
      id: "rev-voyager-1",
      hotelId: "hotel-voyager-manta",
      guestName: "Carlos Méndez",
      city: "Portoviejo",
      resId: "RES-8941",
      rating: 5.0,
      title: "Excelente atención y vista inigualable en Barbasquillo",
      comment: "El proceso de reserva web fue rapidísimo y el voucher digital me lo validaron en menos de 2 minutos en recepción. La cama King súper confortable y la vista al mar espectacular.",
      tripType: "PAREJA",
      date: "04 de Noviembre, 2026",
      pros: "Vista panorámica al mar, tigrillo manabita fresco, atención de primera.",
      hotelResponse: {
        author: "Gerencia Hotel Voyager Manta",
        date: "05 de Noviembre, 2026",
        text: "Muchas gracias estimado Carlos por su excelente valoración. Nos complace que haya disfrutado de nuestra atención. ¡Esperamos tenerlo de vuelta pronto!",
      },
    },
    {
      id: "rev-voyager-2",
      hotelId: "hotel-voyager-manta",
      guestName: "Patricia Ruiz",
      city: "Guayaquil",
      resId: "RES-8990",
      rating: 4.8,
      title: "Maravillosa estancia familiar en Manta",
      comment: "Habitaciones amplias, piscina impecable y ubicación estratégica en Barbasquillo cerca de restaurantes y cafés.",
      tripType: "FAMILIAR",
      date: "28 de Octubre, 2026",
      pros: "Piscina climatizada, ambiente seguro y familiar.",
    },
  ],
  "hotel-oro-verde": [
    {
      id: "rev-ov-1",
      hotelId: "hotel-oro-verde",
      guestName: "Diana Morales",
      city: "Quito",
      resId: "RES-9230",
      rating: 5.0,
      title: "La mejor experiencia de lujo frente a la playa El Murciélago",
      comment: "Servicio 5 estrellas impecable. El desayuno buffet frente al mar es delicioso y el acceso directo a la playa inmejorable.",
      tripType: "PAREJA",
      date: "02 de Noviembre, 2026",
      pros: "Desayuno buffet completo, atención del personal de nivel internacional.",
      hotelResponse: {
        author: "Dirección de Hospitalidad Hotel Oro Verde",
        date: "03 de Noviembre, 2026",
        text: "Estimada Diana, un verdadero placer haberle brindado una experiencia memorable en Manta. Esperamos recibirla nuevamente.",
      },
    },
    {
      id: "rev-ov-2",
      hotelId: "hotel-oro-verde",
      guestName: "Fernando Alarcón",
      city: "Cuenca",
      resId: "RES-9182",
      rating: 4.9,
      title: "Confort total y facilidades corporativas",
      comment: "WiFi excelente, salones modernos y facturación electrónica inmediata para mi empresa.",
      tripType: "NEGOCIOS",
      date: "24 de Octubre, 2026",
      pros: "Conectividad rápida, gimnasio y piscina de primera.",
    },
  ],
  "hotel-sail-plaza-manta": [
    {
      id: "rev-sp-1",
      hotelId: "hotel-sail-plaza-manta",
      guestName: "Lorena Paredes",
      city: "Guayaquil",
      resId: "RES-9411",
      rating: 5.0,
      title: "Atardeceres inolvidables y alta gastronomía",
      comment: "La vista desde el acantilado de Barbasquillo es mágica. Habitación moderna y comida marina exquisita.",
      tripType: "PAREJA",
      date: "01 de Noviembre, 2026",
      pros: "Vista panorámica al mar abierto, piscina infinity, coctelería marina.",
    },
  ],
  "hostal-malecon-blue": [
    {
      id: "rev-mb-1",
      hotelId: "hostal-malecon-blue",
      guestName: "Santiago Zambrano",
      city: "Manta",
      resId: "RES-7712",
      rating: 4.7,
      title: "Ubicación ideal frente a la playa de Tarqui",
      comment: "A pasos de los restaurantes de mariscos y el astillero tradicional. Excelente precio y atención muy cordial.",
      tripType: "AMIGOS",
      date: "29 de Octubre, 2026",
      pros: "Excelente relación calidad-precio, mariscos frescos a la vuelta.",
    },
  ],
  "hostalcabana-punta-la-barca": [
    {
      id: "rev-pb-1",
      hotelId: "hostalcabana-punta-la-barca",
      guestName: "Julien Dubois",
      city: "Quito / Francia",
      resId: "RES-6540",
      rating: 5.0,
      title: "El paraíso del kitesurf en Santa Marianita",
      comment: "Viento perfecto todos los días, ambiente de comunidad acogedor y el mar a pocos pasos de la cabaña. ¡Volveré seguro!",
      tripType: "SOLO",
      date: "06 de Noviembre, 2026",
      pros: "Escuela de kitesurf, ambiente relajado, atardecer sobre el mar.",
    },
  ],
};
`;

if (!guestPage.includes("export interface HotelReview")) {
  guestPage = guestPage.replace(typesMarker, whatsappAndReviews);
  console.log("Added WhatsApp helper and HotelReview interface!");
}

fs.writeFileSync("src/GuestPage.tsx", guestPage, "utf-8");

