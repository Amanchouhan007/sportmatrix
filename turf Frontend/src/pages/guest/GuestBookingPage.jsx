import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { saveGuestBooking } from '../../services/guestBookingService';
import api from '../../services/api';

export default function GuestBookingPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [turfs, setTurfs] = useState([]);
  const [sports, setSports] = useState([]);
  const [loadingTurfs, setLoadingTurfs] = useState(true);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    branchId: '',
    sportId: '',
    date: '',
    time: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/turfs').then((res) => {
      if (res?.success) setTurfs(res.data);
    }).catch(() => addToast?.({ message: 'Failed to load turfs.', type: 'error' }))
      .finally(() => setLoadingTurfs(false));
  }, []);

  useEffect(() => {
    if (!form.branchId) { setSports([]); return; }
    api.get(`/sports/branch/${form.branchId}`).then((res) => {
      if (res?.success) setSports(res.data.filter(s => s.status === 'ACTIVE'));
    }).catch(() => setSports([]));
  }, [form.branchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value, ...(name === 'branchId' ? { sportId: '' } : {}) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.branchId || !form.sportId || !form.date || !form.time) {
      addToast?.({ message: 'Please fill in all fields.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const [h] = form.time.split(':').map(Number);
      const endTime = `${String(h + 1).padStart(2, '0')}:00:00`;

      const result = await saveGuestBooking({
        customerName: form.name,
        phone: form.phone,
        branchId: form.branchId,
        sportId: form.sportId,
        courtName: 'Court 1',
        slotDate: form.date,
        startTime: `${form.time}:00`,
        endTime,
      });

      addToast?.({ message: `Booking confirmed! Reference: ${result.data.id}`, type: 'success' });
      navigate('/');
    } catch (err) {
      console.error(err);
      addToast?.({ message: err.message || 'Failed to save booking', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4 bg-[#F8FAFC] min-h-[calc(100vh-64px)] relative">
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <Card className="w-full max-w-md bg-white border border-slate-200/80 shadow-xl rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-black text-center text-slate-900 tracking-tight">Guest Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Your Name" id="name" name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
          <Input label="Mobile Number" id="phone" name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} />

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Venue</label>
            <select name="branchId" value={form.branchId} onChange={handleChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">{loadingTurfs ? 'Loading venues...' : 'Select a venue'}</option>
              {turfs.map(t => <option key={t.id} value={t.id}>{t.name} ({t.city})</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block">Sport</label>
            <select name="sportId" value={form.sportId} onChange={handleChange} disabled={!form.branchId} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">{form.branchId ? 'Select a sport' : 'Select a venue first'}</option>
              {sports.map(s => <option key={s.id} value={s.sportId.id}>{s.name} (₹{s.regularPrice}/hr)</option>)}
            </select>
          </div>

          <Input label="Date" id="date" name="date" type="date" value={form.date} onChange={handleChange} />
          <Input label="Time" id="time" name="time" type="time" value={form.time} onChange={handleChange} />
          <Button type="submit" disabled={loading} className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white">
            {loading ? 'Saving...' : 'Confirm Booking'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
