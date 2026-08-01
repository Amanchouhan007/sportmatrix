import Button from './Button'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger', disabled }) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm" onClick={disabled ? undefined : onClose} />
            <div className="relative bg-white rounded-2xl shadow-soft-xl w-full max-w-md p-6 fade-up">
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{title}</h3>
                <p className="text-sm text-surface-500 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={onClose} disabled={disabled}>Cancel</Button>
                    <Button variant={variant} onClick={onConfirm} disabled={disabled}>
                        {disabled ? 'Processing...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    )
}

