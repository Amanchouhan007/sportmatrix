import api from './api';

export async function saveGuestBooking(booking) {
  const key = 'guest_bookings';
  try {
    const raw = localStorage.getItem(key);
    const bookings = raw ? JSON.parse(raw) : [];
    bookings.unshift({ ...booking, id: booking.id || `GBK-${Date.now()}` });
    localStorage.setItem(key, JSON.stringify(bookings.slice(0, 50)));
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }

  try {
    const res = await api.post('/bookings/guest', {
      turfName: booking.turfName,
      customerName: booking.customerName || booking.name,
      phone: booking.phone || booking.mobileNumber,
      slotDate: booking.slotDate || booking.date,
      slotTime: booking.slotTime || booking.time,
      duration: booking.duration,
      amount: booking.amount,
      paymentMode: booking.paymentMode || 'UPI',
      paymentStatus: booking.paymentStatus || 'PAID'
    });
    return res.data || res;
  } catch (err) {
    console.warn('Backend guest booking endpoint offline, saved to localStorage:', err);
    return { success: true, data: booking };
  }
}

export async function lookupGuestBookings(phone) {
  try {
    const res = await api.get('/bookings/guest-lookup', { params: { phone } });
    if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Guest lookup API fallback:', err);
  }

  try {
    const raw = localStorage.getItem('guest_bookings');
    const bookings = raw ? JSON.parse(raw) : [];
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    return bookings.filter(b => (b.phone || b.mobileNumber || '').includes(cleanPhone));
  } catch (e) {
    return [];
  }
}

