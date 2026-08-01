export default function SectionWrapper({ children, className = '', id = '' }) {
    return (
        <section id={id} className={`py-16 md:py-20 lg:py-28 ${className}`}>
            <div className="max-w-7xl mx-auto px-6">
                {children}
            </div>
        </section>
    )
}
