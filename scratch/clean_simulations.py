with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_text = f.read()

# 1. Update triggerSimulatedBooking in Dashboard
old_dash_sim = '''  function triggerSimulatedBooking() {
    playNewBookingSound();
    const code = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
    setLiveAlert(`Nueva reserva web recibida ${code}: Habitación Matrimonial Vista al Mar (2 noches · Pagada en línea).`);
    addAuditLog({
      usuario: "Motor de Reservas Web",
      rol: "Sistema",
      modulo: "Notificaciones",
      accion: "ALERTA_RESERVA_ENTRANTE",
      detalle: `Notificación de nueva reserva recibida en tiempo real ${code}`,
    });
  }'''

new_dash_sim = '''  function triggerSimulatedBooking() {
    playNewBookingSound();
    setLiveAlert(tx("Sonido de timbre y alerta de notificación comprobado correctamente."));
    setTimeout(() => setLiveAlert(null), 4000);
  }'''

# 2. Update handleSimulateIncomingWebBooking in Reservations
old_res_sim = '''  function handleSimulateIncomingWebBooking() {
    playNewBookingSound();
    const newId = `RES-${Math.floor(10000 + Math.random() * 89999)}`;
    const simulated: Reservation = {
      id: newId,
      guestName: "Valeria Andrade",
      guestEmail: "vandrade@turismo.ec",
      roomNumber: "Cupo Web",
      roomType: "Habitación Matrimonial Queen",
      checkIn: "2026-08-18",
      checkOut: "2026-08-20",
      nights: 2,
      status: "confirmed",
      total: 162,
      adults: 2,
      children: 0,
      source: "Portal AlojaManta",
      notes: "Pago acreditado · Pendiente validar voucher al arribo",
    };
    setReservations(items => [simulated, ...items]);
    setValidationFeedback({
      type: "ok",
      msg: `Nueva reserva web recibida ${newId} (${simulated.guestName}).`,
    });
    addAuditLog({
      usuario: "Motor de Reservas Web",
      rol: "Sistema",
      modulo: "Bandeja de Reservas",
      accion: "NUEVA_RESERVA_ENTRANTE",
      detalle: `Reserva entrante ${newId} (${simulated.guestName})`,
    });
  }'''

new_res_sim = '''  function handleSimulateIncomingWebBooking() {
    playNewBookingSound();
    setValidationFeedback({
      type: "ok",
      msg: tx("Sonido de timbre y alerta de notificación comprobado correctamente."),
    });
    setTimeout(() => setValidationFeedback(null), 4000);
  }'''

def do_rep(text, old_s, new_s):
    if old_s in text:
        return text.replace(old_s, new_s, 1)
    old_crlf = old_s.replace('\n', '\r\n')
    new_crlf = new_s.replace('\n', '\r\n')
    if old_crlf in text:
        return text.replace(old_crlf, new_crlf, 1)
    old_lf = old_s.replace('\r\n', '\n')
    new_lf = new_s.replace('\r\n', '\n')
    if old_lf in text:
        return text.replace(old_lf, new_lf, 1)
    raise ValueError(f"Not found:\n{old_s[:40]}")

app_text = do_rep(app_text, old_dash_sim, new_dash_sim)
app_text = do_rep(app_text, old_res_sim, new_res_sim)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_text)
print("Updated App.tsx successfully!")

with open('src/PaymentLinkModal.tsx', 'r', encoding='utf-8') as f:
    pay_text = f.read()

pay_old = '{tx("🧪 Simular Pago Exitoso")}'
pay_new = '{tx("💳 Confirmar Pago (Pasarela de Prueba)")}'

pay_text = do_rep(pay_text, pay_old, pay_new)
with open('src/PaymentLinkModal.tsx', 'w', encoding='utf-8') as f:
    f.write(pay_text)
print("Updated PaymentLinkModal.tsx successfully!")

