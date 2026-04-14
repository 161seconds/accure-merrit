import { useState, useEffect } from 'react'
import { woodenFishApi } from '@/api/woodenfish.api'
import { useAuth } from '@/contexts/AuthContext'
import PageTitle from '@/components/ui/PageTitle'

export default function WoodenFishPage() {
    const { user, updateUser } = useAuth()
    const [moCount, setMoCount] = useState(user?.stats.moCount || 0)
    const [ripple, setRipple] = useState(false)
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number }[]>([])
    let counter = 0

    useEffect(() => {
        woodenFishApi.getCount().then((res) => setMoCount(res.data.result.moCount)).catch(() => { })
    }, [])

    const handleTap = async () => {
        // Visual feedback ngay lập tức
        setRipple(true)
        setTimeout(() => setRipple(false), 300)

        const id = Date.now() + counter++
        const x = Math.random() * 40 - 20
        setFloatingTexts((prev) => [...prev, { id, x }])
        setTimeout(() => setFloatingTexts((prev) => prev.filter((t) => t.id !== id)), 1200)

        setMoCount((prev) => prev + 1)

        try {
            const res = await woodenFishApi.tap(1)
            setMoCount(res.data.result.moCount)
            // Update user stats
            if (user) {
                updateUser({
                    ...user,
                    stats: { ...user.stats, moCount: res.data.result.moCount, ducTotal: res.data.result.ducTotal }
                })
            }
        } catch { }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
            <PageTitle badge="Thiền định" title="Gõ" highlight="Mõ" />

            {/* Counter */}
            <div className="text-center mb-8">
                <div className="text-[8px] tracking-[0.3em] text-gold-dim uppercase mb-1">Tổng số lần gõ</div>
                <div className="font-display text-5xl font-bold text-gold-light drop-shadow-[0_0_30px_rgba(201,168,76,0.5)]">
                    {moCount.toLocaleString()}
                </div>
                <div className="text-[9px] text-gold-dim tracking-wider mt-1">功德 +1</div>
            </div>

            {/* Wooden fish button */}
            <div className="relative mb-8">
                {/* Floating +1 texts */}
                {floatingTexts.map((t) => (
                    <div
                        key={t.id}
                        className="absolute -top-4 left-1/2 text-gold-light font-display font-bold text-lg pointer-events-none animate-[floatUp_1.2s_ease-out_forwards]"
                        style={{ transform: `translateX(calc(-50% + ${t.x}px))` }}
                    >
                        +1
                    </div>
                ))}

                <button
                    onClick={handleTap}
                    className={`w-32 h-32 rounded-full border-2 border-gold/50 bg-gradient-to-br from-[#3D2B08] to-[#1A1209] flex items-center justify-center text-6xl cursor-pointer transition-all duration-150 shadow-[0_0_30px_rgba(201,168,76,0.15)] hover:shadow-[0_0_50px_rgba(201,168,76,0.3)] active:scale-95 ${ripple ? 'scale-90 shadow-[0_0_60px_rgba(201,168,76,0.5)]' : ''
                        }`}
                >
                    🪘
                </button>

                {/* Ripple ring */}
                {ripple && (
                    <div className="absolute inset-0 rounded-full border-2 border-gold/40 animate-ping pointer-events-none" />
                )}
            </div>

            <p className="text-xs text-parchment/30 italic text-center">Nhấn vào mõ để tích đức</p>
            <p className="text-[10px] text-parchment/20 mt-1">Mỗi lần gõ = +1 điểm công đức</p>

            <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateX(calc(-50% + var(--x, 0px))) translateY(0); }
          100% { opacity: 0; transform: translateX(calc(-50% + var(--x, 0px))) translateY(-80px); }
        }
      `}</style>
        </div>
    )
}