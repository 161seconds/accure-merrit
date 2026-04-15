import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/api/auth.api'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await authApi.login({ username: username.trim(), password })
            const { access_token, refresh_token, user } = res.data.result
            await login(access_token, refresh_token, user)
            toast.success('Đăng nhập thành công ✦')
            navigate('/')
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.errors?.username?.msg || 'Sai tài khoản hoặc mật khẩu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center flex-1 px-5">
            <div className="w-full max-w-[400px] card p-10 shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
                <h1 className="mb-8 text-2xl font-bold tracking-wider text-center uppercase text-gold-dim">Đăng Nhập</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Tên tài khoản"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <div className="relative">
                        <input
                            type={showPw ? 'text' : 'password'}
                            className="pr-10 input-field"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute transition-colors -translate-y-1/2 bg-transparent border-none cursor-pointer right-3 top-1/2 text-parchment/40 hover:text-gold-dim"
                        >
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="transition-colors cursor-pointer text-parchment/50 hover:text-gold-dim">Quên mật khẩu?</span>
                        <Link to="/register" className="no-underline transition-colors text-parchment/50 hover:text-gold-dim">
                            Chưa có tài khoản?
                        </Link>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 mt-2 text-base rounded-full btn-gold">
                        {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </button>
                </form>
            </div>
        </div>
    )
}