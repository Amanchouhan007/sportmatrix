import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { saveGuestBooking } from '../../services/guestBookingService';

export default function GuestBookingPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    sport: '',
    venue: '',
    date: '',
    time: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const booking = {
        id: `GUEST-${Date.now()}`,
        sport: form.sport,
        venue: form.venue,
        date: form.date,
        time: form.time,
        amount: form.amount,
        status: 'Confirmed'
      };
      await saveGuestBooking(booking);
      if (addToast) addToast({ message: 'Guest Booking saved successfully!', type: 'success' });
      navigate('/');
    } catch (err) {
      console.error(err);
      if (addToast) addToast({ message: 'Failed to save booking', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-500 via-indigo-600 to-pink-500 p-4">
      <Card className="w-full max-w-md glassmorphism p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center text-white">Guest Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Sport" id="sport" name="sport" placeholder="e.g., Cricket" value={form.sport} onChange={handleChange} />
          <Input label="Venue" id="venue" name="venue" placeholder="Venue name" value={form.venue} onChange={handleChange} />
          <Input label="Date" id="date" name="date" type="date" value={form.date} onChange={handleChange} />
          <Input label="Time" id="time" name="time" type="time" value={form.time} onChange={handleChange} />
          <Input label="Amount (₹)" id="amount" name="amount" type="number" placeholder="0" value={form.amount} onChange={handleChange} />
          <Button type="submit" disabled={loading} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white">
            {loading ? 'Saving...' : 'Confirm Booking'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
