import api from './axios'

export const authApi = {
    register(data: { username: string; email: string; password: string; confirm_password: string; name: string }) {
        return api.post('/users/register', data)
    },

    login(data: { username: string; password: string }) {
        return api.post('/users/login', data)
    },

    logout(refresh_token: string) {
        return api.post('/users/logout', { refresh_token })
    }
}