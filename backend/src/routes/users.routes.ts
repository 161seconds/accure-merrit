import { Router } from 'express'
import {
  registerController,
  loginController,
  logoutController,
  refreshTokenController,
  getProfileController,
  updateProfileController,
  changePasswordController,
  updateSettingsController,
  getStatsController,
  deleteAccountController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  refreshTokenValidator,
  registerValidator,
  loginValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const usersRouter = Router()

/**
 * @route   POST /api/register
 * @desc    Đăng ký tài khoản
 * @body    { username, email, password, confirm_password, name }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * @route   POST /api/login
 * @desc    Đăng nhập
 * @body    { username, password }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * @route   POST /api/logout
 * @desc    Đăng xuất
 * @header  Authorization: Bearer <access_token>
 * @body    { refresh_token }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * @route   POST /api/refresh-token
 * @desc    Refresh access token
 * @body    { refresh_token }
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 * @route   GET /api/me
 * @desc    Lấy thông tin profile
 * @header  Authorization: Bearer <access_token>
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getProfileController))

/**
 * @route   PATCH /api/me
 * @desc    Cập nhật profile (name, avatar, date_of_birth)
 * @header  Authorization: Bearer <access_token>
 */
usersRouter.patch('/me', accessTokenValidator, wrapRequestHandler(updateProfileController))

/**
 * @route   PUT /api/change-password
 * @desc    Đổi mật khẩu
 * @header  Authorization: Bearer <access_token>
 * @body    { old_password, password, confirm_password }
 */
usersRouter.put('/change-password', accessTokenValidator, wrapRequestHandler(changePasswordController))

/**
 * @route   PUT /api/settings
 * @desc    Cập nhật cài đặt (font, theme, language)
 * @header  Authorization: Bearer <access_token>
 */
usersRouter.put('/settings', accessTokenValidator, wrapRequestHandler(updateSettingsController))

/**
 * @route   GET /api/stats
 * @desc    Lấy thống kê (ducTotal, toiTotal, moCount, streak)
 * @header  Authorization: Bearer <access_token>
 */
usersRouter.get('/stats', accessTokenValidator, wrapRequestHandler(getStatsController))

/**
 * @route   DELETE /api/account
 * @desc    Xoá tài khoản
 * @header  Authorization: Bearer <access_token>
 * @body    { password }
 */
usersRouter.delete('/account', accessTokenValidator, wrapRequestHandler(deleteAccountController))

export default usersRouter