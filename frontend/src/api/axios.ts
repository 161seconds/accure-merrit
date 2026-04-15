import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: gắn access_token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Chống gọi refresh nhiều lần cùng lúc
let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })
    failedQueue = []
}

// Các endpoint không cần refresh
const SKIP_REFRESH_URLS = ['/login', '/register', '/refresh-token']

// Response interceptor: xử lý refresh token khi 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Không retry cho login/register/refresh-token
        const isSkipUrl = SKIP_REFRESH_URLS.some((url) => originalRequest.url?.includes(url))
        if (isSkipUrl) {
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Nếu đang refresh rồi thì đợi
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                            resolve(api(originalRequest))
                        },
                        reject
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const refresh_token = localStorage.getItem('refresh_token')
                if (!refresh_token) throw new Error('No refresh token')

                // Dùng axios gốc, không dùng api instance (tránh loop)
                const res = await axios.post(`${API_BASE_URL}/refresh-token`, { refresh_token })
                const { access_token, refresh_token: new_refresh } = res.data.result

                localStorage.setItem('access_token', access_token)
                localStorage.setItem('refresh_token', new_refresh)

                // Retry tất cả request đang đợi
                processQueue(null, access_token)

                originalRequest.headers.Authorization = `Bearer ${access_token}`
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default api