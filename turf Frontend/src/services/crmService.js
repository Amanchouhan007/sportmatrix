export const AVAILABLE_TURF_BRANCHES = [
    'SportZone Arena',
    'Champion Cricket Ground',
    'GameVault Center',
    'Royal Cricket Ground',
    'Skyline Turf',
    'ProKick Cricket Turf',
    'ProPlay Cricket Arena'
]

export const isDemoLead = (item) => {
    if (!item) return true;
    const name = (item.name || item.contactPerson || item.companyName || item.customerName || '').toLowerCase();
    const phone = (item.phone || item.customerPhone || item.userPhone || '').replace(/\D/g, '');
    const notes = (item.notes || '').toLowerCase();

    const demoKeywords = [
        'techcorp', 'wrf captain', 'wrf', 'customer@gmail', 'labcoordinator',
        'aascdsads', 'turf admin', 'website player', 'dummy', 'test company', 'sample', 'afwe',
        'vikram malhotra', 'amit kumar', 'indore premier league', 'dadar destroyers', 'ghjk', 'rahul sharma',
        'valued player'
    ];
    const demoPhones = [
        '123', '2255', '122355', '2345688', '123456', '9876500000', '1234567890',
        '5678', '9822233344', '9711122334', '9988877665', '9876543222', '9876543210'
    ];

    if (demoKeywords.some(d => name.includes(d) || notes.includes(d))) return true;
    if (demoPhones.some(p => phone === p || (p.length >= 4 && phone.includes(p)))) return true;
    if (name.includes('kiaan') && (phone === '122355' || phone.includes('122355') || phone === '123456')) return true;
    return false;
};

export const purgeDemoLeadsFromLocalStorage = () => {
    try {
        const keys = ['turf_crm_leads', 'corporate_leads', 'customer_bookings', 'guest_bookings'];
        keys.forEach(k => {
            const raw = localStorage.getItem(k);
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    const cleaned = arr.filter(item => !isDemoLead(item));
                    localStorage.setItem(k, JSON.stringify(cleaned));
                }
            }
        });
        // Clear mock SuperAdmin local storage caches
        ['sa_disputes', 'sports_owners_data', 'sa_users'].forEach(k => {
            const raw = localStorage.getItem(k);
            if (raw) {
                try {
                    const arr = JSON.parse(raw);
                    if (Array.isArray(arr) && arr.some(item => isDemoLead(item) || item.user === 'Priya Sharma' || item.name === 'Rajesh Sharma')) {
                        localStorage.removeItem(k);
                    }
                } catch {
                    localStorage.removeItem(k);
                }
            }
        });
    } catch (e) {
        console.warn('LocalStorage demo lead purge note:', e);
    }
};

const INITIAL_CRM_LEADS = []

export const getCrmLeads = () => {
    try {
        purgeDemoLeadsFromLocalStorage();
        const stored = localStorage.getItem('turf_crm_leads')
        let customLeads = stored ? JSON.parse(stored) : []

        // Dynamically pull customer bookings made on website
        const rawCust = localStorage.getItem('customer_bookings')
        const rawGuest = localStorage.getItem('guest_bookings')
        const cList = rawCust ? JSON.parse(rawCust) : []
        const gList = rawGuest ? JSON.parse(rawGuest) : []
        const allBookings = [...(Array.isArray(cList) ? cList : []), ...(Array.isArray(gList) ? gList : [])]

        const bookingLeads = allBookings.map((b, idx) => ({
            id: b.id || b.bookingId || `bmt_lead_${idx + 1}`,
            name: b.userName || b.customerName || b.name || 'Valued Player',
            phone: b.userPhone || b.phone || b.customerPhone || '',
            role: 'player',
            teamName: b.sport ? `${b.sport} Booking` : 'Turf Player',
            preferredSport: b.sport || 'Cricket',
            preferredSlot: `${b.time || b.slotTime || 'N/A'} (${b.date || b.slotDate || 'N/A'})`,
            turfBranch: b.venue || b.turfName || 'N/A',
            status: b.status === 'Cancelled' ? 'Cancelled' : 'Confirmed',
            totalBookings: 1,
            amount: b.amount ? `₹${Number(b.amount).toLocaleString('en-IN')}` : 'N/A',
            notes: `Real Slot Booking ${b.id || `BK-${idx + 1}`}`,
            createdAt: b.createdAt ? b.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        }))

        // Dynamically pull corporate & bulk booking proposal leads
        const corpLeads = JSON.parse(localStorage.getItem('corporate_leads') || '[]').map(c => ({
            id: `lead_corp_${c.id}`,
            name: c.contactPerson || c.companyName || 'Corporate Lead',
            phone: c.phone || '',
            role: 'corporate',
            teamName: c.companyName || 'Corporate League',
            preferredSport: c.eventType || 'Corporate Tournament',
            preferredSlot: `${c.estimatedPlayers || 'Bulk'} (${c.city || 'N/A'})`,
            turfBranch: c.city ? `${c.city} Turf Complex` : (c.preferredTurf || 'N/A'),
            status: c.status || 'Corporate Proposal',
            totalBookings: 1,
            notes: `Corporate event request for ${c.companyName || 'Client'} (${c.estimatedPlayers || 'N/A'}, Budget: ${c.budget || 'Custom'})`,
            createdAt: c.createdAt ? c.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        }))

        // Dynamically pull guest bookings
        const guestBookings = JSON.parse(localStorage.getItem('guest_bookings') || '[]').map(g => ({
            id: `lead_gbk_${g.id || Date.now()}`,
            name: g.customerName || g.name || 'Guest User',
            phone: g.phone || g.mobileNumber || '',
            role: 'individual',
            teamName: `${g.customerName || 'Guest'}'s Squad`,
            preferredSport: 'Cricket / Football',
            preferredSlot: `${g.slotTime || 'N/A'} (${g.slotDate || 'N/A'})`,
            turfBranch: g.turfName || 'N/A',
            status: 'Guest Booking',
            totalBookings: 1,
            notes: `Guest reservation for ${g.turfName || 'Turf'}` + (g.amount ? ` (₹${g.amount})` : ''),
            createdAt: g.createdAt ? g.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        }))

        // Combine all real-time lead sources & filter out demo data
        const allList = [...customLeads, ...corpLeads, ...bookingLeads, ...guestBookings]
            .filter(item => !isDemoLead(item))

        // Deduplicate leads by unique Phone Number or ID
        const seen = new Set()
        const deduplicated = []

        for (const item of allList) {
            const key = item.phone ? item.phone.replace(/\D/g, '') : item.id
            if (!seen.has(key)) {
                seen.add(key)
                deduplicated.push(item)
            }
        }

        return deduplicated
    } catch {
        return []
    }
}

