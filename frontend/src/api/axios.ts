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

// Response interceptor: xử lý refresh token khi 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refresh_token = localStorage.getItem('refresh_token')
                if (!refresh_token) throw new Error('No refresh token')

                const res = await axios.post(
                    `${API_BASE_URL}/users/refresh-token`,
                    { refresh_token },
                    {
                        headers: {
                            Authorization: `Bearer ${refresh_token}`
                        }
                    }
                )
                const { access_token, refresh_token: new_refresh } = res.data.result

                localStorage.setItem('access_token', access_token)
                localStorage.setItem('refresh_token', new_refresh)

                originalRequest.headers.Authorization = `Bearer ${access_token}`
                return api(originalRequest)
            } catch {
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(error)
            }
        }

        return Promise.reject(error)
    }
)

export default api