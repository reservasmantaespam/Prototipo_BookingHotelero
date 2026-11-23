import fs from "fs";

let content = fs.readFileSync("src/GuestPage.tsx", "utf-8");

// 1. Update BookingModal declaration to accept initialPlan
content = content.replace(
  /function BookingModal\(\{\s*hotel,\s*room,\s*params,\s*user,\s*onClose,\s*onGuestLogin,\s*onReservationCreated,\s*\}: \{\s*hotel: Hotel;\s*room: RoomOffer;\s*params: SearchParams;\s*user: GuestUser \| null;\s*onClose: \(\) => void;\s*onGuestLogin: \(u: GuestUser\) => void;\s*onReservationCreated\?: \(r: MyReservation\) => void;\s*\}\) \{(\s*const tx = useI18n\(\);\s*const nights = Math\.max\(nightsBetween\(params\.checkIn, params\.checkOut\), 1\);\s*\/\/\s*RF-04: Planes de Tarifa\s*const \[ratePlan, setRatePlan\] = useState<"flexible" \| "non_refundable" \| "breakfast_plus">\("flexible"\);)/,
  `function BookingModal({
  hotel,
  room,
  params,
  user,
  initialPlan = "flexible",
  onClose,
  onGuestLogin,
  onReservationCreated,
}: {
  hotel: Hotel;
  room: RoomOffer;
  params: SearchParams;
  user: GuestUser | null;
  initialPlan?: "flexible" | "non_refundable" | "breakfast_plus";
  onClose: () => void;
  onGuestLogin: (u: GuestUser) => void;
  onReservationCreated?: (r: MyReservation) => void;
}) {
  const tx = useI18n();
  const nights = Math.max(nightsBetween(params.checkIn, params.checkOut), 1);

  // RF-04: Planes de Tarifa
  const [ratePlan, setRatePlan] = useState<"flexible" | "non_refundable" | "breakfast_plus">(initialPlan || "flexible");`
);

// 2. Add Home reviews section
const homeReviewsSection = `        {/* ─── Sección de Experiencias y Calificaciones de Huéspedes en Manta ─── */}
        <div className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {tx("Experiencias y Calificaciones de Huéspedes")}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  {tx("100% Verificadas")}
                </span>
              </div>
              <p className="text-xs ttext-muted-foreground mt-1">
                {tx("Opiniones de viajeros que reservaron directamente a través de la Red Oficial de Manta")}
              </p>
            </div>
            <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-card border border-border shadow-xs">
              <div className="text-amber-500 font-bold text-xl flex items-center gap-1">
                <span>⭐</span>
                <span>4.8</span>
              </div>
              <div className="border-l border-border pl-3 text-left">
                <p className="text-xs font-bold text-foreground">{tx("Satisfacción Cantonal")}</p>
                <p className="text-[10px] ttext-muted-foreground">{tx("+1,200 reseñas verificadas")}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "Carlos Méndez",
                city: "Portoviejo",
                hotel: "Hotel Voyager Manta",
                zone: "Barbasquillo",
                rating: 5.0,
                trip: "En Pareja",
                title: "Excelente atención y vista inigualable al mar",
                comment: "El proceso de reserva web fue rapidísimo y el voucher digital me lo validaron en menos de 2 minutos en recepción. El desayuno con tigrillo manabita fue excepcional.",
                date: "Noviembre 2026",
              },
              {
                name: "Diana Morales",
                city: "Quito",
                hotel: "Hotel Oro Verde Manta",
                zone: "El Murciélago",
                rating: 5.0,
                trip: "Familiar",
                title: "La mejor experiencia frente a la playa",
                comment: "Servicio 5 estrellas impecable. Poder pagar directamente en el hotel y tener confirmación inmediata por WhatsApp nos dio total tranquilidad.",
                date: "Noviembre 2026",
              },
              {
                name: "Julien Dubois",
                city: "Quito / Francia",
                hotel: "Hostalcabaña Punta La Barca",
                zone: "Santa Marianita",
                rating: 5.0,
                trip: "Kitesurf / Solo",
                title: "El paraíso del kitesurf en Santa Marianita",
                comment: "Viento perfecto, ambiente acogedor y el mar a pocos pasos. Reservar sin intermediarios con tarifa directa es una ventaja tremenda.",
                date: "Octubre 2026",
              },
            ].map(r => (
              <div key={r.name} className="rounded-2xl p-4 border bg-card shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow" style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground leading-tight">{r.name}</p>
                        <p className="text-[10px] ttext-muted-foreground">{r.city} · {r.trip}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      {"★".repeat(Math.round(r.rating))}
                    </div>
                  </div>
                  <h4 className="font-bold text-xs text-foreground mb-1">"{r.title}"</h4>
                  <p className="text-[11px] ttext-muted-foreground leading-relaxed italic mb-3">
                    "{r.comment}"
                  </p>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">🏨 {r.hotel} ({r.zone})</span>
                  <span className="text-emerald-600 font-medium">✓ Voucher validado</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">`;

content = content.replace(
  `<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">`,
  homeReviewsSection
);

// 3. Update Root state & HotelDetail call
content = content.replace(
  `  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [bookingRoom, setBookingRoom] = useState<RoomOffer | null>(null);`,
  `  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [bookingRoom, setBookingRoom] = useState<RoomOffer | null>(null);
  const [bookingPlan, setBookingPlan] = useState<"flexible" | "non_refundable" | "breakfast_plus">("flexible");
  const [globalHotelMapOpen, setGlobalHotelMapOpen] = useState(false);`
);

content = content.replace(
  `{view === "hotel" && selectedHotel && <HotelDetail hotel={selectedHotel} params={params} onBack={() => setView("results")} onBook={r => setBookingRoom(r)} />}`,
  `{view === "hotel" && selectedHotel && (
        <HotelDetail
          hotel={selectedHotel}
          params={params}
          onBack={() => setView("results")}
          onBook={(r, plan) => {
            setBookingRoom(r);
            setBookingPlan(plan || "flexible");
          }}
          onOpenMap={() => setGlobalHotelMapOpen(true)}
        />
      )}`
);

content = content.replace(
  `<BookingModal
          hotel={selectedHotel}
          room={bookingRoom}
          params={params}
          user={user}
          onClose={() => setBookingRoom(null)}`,
  `<BookingModal
          hotel={selectedHotel}
          room={bookingRoom}
          params={params}
          user={user}
          initialPlan={bookingPlan}
          onClose={() => setBookingRoom(null)}`
);

// Add globalHotelMapOpen modal rendering before closing root div
if (!content.includes("MantaMapModal\n        isOpen={globalHotelMapOpen}")) {
  content = content.replace(
    `      {/* Modal de Reserva y Pago */}`,
    `      {/* Modal de Mapa Cantonal Global */}
      <MantaMapModal
        isOpen={globalHotelMapOpen}
        onClose={() => setGlobalHotelMapOpen(false)}
        onSelectDestination={dest => {
          setGlobalHotelMapOpen(false);
          setParams({ ...params, destination: dest });
          setView("results");
        }}
        onSelectHotel={h => {
          setGlobalHotelMapOpen(false);
          setSelectedHotel(h);
          setView("hotel");
        }}
        initialHotelId={selectedHotel?.id}
        hotels={HOTELS}
      />

      {/* Modal de Reserva y Pago */}`
  );
}

fs.writeFileSync("src/GuestPage.tsx", content, "utf-8");
console.log("Successfully completed integration in GuestPage.tsx!");

