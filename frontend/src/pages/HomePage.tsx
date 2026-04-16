import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Ornament from '@/components/ui/Ornament'
import { KarmaTreeCanvas } from '@/components/KarmaTree3D'

const CLUSTER_THRESHOLD = 50

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const stats = user?.stats
  const totalPoints = stats ? stats.ducTotal : 0

  return (
    <div className="relative flex flex-col items-center justify-between flex-1 w-full min-h-screen py-12 overflow-hidden bg-[#0f1a14]">

      {/* --- LỚP 3D BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <KarmaTreeCanvas totalPoints={totalPoints} onAddPoint={() => { }} />
      </div>

      {/* --- PHẦN TOP: TIÊU ĐỀ --- */}
      <div className="relative z-10 flex flex-col items-center w-full px-6 mt-8 pointer-events-none">
        <div className="absolute top-[20%] left-[-5%] w-[110%] h-[70px] rounded-[50%] bg-[radial-gradient(ellipse_100%_40%_at_50%_50%,rgba(240,230,200,0.06)_0%,transparent_70%)] blur-[20px] animate-pulse" />

        <div className="text-center animate-[fadeIn_0.9s_ease]">
          <div className="text-[10px] tracking-[0.4em] text-gold-dim uppercase mb-2 drop-shadow-md">
            Karma Management System
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-none text-parchment drop-shadow-[0_0_60px_rgba(201,168,76,0.6)]">
            Tích Đức
            <em className="block not-italic text-gold-light">Hành Thiện</em>
          </h1>
          <Ornament className="mt-4 opacity-90" />
        </div>
      </div>

      {/* --- PHẦN MIDDLE: ĐIỂM SỐ & NÚT BẤM KÉO LÊN GIỮA --- */}
      <div className="relative z-10 flex flex-col items-center w-full px-6 pointer-events-none">

        {stats && (
          <div className="text-center mb-10 animate-[fadeIn_0.9s_0.5s_both]">
            <div className="text-[9px] tracking-[0.3em] text-gold-dim uppercase mb-2 drop-shadow-md">
              Công đức hiện tại
            </div>
            <div className="font-display text-6xl font-bold text-gold-light drop-shadow-[0_0_50px_rgba(201,168,76,0.8)]">
              {stats.ducTotal - stats.toiTotal}
            </div>
          </div>
        )}

        {/* Nút bấm ở trung tâm, dễ thao tác */}
        <div className="flex gap-4 w-full max-w-[280px] animate-[fadeIn_0.9s_0.8s_both] pointer-events-auto">
          <button
            onClick={() => navigate('/karma')}
            className="flex items-center justify-center flex-1 gap-2 py-3 text-sm transition-all shadow-xl btn-jade shadow-green-900/40 hover:shadow-green-500/60 hover:-translate-y-1"
          >
            🪷 Ghi đức
          </button>
          <button
            onClick={() => navigate('/karma')}
            className="flex items-center justify-center flex-1 gap-2 py-3 text-sm transition-all shadow-xl btn-red shadow-red-900/40 hover:shadow-red-500/60 hover:-translate-y-1"
          >
            ⚡ Ghi tội
          </button>
        </div>
      </div>

      {/* --- PHẦN BOTTOM: STATS BOARDS (Cách xa Footer) --- */}
      <div className="relative z-10 flex justify-center w-full px-6 mb-10 pointer-events-auto">
        {stats && (
          <div className="grid grid-cols-3 gap-4 w-full max-w-[360px] animate-[fadeIn_0.9s_1.1s_both]">
            {[
              { label: 'TỔNG ĐỨC', value: stats.ducTotal, color: 'text-jade-light' },
              { label: 'TỔNG TỘI', value: stats.toiTotal, color: 'text-[#E8A090]' },
              { label: 'GÕ MÕ', value: stats.moCount, color: 'text-gold-light' }
            ].map((s) => (
              <div key={s.label} className="p-4 text-center transition-all bg-[#0a100d]/60 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-[#0a100d]/80 hover:border-gold-dim/30 card">
                <div className="text-[9px] text-parchment/60 uppercase tracking-widest mb-1">{s.label}</div>
                <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}