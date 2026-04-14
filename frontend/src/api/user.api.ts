import api from './axios'

export const userApi = {
    getProfile() {
        return api.get('/me')
    },

    updateProfile(data: { name?: string; avatar?: string; date_of_birth?: string }) {
        return api.patch('/me', data)
    },

    changePassword(data: { old_password: string; password: string; confirm_password: string }) {
        return api.put('/change-password', data)
    },

    updateSettings(data: { font?: string; theme?: string; language?: string }) {
        return api.put('/settings', data)
    },

    getStats() {
        return api.get('/stats')
    },

    deleteAccount(password: string) {
        return api.delete('/account', { data: { password } })
    }
}