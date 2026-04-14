import api from './axios'

export const karmaApi = {
    create(data: { type: 'duc' | 'toi'; title: string; description?: string; points: number; category?: string }) {
        return api.post('/karma', data)
    },

    getAll(params?: { type?: string; category?: string; page?: number; limit?: number }) {
        return api.get('/karma', { params })
    },

    getById(id: string) {
        return api.get(`/karma/${id}`)
    },

    update(id: string, data: { title?: string; description?: string; points?: number; category?: string }) {
        return api.put(`/karma/${id}`, data)
    },

    delete(id: string) {
        return api.delete(`/karma/${id}`)
    },

    getSummary() {
        return api.get('/karma/summary')
    }
}