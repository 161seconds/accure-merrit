import { Request, Response, NextFunction } from 'express'
import { checkSchema, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/request/user.requests'
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
  const { user_id } = req.body as any
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

export const accessTokenValidator = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ErrorWithStatus({
      message: 'Access token không được gửi kèm',
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN as string) as TokenPayload

    req.decoded_authorization = decoded
    next()
  } catch (error) {
    throw new ErrorWithStatus({
      message: 'Access token không hợp lệ hoặc đã hết hạn',
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}

export const validate = (validation: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped()
    const firstErrorMessage = Object.values(errorObject)[0].msg
    next(new ErrorWithStatus({ message: firstErrorMessage, status: HTTP_STATUS.UNPROCESSABLE_ENTITY }))
  }
}

export const refreshTokenValidator = (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token } = req.body
  if (!refresh_token) {
    throw new ErrorWithStatus({ message: 'Refresh token không được gửi kèm', status: HTTP_STATUS.UNAUTHORIZED })
  }

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET_REFRESH_TOKEN as string) as TokenPayload
    req.decoded_refresh_token = decoded
    next()
  } catch (error) {
    throw new ErrorWithStatus({ message: 'Refresh token không hợp lệ hoặc đã hết hạn', status: HTTP_STATUS.UNAUTHORIZED })
  }
}

export const loginValidator = validate(checkSchema({
  username: {
    notEmpty: { errorMessage: 'Username không được để trống' },
    isString: { errorMessage: 'Username phải là chuỗi' },
    trim: true
  },
  password: {
    notEmpty: { errorMessage: 'Password không được để trống' },
    isString: { errorMessage: 'Password phải là chuỗi' }
  }
}, ['body']))

export const registerValidator = validate(checkSchema({
  name: {
    notEmpty: { errorMessage: 'Tên không được để trống' },
    isString: { errorMessage: 'Tên phải là chuỗi' },
    isLength: { options: { min: 1, max: 50 }, errorMessage: 'Tên phải từ 1 đến 50 ký tự' },
    trim: true
  },
  username: {
    notEmpty: { errorMessage: 'Username không được để trống' },
    isString: { errorMessage: 'Username phải là chuỗi' },
    isLength: { options: { min: 3, max: 30 }, errorMessage: 'Username phải từ 3 đến 30 ký tự' },
    matches: { options: /^[a-zA-Z0-9_]+$/, errorMessage: 'Username chỉ được chứa chữ, số và dấu gạch dưới' },
    trim: true
  },
  email: {
    notEmpty: { errorMessage: 'Email không được để trống' },
    isEmail: { errorMessage: 'Email không đúng định dạng' },
    trim: true
  },
  password: {
    notEmpty: { errorMessage: 'Password không được để trống' },
    isString: { errorMessage: 'Password phải là chuỗi' },
    isLength: { options: { min: 6, max: 50 }, errorMessage: 'Password phải dài từ 6 đến 50 ký tự' }
  },
  confirm_password: {
    notEmpty: { errorMessage: 'Xác nhận mật khẩu không được để trống' },
    isString: { errorMessage: 'Xác nhận mật khẩu phải là chuỗi' },
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Xác nhận mật khẩu không khớp')
        }
        return true
      }
    }
  }
}, ['body']))