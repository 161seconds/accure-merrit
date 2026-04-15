import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { userApi } from '@/api/user.api'
import { authApi } from '@/api/auth.api'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (access_token: string, refresh_token: string, user?: User) => Promise<void>
    logout: () => Promise<void>
    updateUser: (user: User) => void
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Khởi tạo: check token và lấy profile
    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
            userApi
                .getProfile()
                .then((res) => setUser(res.data.result))
                .catch(() => {
                    // Token hết hạn và refresh cũng thất bại → clear
                    localStorage.clear()
                    setUser(null)
                })
                .finally(() => setIsLoading(false))
        } else {
            setIsLoading(false)
        }
    }, [])

    const login = async (access_token: string, refresh_token: string, userData?: User) => {
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)

        // Nếu đã có user data từ login response thì dùng luôn, không gọi API thêm
        if (userData) {
            setUser(userData)
        } else {
            try {
                const res = await userApi.getProfile()
                setUser(res.data.result)
            } catch {
                // Nếu lỗi thì vẫn set token, user sẽ null
                localStorage.clear()
            }
        }
    }

    const logout = async () => {
        try {
            const refresh_token = localStorage.getItem('refresh_token')
            if (refresh_token) await authApi.logout(refresh_token)
        } catch { }
        localStorage.clear()
        setUser(null)
    }

    const updateUser = (updatedUser: User) => setUser(updatedUser)

    const refreshProfile = async () => {
        try {
            const res = await userApi.getProfile()
            setUser(res.data.result)
        } catch { }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}