import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userApi } from '@/api/user.api'
import { useNavigate } from 'react-router-dom'
import PageTitle from '@/components/ui/PageTitle'
import Dialog from '@/components/ui/Dialog'
import toast from 'react-hot-toast'
import { User, Lock, Type, Palette, Globe, Trash2, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
    const { user, updateUser, logout } = useAuth()
    const navigate = useNavigate()

    // Dialogs
    const [nameDialog, setNameDialog] = useState(false)
    const [pwDialog, setPwDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)

    // Form states
    const [newName, setNewName] = useState(user?.name || '')
    const [pwForm, setPwForm] = useState({ old_password: '', password: '', confirm_password: '' })
    const [deletePassword, setDeletePassword] = useState('')

    const handleUpdateName = async () => {
        try {
            const res = await userApi.updateProfile({ name: newName.trim() })
            updateUser(res.data.result)
            toast.success('Cập nhật tên thành công')
            setNameDialog(false)
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi')
        }
    }

    const handleChangePassword = async () => {
        if (pwForm.password !== pwForm.confirm_password) return toast.error('Mật khẩu xác nhận không khớp')
        try {
            await userApi.changePassword(pwForm)
            toast.success('Đổi mật khẩu thành công')
            setPwDialog(false)
            setPwForm({ old_password: '', password: '', confirm_password: '' })
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi')
        }
    }

    const handleUpdateFont = async (font: string) => {
        try {
            await userApi.updateSettings({ font })
            if (user) updateUser({ ...user, settings: { ...user.settings, font } })
            toast.success('Đã đổi font')
        } catch { }
    }

    const handleDeleteAccount = async () => {
        try {
            await userApi.deleteAccount(deletePassword)
            toast.success('Tài khoản đã được xoá')
            await logout()
            navigate('/login')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Mật khẩu không đúng')
        }
    }

    return (
        <div className="flex-1 flex flex-col px-4 py-4 overflow-y-auto">
            <PageTitle title="Cài" highlight="Đặt" />

            <div className="max-w-[500px] mx-auto w-full space-y-5">
                {/* Tài khoản */}
                <Section title="Tài khoản">
                    <Item icon={<User size={14} />} label="Tên hiển thị" value={user?.name} onClick={() => setNameDialog(true)} />
                    <Item icon={<Lock size={14} />} label="Đổi mật khẩu" value="••••••" onClick={() => setPwDialog(true)} />
                </Section>

                {/* Giao diện */}
                <Section title="Giao diện">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2.5 text-sm text-parchment">
                            <Type size={14} className="text-gold-dim" /> Font chữ
                        </div>
                        <select
                            className="bg-transparent text-gold-light border border-gold-dim rounded px-2 py-1 text-xs outline-none cursor-pointer"
                            value={user?.settings.font || 'Noto Serif'}
                            onChange={(e) => handleUpdateFont(e.target.value)}
                        >
                            {['Noto Serif', 'Cinzel', 'Quicksand', 'Playfair Display'].map((f) => (
                                <option key={f} value={f} className="bg-ink text-parchment">{f}</option>
                            ))}
                        </select>
                    </div>
                    <Item icon={<Palette size={14} />} label="Giao diện" value={user?.settings.theme || 'dark'} />
                    <Item icon={<Globe size={14} />} label="Ngôn ngữ" value={user?.settings.language === 'vi' ? 'Tiếng Việt' : 'English'} />
                </Section>

                {/* Nguy hiểm */}
                <Section title="Vùng nguy hiểm">
                    <button
                        onClick={() => setDeleteDialog(true)}
                        className="w-full px-4 py-3 text-left text-sm text-[#E8A090] flex items-center gap-2.5 hover:bg-red/20 transition-colors"
                    >
                        <Trash2 size={14} /> Xoá tài khoản
                    </button>
                </Section>
            </div>

            {/* Dialogs */}
            <Dialog open={nameDialog} onClose={() => setNameDialog(false)} title="Đổi tên hiển thị" actions={
                <div className="flex gap-3 w-full">
                    <button className="flex-1 btn-gold opacity-50" onClick={() => setNameDialog(false)}>Huỷ</button>
                    <button className="flex-1 btn-gold" onClick={handleUpdateName}>Lưu</button>
                </div>
            }>
                <input className="input-field text-center" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </Dialog>

            <Dialog open={pwDialog} onClose={() => setPwDialog(false)} title="Đổi mật khẩu" actions={
                <div className="flex gap-3 w-full">
                    <button className="flex-1 btn-gold opacity-50" onClick={() => setPwDialog(false)}>Huỷ</button>
                    <button className="flex-1 btn-gold" onClick={handleChangePassword}>Đổi</button>
                </div>
            }>
                <div className="space-y-3">
                    <input type="password" className="input-field" placeholder="Mật khẩu cũ" value={pwForm.old_password} onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })} />
                    <input type="password" className="input-field" placeholder="Mật khẩu mới" value={pwForm.password} onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })} />
                    <input type="password" className="input-field" placeholder="Xác nhận mật khẩu" value={pwForm.confirm_password} onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })} />
                </div>
            </Dialog>

            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} title="⚠️ Xoá tài khoản" actions={
                <div className="flex gap-3 w-full">
                    <button className="flex-1 btn-gold opacity-50" onClick={() => setDeleteDialog(false)}>Huỷ</button>
                    <button className="flex-1 btn-red" onClick={handleDeleteAccount}>Xoá vĩnh viễn</button>
                </div>
            }>
                <p className="mb-3">Hành động này không thể hoàn tác. Nhập mật khẩu để xác nhận.</p>
                <input type="password" className="input-field" placeholder="Mật khẩu" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
            </Dialog>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="card overflow-hidden">
            <div className="text-[11px] font-bold tracking-[0.15em] text-gold-light uppercase px-4 pt-3 pb-2 bg-gold/5 border-b border-gold/10">
                {title}
            </div>
            {children}
        </div>
    )
}

function Item({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value?: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full px-4 py-3 text-sm text-parchment flex justify-between items-center border-b border-gold/10 last:border-b-0 hover:bg-gold/10 transition-colors cursor-pointer bg-transparent text-left"
        >
            <span className="flex items-center gap-2.5">
                <span className="text-gold-dim">{icon}</span> {label}
            </span>
            <span className="flex items-center gap-1 text-xs text-parchment/40 font-bold">
                {value} <ChevronRight size={12} />
            </span>
        </button>
    )
}