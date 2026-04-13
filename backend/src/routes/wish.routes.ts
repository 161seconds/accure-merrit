import { Router } from 'express'
import { createWishController, getWishesController, deleteWishController } from '~/controllers/wish.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const wishRouter = Router()

/**
 * @route   POST /api/wishes
 * @desc    Thắp nhang - gửi lời nguyện
 * @body    { category, content, incense_type? }
 */
wishRouter.post('/', accessTokenValidator, wrapRequestHandler(createWishController))

/**
 * @route   GET /api/wishes
 * @desc    Danh sách lời nguyện (filter: category, page, limit)
 */
wishRouter.get('/', accessTokenValidator, wrapRequestHandler(getWishesController))

/**
 * @route   DELETE /api/wishes/:id
 * @desc    Xoá lời nguyện
 */
wishRouter.delete('/:id', accessTokenValidator, wrapRequestHandler(deleteWishController))

export default wishRouter