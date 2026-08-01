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
        <footer className="border-t border-white/5 bg-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-8">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-white text-sm">SM</div>
                            <span className="text-lg font-bold text-white tracking-tight">SportMatrix</span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                            The complete digital operating system for sports turfs. Manage everything from one platform.
                        </p>
                        <div className="flex gap-4">
                            {['X', 'in', 'gh', 'yt'].map((social) => (
                                <button
                                    key={social}
                                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 flex items-center justify-center text-slate-400 hover:text-white text-xs font-medium transition-all duration-200 cursor-pointer"
                                >
                                    {social}
                                </button>
                            ))}
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
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
                                            className="text-sm text-slate-500 hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-left"
                                        >
                                            {link}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-600">
                        © {new Date().getFullYear()} SportMatrix. All rights reserved.
                    </p>
                    <p className="text-sm text-slate-600">
                        Sports Business Operating System
                    </p>
                </div>
            </div>
        </footer>
    )
}
