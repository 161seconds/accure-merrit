import Wish from '~/models/wish.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { WISH_MESSAGES } from '~/constants/message'

class WishService {
    async create(user_id: string, data: { category: string; content: string; incense_type?: string }) {
        const wish = await Wish.create({ user_id, ...data })
        return wish
    }

    async getAll(user_id: string, query: { page?: number; limit?: number; category?: string }) {
        const { page = 1, limit = 20, category } = query
        const filter: Record<string, any> = { user_id }
        if (category) filter.category = category

        const skip = (page - 1) * limit
        const [wishes, total] = await Promise.all([
            Wish.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
            Wish.countDocuments(filter)
        ])

        return {
            wishes,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        }
    }

    async delete(user_id: string, wish_id: string) {
        const wish = await Wish.findOne({ _id: wish_id, user_id })
        if (!wish) throw new ErrorWithStatus({ message: WISH_MESSAGES.NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
        await wish.deleteOne()
    }
}

const wishService = new WishService()
export default wishService