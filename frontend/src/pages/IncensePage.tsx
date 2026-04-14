import { useState, useEffect } from 'react'
import { wishApi } from '@/api/wish.api'
import { Wish } from '@/types'
import PageTitle from '@/components/ui/PageTitle'
import toast from 'react-hot-toast'
import { Trash2, Flame } from 'lucide-react'

const WISH_CATEGORIES = [
    { value: 'suc-khoe', label: 'Sức khoẻ' },
    { value: 'gia-dao', label: 'Gia đạo' },
    { value: 'hoc-tap', label: 'Học tập' },
    { value: 'su-nghiep', label: 'Sự nghiệp' },
    { value: 'tinh-duyen', label: 'Tình duyên' },
    { value: 'binh-an', label: 'Bình an' },
    { value: 'khac', label: 'Khác' }
]

const INCENSE_TYPES = [
    { value: 'tram-huong', label: 'Trầm hương' },
    { value: 'que', label: 'Quế' },
    { value: 'nhai', label: 'Nhài' },
    { value: 'bach-dan', label: 'Bạch đàn' }
]

export default function IncensePage() {
    const [wishes, setWishes] = useState<Wish[]>([])
    const [category, setCategory] = useState('binh-an')
    const [incenseType, setIncenseType] = useState('tram-huong')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [burning, setBurning] = useState(false)

    const fetchWishes = async () => {
        try {
            const res = await wishApi.getAll({ limit: 20 })
            setWishes(res.data.result.wishes)
        } catch { }
    }

    useEffect(() => { fetchWishes() }, [])

    const handleSubmit = async () => {
        if (!content.trim()) return toast.error('Vui lòng nhập lời nguyện')
        setLoading(true)
        setBurning(true)
        try {
            await wishApi.create({ category, content: content.trim(), incense_type: incenseType })
            toast.success('Lời nguyện đã được gửi đi 🙏')
            setContent('')
            fetchWishes()
            setTimeout(() => setBurning(false), 3000)
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi')
            setBurning(false)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await wishApi.delete(id)
            toast.success('Đã xoá')
            fetchWishes()
        } catch { }
    }

    return (
        <div className="flex-1 flex flex-col px-4 py-4 overflow-hidden">
            <PageTitle badge="Tâm linh" title="Thắp" highlight="Nhang" />

            {/* Incense visual */}
            <div className="flex justify-center my-6">
                <div className="flex flex-col items-center">
                    {burning && (
                        <div className="text-4xl animate-pulse mb-2 drop-shadow-[0_0_20px_rgba(255,100,0,0.6)]">🔥</div>
                    )}
                    <div className="text-6xl">{burning ? '🕯️' : '🪔'}</div>
                    <div className="text-[10px] text-gold-dim mt-2 tracking-wider">
                        {burning ? 'Đang thắp nhang...' : 'Sẵn sàng thắp nhang'}
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-[500px] mx-auto w-full space-y-3 mb-4">
                <div className="flex gap-2">
                    <select className="input-field flex-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                        {WISH_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <select className="input-field flex-1" value={incenseType} onChange={(e) => setIncenseType(e.target.value)}>
                        {INCENSE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>

                <textarea
                    className="input-field resize-none h-20"
                    placeholder="Nhập lời nguyện cầu của bạn..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={300}
                />

                <button onClick={handleSubmit} disabled={loading || burning} className="btn-gold w-full flex items-center justify-center gap-2">
                    <Flame size={14} /> {loading ? 'Đang gửi...' : 'Thắp Nhang & Gửi Nguyện'}
                </button>
            </div>

            {/* Wishes list */}
            <div className="flex-1 overflow-y-auto space-y-2 max-w-[500px] mx-auto w-full">
                <div className="text-[9px] text-gold-dim uppercase tracking-widest mb-2">Lời nguyện gần đây</div>
                {wishes.map((w) => (
                    <div key={w._id} className="card px-4 py-3 flex justify-between items-start group">
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-parchment">{w.content}</div>
                            <div className="text-[10px] text-parchment/30 mt-1">
                                {WISH_CATEGORIES.find((c) => c.value === w.category)?.label} · {new Date(w.created_at).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(w._id)}
                            className="opacity-0 group-hover:opacity-100 text-parchment/30 hover:text-red transition-all bg-transparent border-none cursor-pointer ml-2 shrink-0"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}