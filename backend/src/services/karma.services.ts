import KarmaLog from '~/models/karmaLog.schema'
import User from '~/models/user.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { KARMA_MESSAGES } from '~/constants/message'
import { KarmaLogType } from '~/constants/enums'

class KarmaService {
    async create(user_id: string, data: { type: KarmaLogType; title: string; description?: string; points: number; category?: string }) {
        const log = await KarmaLog.create({ user_id, ...data })

        const statField = data.type === KarmaLogType.Duc ? 'stats.ducTotal' : 'stats.toiTotal'
        await User.findByIdAndUpdate(user_id, { $inc: { [statField]: data.points } })

        return log
    }

    async getAll(
        user_id: string,
        query: { type?: string; category?: string; page?: number; limit?: number; startDate?: string; endDate?: string }
    ) {
        const { type, category, page = 1, limit = 20, startDate, endDate } = query
        const filter: Record<string, any> = { user_id }
        if (type) filter.type = type
        if (category) filter.category = category
        if (startDate || endDate) {
            filter.created_at = {}
            if (startDate) filter.created_at.$gte = new Date(startDate)
            if (endDate) filter.created_at.$lte = new Date(endDate)
        }

        const skip = (page - 1) * limit
        const [logs, total] = await Promise.all([
            KarmaLog.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
            KarmaLog.countDocuments(filter)
        ])

        return {
            logs,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        }
    }

    async getById(user_id: string, log_id: string) {
        const log = await KarmaLog.findOne({ _id: log_id, user_id })
        if (!log) throw new ErrorWithStatus({ message: KARMA_MESSAGES.NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
        return log
    }

    async update(user_id: string, log_id: string, data: { title?: string; description?: string; points?: number; category?: string }) {
        const oldLog = await KarmaLog.findOne({ _id: log_id, user_id })
        if (!oldLog) throw new ErrorWithStatus({ message: KARMA_MESSAGES.NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })

        if (data.points !== undefined && data.points !== oldLog.points) {
            const diff = data.points - oldLog.points
            const statField = oldLog.type === KarmaLogType.Duc ? 'stats.ducTotal' : 'stats.toiTotal'
            await User.findByIdAndUpdate(user_id, { $inc: { [statField]: diff } })
        }

        Object.assign(oldLog, data)
        await oldLog.save()
        return oldLog
    }

    async delete(user_id: string, log_id: string) {
        const log = await KarmaLog.findOne({ _id: log_id, user_id })
        if (!log) throw new ErrorWithStatus({ message: KARMA_MESSAGES.NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })

        const statField = log.type === KarmaLogType.Duc ? 'stats.ducTotal' : 'stats.toiTotal'
        await User.findByIdAndUpdate(user_id, { $inc: { [statField]: -log.points } })
        await log.deleteOne()
    }

    async getSummary(user_id: string) {
        const [ducAgg, toiAgg, recentLogs] = await Promise.all([
            KarmaLog.aggregate([
                { $match: { user_id, type: KarmaLogType.Duc } },
                { $group: { _id: '$category', total: { $sum: '$points' }, count: { $sum: 1 } } }
            ]),
            KarmaLog.aggregate([
                { $match: { user_id, type: KarmaLogType.Toi } },
                { $group: { _id: '$category', total: { $sum: '$points' }, count: { $sum: 1 } } }
            ]),
            KarmaLog.find({ user_id }).sort({ created_at: -1 }).limit(5)
        ])

        return { ducByCategory: ducAgg, toiByCategory: toiAgg, recentLogs }
    }
}

const karmaService = new KarmaService()
export default karmaService