import { ReactNode } from 'react'

interface Props {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
    actions?: ReactNode
}

export default function Dialog({ open, onClose, title, children, actions }: Props) {
    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm flex items-center justify-center transition-opacity"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-[#1A1208] to-ink border border-gold rounded-2xl p-6 w-[90%] max-w-[360px] text-center animate-[scaleIn_0.3s_ease]"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-display text-lg text-gold-light font-bold mb-2">{title}</h3>
                <div className="text-sm text-parchment mb-5 leading-relaxed">{children}</div>
                <div className="flex gap-3 justify-center">
                    {actions || (
                        <button className="btn-gold min-w-[100px]" onClick={onClose}>
                            Đồng ý
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}