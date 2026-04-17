import { useState } from 'react';
import { HeartHandshake, Crown, Medal, Sparkles, Send } from 'lucide-react';
import Ornament from '@/components/ui/Ornament';

const topDonors = [
    { id: 1, name: 'Phật tử Ẩn danh', amount: 50000000, message: 'Cầu quốc thái dân an' },
    { id: 2, name: 'Nguyễn Văn A', amount: 20000000, message: 'Hồi hướng công đức cho gia tiên' },
    { id: 3, name: 'Trần Thị B', amount: 15000000, message: 'Gieo duyên xây chùa' },
    { id: 4, name: 'Lê Hoàng C', amount: 10000000, message: 'Tùy hỷ công đức' },
    { id: 5, name: 'Phạm Đại D', amount: 5000000, message: 'Bình an cho gia đình' }
];

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000];

export default function DonationPage() {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState<string>('');

    const handlePresetClick = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomAmount(e.target.value);
        setSelectedAmount(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-[#0f1a14] pt-28 pb-16 px-6 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gold-light/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-jade-light/5 blur-[150px] pointer-events-none" />

            <div className="relative z-10 grid max-w-6xl grid-cols-1 gap-10 mx-auto lg:grid-cols-12">

                <div className="lg:col-span-7 space-y-10 animate-[fadeIn_0.6s_ease]">

                    <section className="bg-[#0a100d]/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-2xl">
                        <div className="text-[10px] tracking-[0.3em] text-jade-light uppercase mb-3 flex items-center gap-2">
                            <Sparkles size={14} /> Sự kiện nổi bật
                        </div>
                        <h1 className="mb-4 text-4xl font-bold font-display text-parchment drop-shadow-md">
                            Chung Tay Xây Dựng <span className="text-gold-light">Đại Hùng Bảo Điện</span>
                        </h1>
                        <p className="mb-6 text-sm leading-relaxed text-justify text-parchment/70">
                            "Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao". Quỹ công đức hiện đang kêu gọi sự phát tâm gieo duyên của quý Phật tử gần xa để hoàn thiện phần mái và cột trụ của Đại Hùng Bảo Điện. Mọi đóng góp, dù lớn hay nhỏ, đều là những viên gạch quý giá xây dựng nên ngôi già lam tú lệ, lưu truyền chánh pháp đến ngàn sau.
                        </p>
                        <div className="flex items-center gap-4 p-4 border rounded-2xl bg-black/40 border-gold-dim/20">
                            <div className="flex-1">
                                <div className="text-[10px] text-parchment/50 uppercase tracking-widest mb-1">Mục tiêu</div>
                                <div className="text-xl font-bold font-display text-parchment">1.000.000.000 ₫</div>
                            </div>
                            <div className="w-[1px] h-10 bg-white/10" />
                            <div className="flex-1">
                                <div className="text-[10px] text-parchment/50 uppercase tracking-widest mb-1">Đã quyên góp</div>
                                <div className="text-xl font-bold font-display text-gold-light">450.000.000 ₫</div>
                            </div>
                        </div>
                        <div className="w-full h-2 mt-4 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full bg-gradient-to-r from-jade-light to-gold-light w-[45%] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        </div>
                    </section>

                    <section>
                        <h2 className="flex items-center gap-3 mb-6 text-2xl font-bold font-display text-parchment">
                            <Crown className="text-gold-light" size={24} /> Bảng Vàng Công Đức
                        </h2>
                        <div className="space-y-3">
                            {topDonors.map((donor, index) => {
                                const isTop3 = index < 3;
                                return (
                                    <div
                                        key={donor.id}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:-translate-y-1 ${index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30' :
                                            index === 1 ? 'bg-gradient-to-r from-slate-300/10 to-transparent border-slate-300/20' :
                                                index === 2 ? 'bg-gradient-to-r from-amber-700/10 to-transparent border-amber-700/20' :
                                                    'bg-[#0a100d]/60 border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold font-display ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                            index === 1 ? 'bg-slate-300/20 text-slate-300' :
                                                index === 2 ? 'bg-amber-700/20 text-amber-500' :
                                                    'bg-white/5 text-parchment/50'
                                            }`}>
                                            {index === 0 ? <Crown size={20} /> : index === 1 ? <Medal size={20} /> : index === 2 ? <Medal size={20} /> : `#${index + 1}`}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-parchment">{donor.name}</div>
                                            {donor.message && (
                                                <div className="text-[11px] text-parchment/50 italic mt-0.5">"{donor.message}"</div>
                                            )}
                                        </div>
                                        <div className={`font-display font-bold ${isTop3 ? 'text-gold-light' : 'text-parchment/80'}`}>
                                            {formatCurrency(donor.amount)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                </div>

                <div className="lg:col-span-5 animate-[fadeIn_0.6s_0.2s_both]">
                    <div className="sticky top-28 self-start bg-gradient-to-b from-[#1a120b] to-[#0a0704] border border-[#3d2512] rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4a2f1d] via-[#8c593b] to-[#4a2f1d]" />
                        <Ornament className="mx-auto mb-6 opacity-60 text-gold-dim" />

                        <div className="mb-8 text-center">
                            <h2 className="mb-2 text-3xl font-bold font-display text-gold-light drop-shadow-md">Hòm Công Đức</h2>
                            <p className="text-xs text-parchment/60 uppercase tracking-[0.2em]">Thành tâm cúng dường</p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                {PRESET_AMOUNTS.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => handlePresetClick(amount)}
                                        className={`py-3 px-4 rounded-xl font-display font-bold text-sm transition-all border ${selectedAmount === amount
                                            ? 'bg-gold-light/20 border-gold-light text-gold-light shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                                            : 'bg-black/40 border-[#3d2512] text-parchment/70 hover:bg-[#3d2512]/50 hover:border-gold-dim/50'
                                            }`}
                                    >
                                        {amount / 1000}K
                                    </button>
                                ))}
                            </div>

                            <div>
                                <div className="text-[10px] text-parchment/50 uppercase tracking-widest mb-2 ml-1">Hoặc nhập số tiền khác</div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="VD: 300000"
                                        value={customAmount}
                                        onChange={handleCustomAmountChange}
                                        className="w-full bg-black/40 border border-[#3d2512] rounded-xl py-3 pl-4 pr-12 text-parchment font-display focus:outline-none focus:border-gold-light focus:ring-1 focus:ring-gold-light/50 transition-all placeholder:text-parchment/20"
                                    />
                                    <span className="absolute -translate-y-1/2 right-4 top-1/2 text-parchment/50 font-display">VNĐ</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-[10px] text-parchment/50 uppercase tracking-widest mb-2 ml-1">Lời nguyện cầu / Hồi hướng (Tùy chọn)</div>
                                <textarea
                                    rows={3}
                                    placeholder="Viết lời cầu bình an, siêu độ..."
                                    className="w-full bg-black/40 border border-[#3d2512] rounded-xl p-4 text-sm text-parchment focus:outline-none focus:border-gold-light focus:ring-1 focus:ring-gold-light/50 transition-all placeholder:text-parchment/20 resize-none"
                                />
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 py-4 mt-4 bg-gradient-to-r from-amber-700 to-yellow-600 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:brightness-110 transition-all active:scale-95">
                                <HeartHandshake size={20} />
                                Tiến Cúng Dường
                            </button>

                            <div className="text-center text-[10px] text-parchment/40 italic mt-4">
                                * Mọi khoản đóng góp đều được ghi nhận công khai và minh bạch.
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}