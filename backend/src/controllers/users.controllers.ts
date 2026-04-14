import { Request, Response } from 'express'
import usersService from '~/services/users.services'
import { USERS_MESSAGES } from '~/constants/message'
import HTTP_STATUS from '~/constants/httpStatus'
import {
  RegisterReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  UpdateProfileReqBody,
  ChangePasswordReqBody,
  UpdateSettingsReqBody
} from '~/models/request/user.requests'

export const registerController = async (req: Request<any, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const loginController = async (req: Request<any, any, LoginReqBody>, res: Response) => {
  const user = (req as any).user
  const user_id = user._id.toString()

  const result = await usersService.login(user_id)

  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<any, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  await usersService.logout(refresh_token)
  return res.json({ message: USERS_MESSAGES.LOGOUT_SUCCESS })
}

export const refreshTokenController = async (req: Request<any, any, RefreshTokenReqBody>, res: Response) => {
  const { user_id } = req.decoded_refresh_token!
  const { refresh_token } = req.body
  const result = await usersService.refreshToken(user_id, refresh_token)
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization!
  const result = await usersService.getProfile(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result
  })
}

export const updateProfileController = async (req: Request<any, any, UpdateProfileReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization!
  const result = await usersService.updateProfile(user_id, req.body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESS,
    result
  })
}

export const changePasswordController = async (req: Request<any, any, ChangePasswordReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization!
  await usersService.changePassword(user_id, req.body.old_password, req.body.password)
  return res.json({ message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS })
}

export const updateSettingsController = async (req: Request<any, any, UpdateSettingsReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization!
  const result = await usersService.updateSettings(user_id, req.body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_SETTINGS_SUCCESS,
    result
  })
}

export const getStatsController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization!
  const result = await usersService.getStats(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_STATS_SUCCESS,
    result
  })
}

export const deleteAccountController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization!
  const { password } = req.body
  await usersService.deleteAccount(user_id, password)
  return res.json({ message: USERS_MESSAGES.DELETE_ACCOUNT_SUCCESS })
}