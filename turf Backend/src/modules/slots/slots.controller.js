const prisma = require('../../config/prisma');

const genId = () => `slot_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const toDateStr = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const formatSlot = (r) => ({
    id: r.id,
    _id: r.id,
    branchId: r.branchId,
    sportId: r.sport ? { id: r.sport.id, _id: r.sport.id, name: r.sport.name, icon: r.sport.icon } : (r.sportId || null),
    courtName: r.courtName,
    date: toDateStr(r.slotDate),
    slotDate: toDateStr(r.slotDate),
    startTime: r.startTime ? r.startTime.substring(0, 5) : '',
    endTime: r.endTime ? r.endTime.substring(0, 5) : '',
    duration: r.duration,
    regularPrice: Number(r.regularPrice),
    price: r.isPeakHour ? Number(r.peakPrice) : Number(r.regularPrice),
    peakPrice: Number(r.peakPrice),
    isPeakHour: !!r.isPeakHour,
    status: r.status,
    notes: r.notes || '',
    virtual: !!r.virtual
});

/**
 * Builds the full day's worth of time-slots for a branch+sport from its real
 * BranchSport configuration (opening/closing time, court count, pricing).
 * Slots not yet persisted are returned as ephemeral "virtual" AVAILABLE slots --
 * they only become real rows once a booking actually holds one.
 */
const buildVirtualSlotsForDay = (branchSport, date, existingByCourtTime) => {
    const virtual = [];
    const [openH] = branchSport.openingTime.split(':').map(Number);
    const [closeH] = branchSport.closingTime.split(':').map(Number);
    const durationMin = branchSport.slotDuration || 60;
    const stepHours = durationMin / 60;

    for (let court = 1; court <= (branchSport.totalCourts || 1); court++) {
        const courtName = `Court ${court}`;
        for (let h = openH; h < closeH; h += stepHours) {
            const startTime = `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}:00`;
            const endH = h + stepHours;
            const endTime = `${String(Math.floor(endH)).padStart(2, '0')}:${endH % 1 ? '30' : '00'}:00`;
            const key = `${courtName}|${startTime}`;
            if (existingByCourtTime.has(key)) continue;

            const isPeak = Math.floor(h) >= 18 || Math.floor(h) < 6;
            virtual.push({
                id: `virtual_${branchSport.branchId}_${branchSport.sportId}_${courtName.replace(' ', '')}_${date}_${startTime.replace(/:/g, '')}`,
                branchId: branchSport.branchId,
                sportId: branchSport.sport,
                courtName,
                slotDate: date,
                startTime,
                endTime,
                duration: durationMin,
                regularPrice: branchSport.regularPrice,
                peakPrice: branchSport.peakPrice,
                isPeakHour: isPeak,
                status: 'AVAILABLE',
                notes: '',
                virtual: true
            });
        }
    }
    return virtual;
};

const getSlots = async (req, res) => {
    const { branchId, date, sportId, courtName } = req.query;

    try {
        const where = {};
        if (branchId) where.branchId = branchId;
        if (date) where.slotDate = new Date(date);
        if (sportId) where.sportId = sportId;
        if (courtName) where.courtName = courtName;

        const persisted = await prisma.slot.findMany({ where, include: { sport: true }, orderBy: { startTime: 'asc' } });
        let allSlots = persisted.map(formatSlot);

        // Only synthesize the remaining open slots when the caller gave us enough
        // to resolve a real BranchSport pricing/hours configuration.
        if (branchId && sportId && date) {
            const branchSport = await prisma.branchSport.findUnique({
                where: { branchId_sportId: { branchId, sportId } },
                include: { sport: true }
            });
            if (branchSport && branchSport.status === 'ACTIVE') {
                const existingByCourtTime = new Set(persisted.map(s => `${s.courtName}|${s.startTime}`));
                const virtual = buildVirtualSlotsForDay(
                    { ...branchSport, sport: branchSport.sport },
                    date,
                    existingByCourtTime
                ).map(formatSlot);
                allSlots = allSlots.concat(courtName ? virtual.filter(v => v.courtName === courtName) : virtual);
            }
        }

        allSlots.sort((a, b) => (a.courtName + a.startTime).localeCompare(b.courtName + b.startTime));

        return res.status(200).json({ success: true, data: allSlots });
    } catch (error) {
        console.error('Fetch slots error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching slots.' });
    }
};

const getSlotById = async (req, res) => {
    try {
        const slot = await prisma.slot.findUnique({ where: { id: req.params.id }, include: { sport: true } });
        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found.' });
        }
        return res.status(200).json({ success: true, data: formatSlot(slot) });
    } catch (error) {
        console.error('Fetch slot by id error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching slot.' });
    }
};

const assertBranchAccess = async (branchId, user) => {
    if (user.role === 'SUPER_ADMIN') return true;
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    return !!branch && branch.ownerUserId === user.id;
};

const createSlot = async (req, res) => {
    const { branchId, sportId, courtName, slotDate, startTime, endTime, duration, regularPrice, peakPrice, isPeakHour } = req.body;

    if (!branchId || !sportId || !courtName || !slotDate || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: 'branchId, sportId, courtName, slotDate, startTime, and endTime are required fields.' });
    }

    try {
        if (!(await assertBranchAccess(branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }

        const slot = await prisma.slot.create({
            data: {
                id: genId(),
                branchId, sportId, courtName,
                slotDate: new Date(slotDate),
                startTime, endTime,
                duration: duration || 60,
                regularPrice: regularPrice || 0,
                peakPrice: peakPrice || 0,
                isPeakHour: !!isPeakHour,
                status: 'AVAILABLE'
            }
        });

        return res.status(201).json({ success: true, message: 'Slot created successfully', data: formatSlot(slot) });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, message: 'A slot already exists for this court/date/time.' });
        }
        console.error('Create slot error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error creating slot.' });
    }
};

const updateSlot = async (req, res) => {
    const { id } = req.params;
    const { regularPrice, peakPrice, courtName } = req.body;

    try {
        const existing = await prisma.slot.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Slot configuration not found.' });
        }
        if (!(await assertBranchAccess(existing.branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }

        await prisma.slot.update({
            where: { id },
            data: { regularPrice: regularPrice ?? undefined, peakPrice: peakPrice ?? undefined, courtName: courtName ?? undefined }
        });

        return res.status(200).json({ success: true, message: 'Slot updated successfully' });
    } catch (error) {
        console.error('Update slot error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error updating slot.' });
    }
};

const updateSlotStatus = async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['AVAILABLE', 'BOOKED', 'BLOCKED', 'COMPLETED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be one of: AVAILABLE, BOOKED, BLOCKED, COMPLETED.' });
    }

    try {
        const existing = await prisma.slot.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Slot configuration not found.' });
        }
        if (!(await assertBranchAccess(existing.branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }

        await prisma.slot.update({ where: { id }, data: { status, notes: notes || '' } });
        return res.status(200).json({ success: true, message: `Slot status updated to ${status}` });
    } catch (error) {
        console.error('Update slot status error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error updating status.' });
    }
};

const deleteSlot = async (req, res) => {
    const { id } = req.params;

    try {
        const existing = await prisma.slot.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Slot configuration not found.' });
        }
        if (!(await assertBranchAccess(existing.branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }

        await prisma.slot.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Slot deleted successfully' });
    } catch (error) {
        console.error('Delete slot error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error deleting slot.' });
    }
};

module.exports = {
    getSlots,
    getSlotById,
    createSlot,
    updateSlot,
    updateSlotStatus,
    deleteSlot,
    genId
};