export const saveCrmLead = (leadData) => {
    try {
        const stored = localStorage.getItem('turf_crm_leads')
        const customLeads = stored ? JSON.parse(stored) : []
        const newLead = {
            id: `lead_${Date.now()}`,
            status: 'Active',
            totalBookings: 1,
            createdAt: new Date().toISOString().split('T')[0],
            ...leadData
        }
        const updated = [newLead, ...customLeads]
        localStorage.setItem('turf_crm_leads', JSON.stringify(updated))

        // Async post to backend REST API
        import('./api').then(mod => {
            mod.default.post('/crm/leads', leadData).catch(e => console.warn('Backend REST CRM post note:', e.message))
        })

        return newLead
    } catch (err) {
        console.error('Failed to save CRM lead:', err)
    }
}

export const updateCrmLead = (id, updatedFields) => {
    const leads = getCrmLeads()
    const updated = leads.map(l => l.id === id ? { ...l, ...updatedFields } : l)
    localStorage.setItem('turf_crm_leads', JSON.stringify(updated))
    return updated
}

export const deleteCrmLead = (id) => {
    const leads = getCrmLeads()
    const updated = leads.filter(l => l.id !== id)
    localStorage.setItem('turf_crm_leads', JSON.stringify(updated))

    // Async delete from backend REST API
    import('./api').then(mod => {
        mod.default.delete(`/crm/leads/${id}`).catch(e => console.warn('Backend REST CRM delete note:', e.message))
    })

    return updated
}

// Offer Templates Generator
export const OFFER_TEMPLATES = [
    {
        id: 'morning_discount',
        type: 'Discount Voucher',
        title: '⚡ 20% Off Morning Cricket Slots',
        targetRole: 'team',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        message: (name, turf = 'SportZone Arena') => 
            `*🔥 SPECIAL TURF OFFER FOR ${name.toUpperCase()}!*\n\nBook any Morning Slot (6 AM - 11 AM) at *${turf}* this week and get flat *20% OFF*!\n\n🎟️ Promo Code: *MORNING20*\n📍 Location: Andheri West\n👉 Book Slot Now: https://sportturf.com/booking/1?code=MORNING20\n\n*Hurry, limited slots available!*`
    },
    {
        id: 'dare_to_win',
        type: 'Challenge Deal',
        title: '🔥 Dare to Play — Winner Gets Refund',
        targetRole: 'team',
        badgeColor: 'bg-[#B8F52A] text-[#121614] border-[#B8F52A]',
        message: (name, turf = 'SportZone Arena') => 
            `*🔥 DARE TO PLAY CHALLENGE INVITATION!*\n\nHey ${name}! Challenge an opponent team at *${turf}* with just ₹100 security deposit.\n\n🏆 *Winner gets 100% refund!* Loser pays the match fee.\n👉 Accept Dare & Lock Slot: https://sportturf.com/booking/1?mode=dare\n\n*Bring your best playing XI!*`
    },
    {
        id: 'umpire_earning_alert',
        type: 'Umpire Earning Slot',
        title: '🏆 Paid Umpire Duty Alert (₹500/Match)',
        targetRole: 'umpire',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        message: (name, turf = 'SportZone Arena') => 
            `*🚩 PAID UMPIRE DUTY ALERT!*\n\nHello ${name}! Certified referee required for Weekend Box Cricket Matches at *${turf}*.\n\n💰 *Payout: ₹500/Match* (Cash/UPI instantly)\n📅 Schedule: This Saturday (4 PM - 9 PM)\n👉 Confirm Availability: https://sportturf.com/umpire-accept?id=UMP99\n\n*Reply YES to confirm your slot!*`
    },
    {
        id: 'tournament_early_bird',
        type: 'Tournament Invite',
        title: '🏆 Super Cricket Championship Registration Open',
        targetRole: 'organizer',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        message: (name, turf = 'SportZone Arena') => 
            `*🏆 TOURNAMENT ORGANIZER ALERT!*\n\nHello ${name}! Registrations are officially open for the *Indore Premier Turf Championship* at *${turf}*.\n\n🥇 Prize Pool: *₹50,000*\n🛡️ Entry Fee: ₹2,500/Team\n👉 Register Your Team: https://sportturf.com/tournaments/t_001\n\n*Limited 16 team slots available!*`
    }
]

export const generateWhatsAppLink = (phone, text) => {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : ''
    const encodedText = encodeURIComponent(text)
    return `https://wa.me/${cleanPhone}?text=${encodedText}`
}
