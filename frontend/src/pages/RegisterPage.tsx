import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth.api'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm_password: '', name: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }))

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (form.password !== form.confirm_password) {
            toast.error('Mật khẩu xác nhận không khớp!')
            return
        }
        setLoading(true)
        try {
            const res = await authApi.register({ ...form, name: form.name || form.username })
            const { access_token, refresh_token, user } = res.data.result
            await login(access_token, refresh_token, user)
            toast.success('Đăng ký thành công!')
            navigate('/')
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.[Object.keys(err.response?.data?.errors || {})[0]]?.msg
            toast.error(msg || 'Đăng ký thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center flex-1 px-5 py-6">
            <div className="w-full max-w-[450px] card p-10 shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
                <h1 className="mb-8 text-2xl font-bold tracking-wider text-center uppercase text-gold-dim">Đăng Ký</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input className="input-field" placeholder="Tên tài khoản" value={form.username} onChange={update('username')} required />
                    <input className="input-field" placeholder="Tên hiển thị" value={form.name} onChange={update('name')} required />
                    <input className="input-field" type="email" placeholder="Email" value={form.email} onChange={update('email')} required />

                    <div className="relative">
                        <input
                            type={showPw ? 'text' : 'password'}
                            className="pr-10 input-field"
                            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                            value={form.password}
                            onChange={update('password')}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute -translate-y-1/2 bg-transparent border-none cursor-pointer right-3 top-1/2 text-parchment/40 hover:text-gold-dim"
                        >
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <input
                        type="password"
                        className="input-field"
                        placeholder="Xác nhận mật khẩu"
                        value={form.confirm_password}
                        onChange={update('confirm_password')}
                        required
                    />

                    <button type="submit" disabled={loading} className="w-full py-3 mt-2 text-base rounded-full btn-gold">
                        {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
                    </button>

                    <div className="mt-2 text-xs text-center text-parchment/50">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-bold no-underline text-gold-dim hover:text-gold-light">
                            Đăng nhập
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}