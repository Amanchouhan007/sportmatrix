import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiX } from 'react-icons/hi'

const ToastContext = createContext()

export function useToast() { return useContext(ToastContext) }

const icons = {
    success: <HiCheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <HiExclamationCircle className="w-5 h-5 text-danger-500" />,
    info: <HiInformationCircle className="w-5 h-5 text-primary-500" />,
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((toastInput, typeInput = 'info', duration = 4000) => {
        const id = Date.now()
        let message = '';
        let type = typeInput;

        if (typeof toastInput === 'object' && toastInput !== null) {
            message = toastInput.message || '';
            type = toastInput.type || typeInput;
        } else {
            message = toastInput;
        }

        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[200] space-y-3">
                {toasts.map((t) => (
                    <div 
                        key={t.id} 
                        className={`flex items-center gap-3 rounded-xl border shadow-soft-lg px-4 py-3 min-w-72 fade-up ${
                            t.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-100' 
                                : t.type === 'error' 
                                ? 'bg-red-50 border-red-100' 
                                : 'bg-white border-surface-200'
                        }`}
                    >
                        {icons[t.type] || icons.info}
                        <p 
                            className={`text-sm font-medium flex-1 ${
                                t.type === 'success' 
                                    ? 'text-emerald-800' 
                                    : t.type === 'error' 
                                    ? 'text-red-800' 
                                    : 'text-surface-700'
                            }`}
                        >
                            {t.message}
                        </p>
                        <button 
                            onClick={() => removeToast(t.id)} 
                            className={`cursor-pointer ${
                                t.type === 'success' 
                                    ? 'text-emerald-400 hover:text-emerald-600' 
                                    : t.type === 'error' 
                                    ? 'text-red-400 hover:text-red-600' 
                                    : 'text-surface-400 hover:text-surface-600'
                            }`}
                        >
                            <HiX className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}


