export interface User {
    _id: string
    username: string
    email: string
    name: string
    avatar?: string
    stats: UserStats
    settings: UserSettings
    created_at: string
}

export interface UserStats {
    ducTotal: number
    toiTotal: number
    moCount: number
    streak: number
    lastActiveDate?: string
}

export interface UserSettings {
    font: string
    theme: string
    language: string
}

export interface KarmaLog {
    _id: string
    user_id: string
    type: 'duc' | 'toi'
    title: string
    description?: string
    points: number
    category: string
    created_at: string
}

export interface Wish {
    _id: string
    user_id: string
    category: string
    content: string
    incense_type: string
    created_at: string
}

export interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface ApiResponse<T = any> {
    message: string
    result?: T
}

export interface LoginResult {
    access_token: string
    refresh_token: string
    user: User
}