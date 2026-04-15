import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { userApi } from '@/api/user.api'
import { authApi } from '@/api/auth.api'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (access_token: string, refresh_token: string, user: User) => void    
    logout: () => Promise<void>
    updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('access_token')
        if (token) {
            userApi
                .getProfile()
                .then((res) => setUser(res.data.result))
                .catch(() => localStorage.clear())
                .finally(() => setIsLoading(false))
        } else {
            setIsLoading(false)
        }
    }, [])

    const login = (access_token: string, refresh_token: string, userData: User) => {
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        setUser(userData) 
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

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}