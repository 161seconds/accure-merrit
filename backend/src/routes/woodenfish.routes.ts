import { Router } from 'express'
import { tapWoodenFishController, getWoodenFishCountController } from '~/controllers/woodenfish.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const woodenFishRouter = Router()

/**
 * @route   POST /api/wooden-fish/tap
 * @desc    Gõ mõ (tăng moCount + ducTotal)
 * @body    { count? } - mặc định 1
 */
woodenFishRouter.post('/tap', accessTokenValidator, wrapRequestHandler(tapWoodenFishController))

/**
 * @route   GET /api/wooden-fish/count
 * @desc    Xem tổng số lần gõ mõ
 */
woodenFishRouter.get('/count', accessTokenValidator, wrapRequestHandler(getWoodenFishCountController))

export default woodenFishRouter