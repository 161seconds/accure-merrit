import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, Settings, User as UserIcon } from 'lucide-react'

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-ink/95 to-transparent">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 no-underline">
                <div className="w-8 h-8 border border-gold rounded-full flex items-center justify-center text-sm shadow-[0_0_10px_rgba(201,168,76,0.3)]">
                    🪷
                </div>
                <div>
                    <span className="font-display text-sm font-bold text-gold-light tracking-widest">ACCRUE MERIT</span>
                    <span className="block text-[8px] text-gold-dim tracking-[0.22em]">TÍCH ĐỨC HÀNH THIỆN</span>
                </div>
            </Link>

            {/* Right side */}
            {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                    {/* Streak badge */}
                    <div className="hidden sm:block px-3 py-1 rounded-full text-[10px] text-gold tracking-wider border border-gold/30 bg-gold/5">
                        🔥 {user.stats.streak} ngày
                    </div>

                    {/* Avatar + menu */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="w-8 h-8 rounded-full border border-gold bg-gradient-to-br from-[#3D2B08] to-[#1A1209] flex items-center justify-center text-sm cursor-pointer"
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </button>

                        {menuOpen && (
                            <div className="absolute top-[140%] right-0 bg-ink/95 backdrop-blur-xl border border-gold/25 rounded-lg min-w-[160px] py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] animate-[fadeIn_0.2s_ease]">
                                <div className="px-4 py-2 text-xs text-gold-dim border-b border-gold/10">{user.name}</div>
                                <button
                                    onClick={() => { setMenuOpen(false); navigate('/settings') }}
                                    className="w-full px-4 py-2.5 text-left text-xs text-parchment flex items-center gap-2.5 hover:bg-gold/10 transition-colors"
                                >
                                    <Settings size={14} /> Cài đặt
                                </button>
                                <button
                                    onClick={() => { setMenuOpen(false); handleLogout() }}
                                    className="w-full px-4 py-2.5 text-left text-xs text-[#E8A090] flex items-center gap-2.5 hover:bg-red/20 transition-colors"
                                >
                                    <LogOut size={14} /> Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-parchment/60">
                    <Link to="/login" className="hover:text-gold-light transition-colors">Đăng nhập</Link>
                    <span className="text-gold/30">|</span>
                    <Link to="/register" className="hover:text-gold-light transition-colors">Đăng ký</Link>
                </div>
            )}
        </header>
    )
}