import { Request, Response } from 'express'
import karmaService from '~/services/karma.services'
import { KARMA_MESSAGES } from '~/constants/message'
import HTTP_STATUS from '~/constants/httpStatus'

export const createKarmaLogController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    const result = await karmaService.create(user_id, req.body)
    return res.status(HTTP_STATUS.CREATED).json({
        message: KARMA_MESSAGES.CREATE_SUCCESS,
        result
    })
}

export const getKarmaLogsController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!

    const result = await karmaService.getAll(user_id, {
        type: req.query.type as string,
        category: req.query.category as string,
        page: Number(req.query.page as string) || 1,
        limit: Number(req.query.limit as string) || 20,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
    })

    return res.json({ message: KARMA_MESSAGES.GET_SUCCESS, result })
}

export const getKarmaLogByIdController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    const result = await karmaService.getById(user_id, req.params.id as string)
    return res.json({ message: KARMA_MESSAGES.GET_SUCCESS, result })
}

export const updateKarmaLogController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    const result = await karmaService.update(user_id, req.params.id as string, req.body)
    return res.json({ message: KARMA_MESSAGES.UPDATE_SUCCESS, result })
}

export const deleteKarmaLogController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    await karmaService.delete(user_id, req.params.id as string)
    return res.json({ message: KARMA_MESSAGES.DELETE_SUCCESS })
}

export const getKarmaSummaryController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    const result = await karmaService.getSummary(user_id)
    return res.json({ message: KARMA_MESSAGES.SUMMARY_SUCCESS, result })
}