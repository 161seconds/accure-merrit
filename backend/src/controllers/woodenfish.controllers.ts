import { Request, Response } from 'express'
import woodenFishService from '~/services/woodenfish.services'
import { WOODEN_FISH_MESSAGES } from '~/constants/message'

export const tapWoodenFishController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    const count = req.body.count || 1
    const result = await woodenFishService.tap(user_id, count)
    return res.json({ message: WOODEN_FISH_MESSAGES.TAP_SUCCESS, result })
}

export const getWoodenFishCountController = async (req: Request, res: Response) => {
    const { user_id } = req.decoded_authorization!
    const result = await woodenFishService.getCount(user_id)
    return res.json({ message: WOODEN_FISH_MESSAGES.GET_COUNT_SUCCESS, result })
}