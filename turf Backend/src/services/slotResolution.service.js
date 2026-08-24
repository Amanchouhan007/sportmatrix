/**
 * Shared helper to resolve-or-create the real Slot a booking targets, using the
 * branch's real BranchSport pricing configuration. Relies on the DB-level
 * unique constraint on (branchId, courtName, slotDate, startTime) for atomicity.
 */
const prisma = require('../config/prisma');

const genSlotId = () => `slot_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

/**
 * @returns {{ ok: true, slot } | { ok: false, code, message }}
 */
async function resolveOrCreateSlot({ branchId, sportId, courtName, slotDate, startTime, endTime, durationMinutes }) {
    const branchSport = await prisma.branchSport.findUnique({ where: { branchId_sportId: { branchId, sportId } } });
    if (!branchSport || branchSport.status !== 'ACTIVE') {
        return { ok: false, code: 404, message: 'This sport is not configured/active for this branch.' };
    }

    const startHour = Number(startTime.split(':')[0]);
    const isPeak = startHour >= 18 || startHour < 6;

    let slot;
    try {
        slot = await prisma.slot.upsert({
            where: { branchId_courtName_slotDate_startTime: { branchId, courtName, slotDate: new Date(slotDate), startTime } },
            update: {},
            create: {
                id: genSlotId(),
                branchId, sportId, courtName,
                slotDate: new Date(slotDate),
                startTime, endTime,
                duration: durationMinutes || branchSport.slotDuration,
                regularPrice: branchSport.regularPrice,
                peakPrice: branchSport.peakPrice,
                isPeakHour: isPeak,
                status: 'AVAILABLE'
            }
        });
    } catch (e) {
        return { ok: false, code: 409, message: 'Could not resolve the requested slot.' };
    }

    if (slot.status !== 'AVAILABLE') {
        return { ok: false, code: 409, message: `This slot is no longer available (current status: ${slot.status}).` };
    }

    return { ok: true, slot };
}

module.exports = { resolveOrCreateSlot };
