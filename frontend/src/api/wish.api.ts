import api from './axios'

export const wishApi = {
    create(data: { category: string; content: string; incense_type?: string }) {
        return api.post('/wishes', data)
    },

    getAll(params?: { page?: number; limit?: number; category?: string }) {
        return api.get('/wishes', { params })
    },

    delete(id: string) {
        return api.delete(`/wishes/${id}`)
    }
}