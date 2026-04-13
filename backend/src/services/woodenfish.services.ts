import User from '~/models/user.schema'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'

class WoodenFishService {
    async tap(user_id: string, count: number = 1) {
        const user = await User.findByIdAndUpdate(
            user_id,
            {
                $inc: {
                    'stats.moCount': count,
                    'stats.ducTotal': count
                }
            },
            { new: true }
        )

        if (!user) throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })

        return {
            moCount: user.stats.moCount,
            ducTotal: user.stats.ducTotal,
            added: count
        }
    }

    async getCount(user_id: string) {
        const user = await User.findById(user_id)
        if (!user) throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
        return { moCount: user.stats.moCount }
    }
}

const woodenFishService = new WoodenFishService()
export default woodenFishService