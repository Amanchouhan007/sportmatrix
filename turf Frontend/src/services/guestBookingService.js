export function saveGuestBooking(booking) {
  const key = 'guest_bookings';
  try {
    const raw = localStorage.getItem(key);
    const bookings = raw ? JSON.parse(raw) : [];
    bookings.push(booking);
    localStorage.setItem(key, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save guest booking', e);
    throw e;
  }
}
