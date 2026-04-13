import { Request, Response } from 'express'
import mediasService from '~/services/medias.services'
import HTTP_STATUS from '~/constants/httpStatus'

export const uploadImageController = async (req: Request, res: Response) => {
  return res.status(HTTP_STATUS.OK).json({
    message: 'Upload thành công'
  })
}