import { useState, useEffect } from 'react'
import { karmaApi } from '@/api/karma.api'
import { KarmaLog } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import PageTitle from '@/components/ui/PageTitle'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'

const CATEGORIES = ['Từ thiện', 'Gia đình', 'Học tập', 'Công việc', 'Sức khoẻ', 'Môi trường', 'Khác']

export default function KarmaPage() {
    const { user, updateUser } = useAuth()
    const [logs, setLogs] = useState<KarmaLog[]>([])
    const [tab, setTab] = useState<'duc' | 'toi'>('duc')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', description: '', points: 5, category: 'Khác' })
    const [loading, setLoading] = useState(false)

    const fetchLogs = async () => {
        try {
            const res = await karmaApi.getAll({ type: tab, limit: 50 })
            setLogs(res.data.result.logs)
        } catch { }
    }

    useEffect(() => { fetchLogs() }, [tab])

    const handleCreate = async () => {
        if (!form.title.trim()) return toast.error('Vui lòng nhập tên hành động')
        setLoading(true)
        try {
            await karmaApi.create({ type: tab, ...form })
            toast.success(tab === 'duc' ? 'Ghi đức thành công 🪷' : 'Ghi tội thành công')
            setForm({ title: '', description: '', points: 5, category: 'Khác' })
            setShowForm(false)
            fetchLogs()
            // Refresh stats
            const { userApi } = await import('@/api/user.api')
            const statsRes = await userApi.getProfile()
            if (user) updateUser(statsRes.data.result)
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await karmaApi.delete(id)
            toast.success('Đã xoá')
            fetchLogs()
            const { userApi } = await import('@/api/user.api')
            const statsRes = await userApi.getProfile()
            if (user) updateUser(statsRes.data.result)
        } catch { }
    }

    return (
        <div className="flex-1 flex flex-col px-4 py-4 overflow-hidden">
            <PageTitle badge="Sổ tay" title="Karma" highlight="Logbook" />

            {/* Tabs */}
            <div className="flex gap-2 mb-4 justify-center">
                {(['duc', 'toi'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wider transition-all cursor-pointer border ${tab === t
                            ? t === 'duc'
                                ? 'border-jade text-jade-light bg-jade/10'
                                : 'border-red text-[#E8A090] bg-red/10'
                            : 'border-gold/20 text-parchment/40 bg-transparent'
                            }`}
                    >
                        {t === 'duc' ? '🪷 Đức' : '⚡ Tội'}
                    </button>
                ))}
            </div>

            {/* Add button */}
            <button
                onClick={() => setShowForm(!showForm)}
                className="btn-gold mb-4 flex items-center justify-center gap-2 mx-auto"
            >
                <Plus size={14} /> Thêm bản ghi
            </button>

            {/* Form */}
            {showForm && (
                <div className="card p-4 mb-4 flex flex-col gap-3 max-w-[500px] mx-auto w-full animate-[fadeIn_0.3s_ease]">
                    <input
                        className="input-field"
                        placeholder="Tên hành động"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <textarea
                        className="input-field resize-none h-16"
                        placeholder="Mô tả (tuỳ chọn)"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    <div className="flex gap-3">
                        <select
                            className="input-field flex-1"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                            type="number"
                            className="input-field w-20 text-center"
                            min={1}
                            max={100}
                            value={form.points}
                            onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                        />
                    </div>
                    <button onClick={handleCreate} disabled={loading} className={tab === 'duc' ? 'btn-jade' : 'btn-red'}>
                        {loading ? 'Đang lưu...' : tab === 'duc' ? '🪷 Ghi đức' : '⚡ Ghi tội'}
                    </button>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 max-w-[500px] mx-auto w-full">
                {logs.length === 0 ? (
                    <div className="text-center text-parchment/30 text-sm mt-10">Chưa có bản ghi nào</div>
                ) : (
                    logs.map((log) => (
                        <div key={log._id} className="card px-4 py-3 flex items-center justify-between group">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${log.type === 'duc' ? 'bg-jade-light shadow-[0_0_4px_#4A9B6A]' : 'bg-red/70'}`} />
                                    <span className="text-sm text-parchment truncate">{log.title}</span>
                                </div>
                                <div className="text-[10px] text-parchment/30 mt-0.5 ml-4">
                                    {log.category} · {new Date(log.created_at).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`font-display text-sm font-bold ${log.type === 'duc' ? 'text-jade-light' : 'text-[#E8A090]'}`}>
                                    {log.type === 'duc' ? '+' : '-'}{log.points}
                                </span>
                                <button
                                    onClick={() => handleDelete(log._id)}
                                    className="opacity-0 group-hover:opacity-100 text-parchment/30 hover:text-red transition-all bg-transparent border-none cursor-pointer"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}