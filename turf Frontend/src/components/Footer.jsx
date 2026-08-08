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
    
    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <footer className="border-t border-[#E5E7EB] bg-white text-[#111827]">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-8">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-[#C8FF2E] border border-[#B5F000] flex items-center justify-center font-black text-[#111827] text-sm shadow-sm">SM</div>
                            <span className="text-lg font-black text-[#111827] tracking-tight">SportMatrix</span>
                        </div>
                        <p className="text-sm font-semibold text-[#6B7280] leading-relaxed max-w-xs">
                            The complete digital operating system for sports turfs. Manage everything from one platform.
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

                <div className="mt-16 pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-[#6B7280]">
                        © {new Date().getFullYear()} SportMatrix. All rights reserved.
                    </p>
                    <p className="text-sm font-semibold text-[#6B7280]">
                        Sports Business Operating System
                    </p>
                </div>
            </div>
        </footer>
    )
}
