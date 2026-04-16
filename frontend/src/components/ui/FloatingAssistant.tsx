import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; 
import { Bot, Settings, LogOut, MessageSquare, X, Sparkles } from 'lucide-react';

export default function FloatingAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { logout, user } = useAuth(); 

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        setIsOpen(false);
        logout();
        navigate('/login'); 
    };

    return (
        <div ref={menuRef} className="fixed z-50 bottom-6 left-6">

            {/* --- MENU POPUP --- */}
            <div
                className={`absolute bottom-full left-0 mb-4 w-60 bg-[#0a100d]/95 backdrop-blur-md border border-jade-900/50 rounded-2xl shadow-[0_0_40px_rgba(22,101,52,0.3)] transition-all duration-300 origin-bottom-left ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
                    }`}
            >
                {/* Header của Menu */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-jade-900/30 text-jade-light">
                            <Bot size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] text-gold-dim uppercase tracking-widest">Trợ lý</div>
                            <div className="font-bold text-parchment">Tuệ Năng AI</div>
                        </div>
                    </div>
                </div>

                {/* Danh sách các nút chức năng */}
                <div className="p-2">
                    <button
                        onClick={() => handleAction('/chat')}
                        className="flex items-center w-full gap-3 p-3 transition-colors rounded-xl text-parchment/80 hover:bg-white/5 hover:text-gold-light"
                    >
                        <MessageSquare size={18} />
                        <span className="text-sm font-medium">Trò chuyện với AI</span>
                    </button>

                    <button
                        onClick={() => handleAction('/settings')}
                        className="flex items-center w-full gap-3 p-3 transition-colors rounded-xl text-parchment/80 hover:bg-white/5 hover:text-gold-light"
                    >
                        <Settings size={18} />
                        <span className="text-sm font-medium">Cài đặt tài khoản</span>
                    </button>
                </div>

                {/* Nút Đăng xuất */}
                <div className="p-2 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full gap-3 p-3 transition-colors rounded-xl text-[#E8A090] hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                </div>
            </div>

            {/* --- NÚT FLOATING CHÍNH --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#166534] to-[#064e3b] text-parchment shadow-lg hover:shadow-[0_0_25px_rgba(74,222,128,0.4)] hover:scale-105 transition-all duration-300"
            >
                {/* Vòng sáng xoay nhẹ (trang trí) */}
                <div className="absolute inset-0 border rounded-full animate-[spin_4s_linear_infinite] border-gold-dim/30 border-t-gold-light" />

                {isOpen ? <X size={24} /> : <Sparkles size={24} className="text-gold-light" />}
            </button>

        </div>
    );
}