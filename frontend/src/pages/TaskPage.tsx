import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, BookOpen, Trophy, Flame, Loader2, Target } from 'lucide-react';
import Ornament from '@/components/ui/Ornament';

interface Mission {
    _id?: string;
    id: string;
    icon: string;
    name: string;
    desc: string;
    pts: number;
    streakBonus?: boolean;
    isChain: boolean;
    chainDays?: number;
}

export default function TaskPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [completed, setCompleted] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('/api/missions');

                if (!response.ok) {
                    throw new Error('Không thể thỉnh danh sách nhiệm vụ từ máy chủ.');
                }

                const data = await response.json();
                setMissions(data);
            } catch (err: any) {
                console.error("Lỗi kết nối Backend:", err.message);
                setError("Chưa thể kết nối tới Database. Xin đạo hữu kiểm tra lại Backend đã chạy ở cổng 5000 chưa nhé.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMissions();
    }, []);

    const toggleMission = async (missionId: string) => {
        setCompleted(prev => prev.includes(missionId) ? prev.filter(id => id !== missionId) : [...prev, missionId]);

        // Mở lại dòng này nếu đạo hữu đã có API cập nhật trạng thái nhiệm vụ
        // await fetch(`/api/users/missions/complete`, { method: 'POST', body: JSON.stringify({ missionId }) });
    };

    const progress = missions.length > 0 ? Math.round((completed.length / missions.length) * 100) : 0;

    const normalMissions = missions.filter(m => !m.isChain);
    const chainMissions = missions.filter(m => m.isChain);

    const getCategoryName = (id: string) => {
        if (id.startsWith('d')) return 'Nhật tu';
        if (id.startsWith('w')) return 'Tuần/Đặc biệt';
        return 'Khác';
    };

    return (
        <div className="min-h-screen bg-[#0f1a14] pt-28 pb-24 px-6 relative overflow-x-hidden">
            <div className="relative z-10 max-w-3xl mx-auto">

                <div className="mb-10 text-center">
                    <div className="text-[10px] tracking-[0.4em] text-gold-dim uppercase mb-2">Daily Mindfulness</div>
                    <h1 className="text-4xl font-bold font-display text-parchment drop-shadow-md">
                        Sổ Tay <span className="text-gold-light">Tu Tập</span>
                    </h1>
                    <Ornament className="mt-4 opacity-60" />
                </div>

                <div className="bg-[#0a100d]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 flex items-center gap-6 shadow-2xl">
                    <div className="relative flex-shrink-0 w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent"
                                strokeDasharray={226} strokeDashoffset={226 - (226 * progress) / 100}
                                className="transition-all duration-1000 ease-out text-jade-light"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold font-display text-parchment">
                            {progress}%
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-parchment">Tiến độ Chánh niệm</h3>
                        <p className="mt-1 text-xs text-parchment/50">Hoàn thành các nhiệm vụ để tích lũy thêm Công đức cho Cây Karma.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <Loader2 className="mb-4 animate-spin text-gold-light" size={32} />
                        <p className="text-sm tracking-widest uppercase text-parchment/60">Đang thỉnh quyển chú...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-6 py-10 text-center border text-red-400/80 bg-red-900/10 border-red-900/30 rounded-2xl">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="space-y-10">

                        {normalMissions.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="flex items-center gap-2 mb-4 text-xl font-display text-gold-dim">
                                    <BookOpen size={18} /> Công phu tu tập
                                </h2>
                                {normalMissions.map((mission) => (
                                    <div
                                        key={mission.id}
                                        onClick={() => toggleMission(mission.id)}
                                        className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${completed.includes(mission.id)
                                            ? 'bg-jade-900/20 border-jade-500/30'
                                            : 'bg-[#0a100d]/40 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`transition-transform duration-300 ${completed.includes(mission.id) ? 'scale-110 text-jade-light' : 'text-white/20'}`}>
                                            {completed.includes(mission.id) ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </div>

                                        <div className="text-2xl drop-shadow-md opacity-90">{mission.icon}</div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold transition-colors ${completed.includes(mission.id) ? 'text-parchment/50 line-through' : 'text-parchment'}`}>
                                                    {mission.name}
                                                </span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-parchment/40 uppercase tracking-tighter">
                                                    {getCategoryName(mission.id)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-parchment/40 mt-0.5">{mission.desc}</p>
                                        </div>

                                        <div className="text-right font-display">
                                            <div className={`text-sm font-bold ${completed.includes(mission.id) ? 'text-parchment/30' : 'text-gold-light'}`}>
                                                +{mission.pts}
                                            </div>
                                            <div className="text-[8px] text-parchment/30 uppercase">Đức</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {chainMissions.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="flex items-center gap-2 mb-4 text-xl font-display text-gold-light">
                                    <Target size={18} /> Chuỗi Thử Thách
                                </h2>
                                {chainMissions.map((mission) => (
                                    <div
                                        key={mission.id}
                                        onClick={() => toggleMission(mission.id)}
                                        className={`relative overflow-hidden group cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${completed.includes(mission.id)
                                            ? 'bg-gradient-to-r from-amber-900/30 to-transparent border-amber-500/50'
                                            : 'bg-gradient-to-r from-black/40 to-[#0a100d]/40 border-gold-dim/20 hover:border-gold-dim/50'
                                            }`}
                                    >
                                        {/* Background glow cho nhiệm vụ chuỗi */}
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-gold-light/5 blur-[40px] pointer-events-none" />

                                        <div className={`transition-transform duration-300 ${completed.includes(mission.id) ? 'scale-110 text-gold-light' : 'text-white/20'}`}>
                                            {completed.includes(mission.id) ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </div>

                                        <div className="text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">{mission.icon}</div>

                                        <div className="relative z-10 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold transition-colors ${completed.includes(mission.id) ? 'text-gold-dim line-through' : 'text-gold-light'}`}>
                                                    {mission.name}
                                                </span>
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold-light/10 text-gold-light uppercase tracking-tighter">
                                                    {mission.chainDays} Ngày
                                                </span>
                                            </div>
                                            <p className="text-xs text-parchment/50 mt-0.5">{mission.desc}</p>
                                        </div>

                                        <div className="relative z-10 text-right font-display">
                                            <div className={`text-base font-bold ${completed.includes(mission.id) ? 'text-gold-dim/50' : 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'}`}>
                                                +{mission.pts}
                                            </div>
                                            <div className="text-[8px] text-gold-dim uppercase">Đức</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-10">
                    <div className="p-4 border rounded-2xl bg-gradient-to-br from-jade-900/40 to-transparent border-jade-500/20">
                        <Flame className="mb-2 text-orange-500" size={20} />
                        <div className="text-2xl font-bold font-display text-parchment">7 Ngày</div>
                        <div className="text-[10px] text-parchment/50 uppercase tracking-widest">Chuỗi tu tập</div>
                    </div>
                    <div className="p-4 border rounded-2xl bg-gradient-to-br from-gold-900/40 to-transparent border-gold-500/20">
                        <Trophy className="mb-2 text-gold-light" size={20} />
                        <div className="text-2xl font-bold font-display text-parchment">Cư Sĩ</div>
                        <div className="text-[10px] text-parchment/50 uppercase tracking-widest">Danh hiệu hiện tại</div>
                    </div>
                </div>

            </div>
        </div>
    );
}