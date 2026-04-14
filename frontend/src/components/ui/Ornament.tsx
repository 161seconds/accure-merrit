export default function Ornament({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 mx-auto w-fit ${className}`}>
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-gold-dim" />
            <div className="w-1.5 h-1.5 bg-gold rotate-45 shadow-[0_0_8px_rgba(201,168,76,0.7)]" />
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-gold-dim" />
        </div>
    )
}