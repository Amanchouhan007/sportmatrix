import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const footerLinks = {
    Product: ['Features', 'Modules', 'Pricing', 'Integrations', 'Changelog'],
    Subscription: ['7-Day Free Trial', 'Basic Plan', 'Premium Plan'],
    Company: ['About', 'Careers', 'Blog', 'Press', 'Membership', 'Contact'],
    Resources: ['Documentation', 'API Reference', 'Help Center', 'Community', 'Status'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
}

export default function Footer() {
    const navigate = useNavigate()
    const [info, setInfo] = useState({
        addressLine1: '2341/E, Sudama Nagar',
        cityStateCountry: 'Indore, M.P.',
        email: 'info@kiaantechnology.com',
        phone: '+91-97521 00980',
        poweredBy: 'Powered by Kiaan Technology'
    })

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';
        fetch(`${API_URL}/settings/contact-info`)
            .then(res => res.json())
            .then(data => {
                if (data?.success && data?.data) {
                    setInfo(data.data)
                }
            })
            .catch(() => {})
    }, [])
    
    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <footer className="border-t border-[#E5E7EB] bg-white text-[#111827]">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-8">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/images/kiaan_gold_logo.jpg?v=2" alt="Kiaan Technology Turf Cricket Arena" className="w-10 h-10 rounded-xl object-cover shadow-md border border-amber-300/40" />
                            <div className="flex flex-col">
                                <span className="text-lg font-black text-slate-900 tracking-tight uppercase">KIAAN <span className="text-amber-500 font-black">TURF</span></span>
                                <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider">KIAAN TECHNOLOGY • CRICKET ARENA</span>
                            </div>
                        </div>
                        <p className="text-sm font-semibold text-[#6B7280] leading-relaxed max-w-xs">
                            The complete enterprise sports venue digital management ecosystem by Kiaan Technologies.
                        </p>
                        <div className="flex gap-4">
                            {['X', 'in', 'gh', 'yt'].map((social) => (
                                <button
                                    key={social}
                                    className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#C8FF2E] hover:border-[#B5F000] flex items-center justify-center text-[#6B7280] hover:text-[#111827] text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm"
                                >
                                    {social}
                                </button>
                            ))}
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-black text-[#111827] mb-4 uppercase tracking-wider">{category}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <button
                                            onClick={() => {
                                                if (category === 'Subscription') {
                                                    navigate('/membership')
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                } else {
                                                    const id = link.toLowerCase().replace(/\s+/g, '-')
                                                    scrollTo(id)
                                                }
                                            }}
                                            className="text-sm font-bold text-[#6B7280] hover:text-[#16A34A] transition-colors duration-200 cursor-pointer text-left"
                                        >
                                            {link}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#6B7280]">
                    <p>
                        © {new Date().getFullYear()} SportMatrix. All rights reserved. <span className="font-extrabold text-slate-800">{info.poweredBy || 'Powered by Kiaan Technology'}</span>
                    </p>
                    <p>
                        📍 {info.addressLine1}, {info.cityStateCountry} | 📞 {info.phone} | ✉️ {info.email}
                    </p>
                </div>
            </div>
        </footer>
    )
}
