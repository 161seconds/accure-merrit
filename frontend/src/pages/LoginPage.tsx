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
            const { access_token, refresh_token } = res.data.result
            await login(access_token, refresh_token)
            toast.success('Đăng nhập thành công ✦')
            navigate('/')
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.errors?.username?.msg || 'Sai tài khoản hoặc mật khẩu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center px-5">
            <div className="w-full max-w-[400px] card p-10 shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
                <h1 className="text-center text-2xl font-bold text-gold-dim uppercase tracking-wider mb-8">Đăng Nhập</h1>

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
                            className="input-field pr-10"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment/40 hover:text-gold-dim transition-colors bg-transparent border-none cursor-pointer"
                        >
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-parchment/50 cursor-pointer hover:text-gold-dim transition-colors">Quên mật khẩu?</span>
                        <Link to="/register" className="text-parchment/50 hover:text-gold-dim transition-colors no-underline">
                            Chưa có tài khoản?
                        </Link>
                    </div>

                    <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded-full text-base mt-2">
                        {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </button>
                </form>
            </div>
        </div>
    )
}