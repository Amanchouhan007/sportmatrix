export const AVAILABLE_TURF_BRANCHES = [
    'SportZone Arena',
    'Champion Cricket Ground',
    'GameVault Center',
    'Royal Cricket Ground',
    'Skyline Turf',
    'ProKick Cricket Turf',
    'ProPlay Cricket Arena'
]

const INITIAL_CRM_LEADS = [
    {
        id: 'lead_001',
        name: 'Rahul Sharma',
        phone: '+91 98765 11111',
        role: 'team', // 'team' | 'player' | 'umpire' | 'organizer'
        teamName: 'Andheri Strikers',
        preferredSport: 'Cricket',
        preferredSlot: 'Weekend Evenings (6 PM - 9 PM)',
        turfBranch: 'SportZone Arena',
        status: 'Hot Lead',
        totalBookings: 12,
        notes: 'Plays 8-a-side box cricket every Saturday.',
        createdAt: '2026-07-15'
    },
    {
        id: 'lead_002',
        name: 'Vikram Malhotra',
        phone: '+91 98222 33344',
        role: 'umpire',
        teamName: 'BCA Certified Official',
        preferredSport: 'Cricket',
        preferredSlot: 'All Days',
        turfBranch: 'Champion Cricket Ground',
        status: 'Active',
        totalBookings: 24,
        notes: 'Senior Umpire. Available for weekend tournaments. Fee: ₹500/match.',
        createdAt: '2026-06-10'
    },
    {
        id: 'lead_003',
        name: 'Amit Kumar',
        phone: '+91 97111 22334',
        role: 'player',
        teamName: 'Free Agent Player',
        preferredSport: 'Cricket',
        preferredSlot: 'Morning Slots (6 AM - 10 AM)',
        turfBranch: 'SportZone Arena',
        status: 'Active',
        totalBookings: 5,
        notes: 'Top batsman, looking for open challenge matches.',
        createdAt: '2026-08-01'
    },
    {
        id: 'lead_004',
        name: 'Indore Premier League Org',
        phone: '+91 99888 77665',
        role: 'organizer',
        teamName: 'IPL Indore Event Group',
        preferredSport: 'Cricket',
        preferredSlot: 'Full Day Weekend',
        turfBranch: 'Royal Cricket Ground',
        status: 'Hot Lead',
        totalBookings: 2,
        notes: 'Looking to book full turf for 3-day tournament in Sept.',
        createdAt: '2026-07-28'
    },
    {
        id: 'lead_005',
        name: 'Siddharth Roy',
        phone: '+91 91234 56789',
        role: 'umpire',
        teamName: 'Licensed Referee',
        preferredSport: 'Cricket',
        preferredSlot: 'Sunday Afternoon',
        turfBranch: 'GameVault Center',
        status: 'Active',
        totalBookings: 18,
        notes: 'Specialist in Box Cricket rules. Fee: ₹400/match.',
        createdAt: '2026-05-20'
    },
    {
        id: 'lead_006',
        name: 'Dadar Destroyers Captain',
        phone: '+91 98765 43222',
        role: 'team',
        teamName: 'Dadar Destroyers',
        preferredSport: 'Cricket',
        preferredSlot: 'Night Floodlight Slots',
        turfBranch: 'Skyline Turf',
        status: 'Active',
        totalBookings: 8,
        notes: 'Aggressive team. Loves Dare-to-Play challenge matches.',
        createdAt: '2026-08-05'
    }
]

export const getCrmLeads = () => {
    try {
        const stored = localStorage.getItem('turf_crm_leads')
        let customLeads = stored ? JSON.parse(stored) : []

        // Dynamically pull customer bookings made on website
        const bookings = JSON.parse(localStorage.getItem('customer_bookings') || '[]')
        const bookingLeads = bookings.map(b => ({
            id: `lead_bk_${b.id}`,
            name: b.customerName || b.captainName || 'Website Player',
            phone: b.customerPhone || b.captainPhone || '+91 98765 00000',
            role: 'team',
            teamName: b.teamAName || `${b.customerName || 'Player'}'s Team`,
            preferredSport: b.sport || 'Cricket',
            preferredSlot: `${b.time || '6:00 PM'} (${b.date || 'Today'})`,
            turfBranch: b.venue || 'SportZone Arena',
            status: 'Hot Lead',
            totalBookings: 1,
            notes: `Website booking ${b.id} (${b.amount || 'Paid'})`,
            createdAt: b.createdAt ? b.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        }))

        // Dynamically pull corporate & bulk booking proposal leads
        const corpLeads = JSON.parse(localStorage.getItem('corporate_leads') || '[]').map(c => ({
            id: `lead_corp_${c.id}`,
            name: c.contactPerson || c.companyName || 'Corporate Lead',
            phone: c.phone || '+91 98765 00000',
            role: 'corporate',
            teamName: c.companyName || 'Corporate League',
            preferredSport: c.eventType || 'Corporate Tournament',
            preferredSlot: `${c.estimatedPlayers || 'Bulk'} (${c.city || 'Indore'})`,
            turfBranch: c.city ? `${c.city} Turf Complex` : 'Indore Turf Arena',
            status: c.status || 'Corporate Proposal',
            totalBookings: 1,
            notes: `Corporate event request for ${c.companyName} (${c.estimatedPlayers || '20+ players'}, Budget: ${c.budget || 'Custom'})`,
            createdAt: c.createdAt ? c.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        }))

        // Dynamically pull guest bookings
        const guestBookings = JSON.parse(localStorage.getItem('guest_bookings') || '[]').map(g => ({
            id: `lead_gbk_${g.id || Date.now()}`,
            name: g.customerName || g.name || 'Guest User',
            phone: g.phone || g.mobileNumber || '+91 98765 00000',
            role: 'individual',
            teamName: `${g.customerName || 'Guest'}'s Squad`,
            preferredSport: 'Cricket / Football',
            preferredSlot: `${g.slotTime || '6:00 PM'} (${g.slotDate || 'Today'})`,
            turfBranch: g.turfName || 'Indore Turf Arena',
            status: 'Guest Booking',
            totalBookings: 1,
            notes: `Guest reservation for ${g.turfName || 'Arena'} (₹${g.amount || 900})`,
            createdAt: g.createdAt ? g.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        }))

        // Combine all lead sources
        const allList = [...customLeads, ...corpLeads, ...bookingLeads, ...guestBookings, ...INITIAL_CRM_LEADS]

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
        return INITIAL_CRM_LEADS
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
