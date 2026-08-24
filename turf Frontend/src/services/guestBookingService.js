import api from './api';

/**
 * Creates a real guest booking against a specific branch/sport/court/slot.
 * No localStorage fallback -- a failed booking is a real failure, not a
 * silently-faked success.
 */
export async function saveGuestBooking(booking) {
  const res = await api.post('/bookings/guest', {
    branchId: booking.branchId,
    sportId: booking.sportId,
    courtName: booking.courtName || 'Court 1',
    slotDate: booking.slotDate || booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    customerName: booking.customerName || booking.name,
    phone: booking.phone || booking.mobileNumber,
    notes: booking.notes
  });
  if (!res || res.success === false) {
    throw new Error(res?.message || 'Failed to create guest booking.');
  }
  return res;
}

/** Looks up a guest's real bookings by phone number. */
export async function lookupGuestBookings(phone) {
  const res = await api.get('/bookings/guest-lookup', { params: { phone } });
  if (!res || res.success === false) {
    throw new Error(res?.message || 'Failed to look up bookings.');
  }
  return res.data || [];
}
