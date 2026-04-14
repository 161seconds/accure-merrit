import { useLocation, useNavigate } from 'react-router-dom'
import { Home, BookOpen, Flame, Bell, Settings } from 'lucide-react'

const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/karma', icon: BookOpen, label: 'Sổ tay' },
    { path: '/incense', icon: Flame, label: 'Thắp nhang' },
    { path: '/wooden-fish', icon: Bell, label: 'Gõ mõ' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' }
]

export default function Footer() {
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <nav className="sticky bottom-0 z-50 flex justify-around items-center py-2 pb-3 bg-gradient-to-t from-ink/95 to-transparent border-t border-gold/10">
            {navItems.map((item) => {
                const active = location.pathname === item.path
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[52px] text-[8px] uppercase tracking-wider transition-colors cursor-pointer border-none bg-transparent ${active ? 'text-gold' : 'text-parchment/35 hover:text-gold'
                            }`}
                    >
                        <item.icon size={17} className={active ? 'drop-shadow-[0_0_5px_rgba(201,168,76,0.6)]' : ''} />
                        {item.label}
                    </button>
                )
            })}
        </nav>
    )
}