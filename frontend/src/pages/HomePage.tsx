import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Ornament from '@/components/ui/Ornament'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const stats = user?.stats

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 px-6 overflow-hidden">
      {/* Mist effects */}
      <div className="absolute bottom-[30%] left-[-5%] w-[110%] h-[70px] rounded-[50%] bg-[radial-gradient(ellipse_100%_40%_at_50%_50%,rgba(240,230,200,0.055)_0%,transparent_70%)] blur-[20px] animate-pulse pointer-events-none" />

      {/* Hero text */}
      <div className="text-center mb-8 animate-[fadeIn_0.9s_ease]">
        <div className="text-[9px] tracking-[0.4em] text-gold-dim uppercase mb-2">Karma Management System</div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-none text-parchment drop-shadow-[0_0_60px_rgba(201,168,76,0.25)]">
          Tích Đức
          <em className="block not-italic text-gold-light">Hành Thiện</em>
        </h1>
        <p className="mt-3 text-xs italic tracking-wider text-parchment/45">
          "Gieo nhân lành, gặt quả ngọt"
        </p>
        <Ornament className="mt-3" />
      </div>

      {/* Score */}
      {stats && (
        <div className="text-center mb-8 animate-[fadeIn_0.9s_1.2s_both]">
          <div className="text-[8px] tracking-[0.3em] text-gold-dim uppercase mb-1">Công đức hiện tại</div>
          <div className="font-display text-4xl font-bold text-gold-light drop-shadow-[0_0_30px_rgba(201,168,76,0.5)]">
            {stats.ducTotal - stats.toiTotal}
          </div>
          <div className="text-[9px] text-gold-dim tracking-[0.2em] mt-1">ĐIỂM CÔNG ĐỨC</div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-col gap-3 w-full max-w-[200px] animate-[fadeIn_0.9s_1.5s_both]">
        <button onClick={() => navigate('/karma')} className="flex items-center justify-center gap-2 btn-jade">
          🪷 Ghi đức
        </button>
        <button onClick={() => navigate('/karma')} className="flex items-center justify-center gap-2 btn-red">
          ⚡ Ghi tội
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mt-8 w-full max-w-[340px] animate-[fadeIn_0.9s_1.8s_both]">
          {[
            { label: 'Đức', value: stats.ducTotal, color: 'text-jade-light' },
            { label: 'Tội', value: stats.toiTotal, color: 'text-[#E8A090]' },
            { label: 'Gõ mõ', value: stats.moCount, color: 'text-gold-light' }
          ].map((s) => (
            <div key={s.label} className="p-3 text-center card">
              <div className="text-[8px] text-parchment/40 uppercase tracking-wider">{s.label}</div>
              <div className={`font-display text-lg font-bold mt-1 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}