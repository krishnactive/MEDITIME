/**
 * Parse MediTime slot fields (slotDate: "day_month_year", slotTime: "10:30 AM" or "14:30") to a local Date.
 */
export function parseAppointmentStart(slotDate, slotTime) {
  const parts = String(slotDate || "")
    .split("_")
    .map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [day, month, year] = parts;
  const t = String(slotTime || "").trim();
  let h = 0;
  let min = 0;
  const m12 = t.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (m12) {
    h = parseInt(m12[1], 10);
    min = parseInt(m12[2], 10);
    const ap = m12[3].toUpperCase();
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
  } else {
    const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m24) return null;
    h = parseInt(m24[1], 10);
    min = parseInt(m24[2], 10);
  }
  return new Date(year, month - 1, day, h, min, 0, 0);
}

/**
 * Appointments whose start is between minMinutes and maxMinutes from now (inclusive bounds on ms).
 * Default window supports ~1 min polling without missing the 30-minute-before instant.
 */
export function selectUpcomingReminders(appointments, options = {}) {
  const { minMinutes = 25, maxMinutes = 35 } = options;
  const now = Date.now();
  const minMs = minMinutes * 60 * 1000;
  const maxMs = maxMinutes * 60 * 1000;
  const out = [];
  for (const a of appointments) {
    if (a.cancelled || a.isCompleted) continue;
    const start = parseAppointmentStart(a.slotDate, a.slotTime);
    if (!start) continue;
    const startMs = start.getTime();
    if (startMs <= now) continue;
    const msLeft = startMs - now;
    if (msLeft >= minMs && msLeft <= maxMs) {
      out.push({
        appointmentId: String(a._id),
        slotDate: a.slotDate,
        slotTime: a.slotTime,
        minutesLeft: Math.max(1, Math.round(msLeft / 60000)),
        userData: a.userData,
        docData: a.docData,
        callRoomId: a.callRoomId,
      });
    }
  }
  return out;
}
