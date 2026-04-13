import { Router } from 'express'
import {
    createKarmaLogController,
    getKarmaLogsController,
    getKarmaLogByIdController,
    updateKarmaLogController,
    deleteKarmaLogController,
    getKarmaSummaryController
} from '~/controllers/karma.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const karmaRouter = Router()

/**
 * @route   POST /api/karma
 * @desc    Thêm bản ghi đức/tội
 * @body    { type, title, description?, points, category? }
 */
karmaRouter.post('/', accessTokenValidator, wrapRequestHandler(createKarmaLogController))

/**
 * @route   GET /api/karma
 * @desc    Lấy danh sách bản ghi (filter: type, category, startDate, endDate, page, limit)
 */
karmaRouter.get('/', accessTokenValidator, wrapRequestHandler(getKarmaLogsController))

/**
 * @route   GET /api/karma/summary
 * @desc    Tổng hợp đức/tội theo category
 */
karmaRouter.get('/summary', accessTokenValidator, wrapRequestHandler(getKarmaSummaryController))

/**
 * @route   GET /api/karma/:id
 * @desc    Xem chi tiết 1 bản ghi
 */
karmaRouter.get('/:id', accessTokenValidator, wrapRequestHandler(getKarmaLogByIdController))

/**
 * @route   PUT /api/karma/:id
 * @desc    Sửa bản ghi
 */
karmaRouter.put('/:id', accessTokenValidator, wrapRequestHandler(updateKarmaLogController))

/**
 * @route   DELETE /api/karma/:id
 * @desc    Xoá bản ghi
 */
karmaRouter.delete('/:id', accessTokenValidator, wrapRequestHandler(deleteKarmaLogController))

export default karmaRouter