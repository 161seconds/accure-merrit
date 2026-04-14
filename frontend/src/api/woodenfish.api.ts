import api from './axios'

export const woodenFishApi = {
    tap(count: number = 1) {
        return api.post('/wooden-fish/tap', { count })
    },

    getCount() {
        return api.get('/wooden-fish/count')
    }
}