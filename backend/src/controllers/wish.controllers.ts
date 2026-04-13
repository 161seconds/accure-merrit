import { Request, Response } from 'express'
import wishService from '~/services/wish.services'
import { WISH_MESSAGES } from '~/constants/message'
import HTTP_STATUS from '~/constants/httpStatus'

export const createWishController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    const result = await wishService.create(user_id, req.body)
    return res.status(HTTP_STATUS.CREATED).json({
        message: WISH_MESSAGES.CREATE_SUCCESS,
        result
    })
}

export const getWishesController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    const result = await wishService.getAll(user_id, {
        page: Number(req.query.page as string) || 1,
        limit: Number(req.query.limit as string) || 20,
        category: req.query.category as string
    })
    return res.json({ message: WISH_MESSAGES.GET_SUCCESS, result })
}

export const deleteWishController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    await wishService.delete(user_id, req.params.id as string)
    return res.json({ message: WISH_MESSAGES.DELETE_SUCCESS })
}