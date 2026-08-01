export default function Tabs({ tabs = [], activeTab, onChange }) {
    return (
        <div className="flex gap-1 bg-surface-100 p-1 rounded-xl overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${activeTab === tab.key
                            ? 'bg-white text-surface-900 shadow-soft'
                            : 'text-surface-500 hover:text-surface-700'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
