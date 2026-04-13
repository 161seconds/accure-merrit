import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const mediasRouter = Router()

/**
 * @route   POST /api/medias/upload-image
 * @desc    Upload ảnh (avatar, v.v.)
 */
mediasRouter.post('/upload-image', accessTokenValidator, wrapRequestHandler(uploadImageController))

export default mediasRouter