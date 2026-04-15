import api from './axios'

export const userApi = {
    getProfile() {
        return api.get('/users/me')
    },

    updateProfile(data: { name?: string; avatar?: string; date_of_birth?: string }) {
        return api.patch('/users/me', data)
    },

    changePassword(data: { old_password: string; password: string; confirm_password: string }) {
        return api.put('/users/change-password', data)
    },

    updateSettings(data: { font?: string; theme?: string; language?: string }) {
        return api.put('/users/settings', data)
    },

    getStats() {
        return api.get('/users/stats')
    },

    deleteAccount(password: string) {
        return api.delete('/users/account', { data: { password } })
    }
}