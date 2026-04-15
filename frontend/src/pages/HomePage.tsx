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
    <div className="relative flex flex-col items-center justify-center flex-1 w-full h-full min-h-screen overflow-hidden bg-[#050a06]">

      {/* --- LỚP 3D BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <KarmaTreeCanvas
          totalPoints={totalPoints}
          onAddPoint={() => console.log("Tree clicked!")}
        />
      </div>

      { }
      {/* Bao bọc bằng pointer-events-none để nhường quyền click/drag cho cây 3D ở dưới */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-6 pointer-events-none">

        {/* Mist effects */}
        <div className="absolute bottom-[30%] left-[-5%] w-[110%] h-[70px] rounded-[50%] bg-[radial-gradient(ellipse_100%_40%_at_50%_50%,rgba(240,230,200,0.055)_0%,transparent_70%)] blur-[20px] animate-pulse" />

        {/* Hero text */}
        <div className="text-center mb-8 animate-[fadeIn_0.9s_ease] mt-12">
          <div className="text-[9px] tracking-[0.4em] text-gold-dim uppercase mb-2 drop-shadow-md">
            Karma Management System
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-none text-parchment drop-shadow-[0_0_60px_rgba(201,168,76,0.5)]">
            Tích Đức
            <em className="block not-italic text-gold-light">Hành Thiện</em>
          </h1>
          <p className="mt-3 text-xs italic tracking-wider text-parchment/70 drop-shadow-md">
            "Gieo nhân lành, gặt quả ngọt"
          </p>
          <Ornament className="mt-3 opacity-80" />
        </div>

        {/* Score */}
        {stats && (
          <div className="text-center mb-8 animate-[fadeIn_0.9s_1.2s_both]">
            <div className="text-[8px] tracking-[0.3em] text-gold-dim uppercase mb-1 drop-shadow-md">
              Công đức hiện tại
            </div>
            <div className="font-display text-5xl font-bold text-gold-light drop-shadow-[0_0_40px_rgba(201,168,76,0.6)]">
              {stats.ducTotal - stats.toiTotal}
            </div>
            <div className="text-[9px] text-gold-dim tracking-[0.2em] mt-2 drop-shadow-md">
              ĐIỂM CÔNG ĐỨC
            </div>
          </div>
        )}

        {/* Quick actions - Phải bật lại pointer-events-auto để click được nút */}
        <div className="flex flex-col gap-3 w-full max-w-[200px] animate-[fadeIn_0.9s_1.5s_both] pointer-events-auto">
          <button
            onClick={() => navigate('/karma')}
            className="flex items-center justify-center gap-2 transition-all shadow-lg btn-jade shadow-green-900/50 hover:shadow-green-500/50"
          >
            🪷 Ghi đức
          </button>
          <button
            onClick={() => navigate('/karma')}
            className="flex items-center justify-center gap-2 transition-all shadow-lg btn-red shadow-red-900/50 hover:shadow-red-500/50"
          >
            ⚡ Ghi tội
          </button>
        </div>

        { }
        {stats && (
          <div className="grid grid-cols-3 gap-3 mt-12 w-full max-w-[340px] animate-[fadeIn_0.9s_1.8s_both] pointer-events-auto">
            {[
              { label: 'Đức', value: stats.ducTotal, color: 'text-jade-light' },
              { label: 'Tội', value: stats.toiTotal, color: 'text-[#E8A090]' },
              { label: 'Gõ mõ', value: stats.moCount, color: 'text-gold-light' }
            ].map((s) => (
              <div key={s.label} className="p-3 text-center transition-all border bg-black/40 backdrop-blur-sm border-white/5 rounded-xl hover:bg-black/60 card">
                <div className="text-[8px] text-parchment/60 uppercase tracking-wider">{s.label}</div>
                <div className={`font-display text-xl font-bold mt-1 ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}