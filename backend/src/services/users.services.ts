import User, { IUser } from '~/models/user.schema'
import RefreshToken from '~/models/RefreshToken.shema'
import KarmaLog from '~/models/karmaLog.schema'
import Wish from '~/models/wish.schema'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { LoginReqBody, RegisterReqBody, UpdateProfileReqBody, UpdateSettingsReqBody } from '~/models/request/user.requests'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN as any) || '120m'
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN as any) || '100d'
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: RegisterReqBody) {
    const user = await User.create({
      username: payload.username,
      email: payload.email,
      password: hashPassword(payload.password),
      name: payload.name
    })

    const user_id = `${user._id}`
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())

    // Lưu refresh token
    const { iat, exp } = await import('jsonwebtoken').then((jwt) =>
      jwt.default.decode(refresh_token) as { iat: number; exp: number }
    )
    await RefreshToken.create({
      token: refresh_token,
      user_id,
      iat,
      exp
    })

    return {
      access_token,
      refresh_token,
      user: user.toJSON()
    }
  }

  async login(payload: LoginReqBody) {
    const user = await User.findOne({ username: payload.username }).select('+password')
    if (!user) {
      throw new ErrorWithStatus({ message: 'Tài khoản không tồn tại', status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    }

    if (user.password !== hashPassword(payload.password)) {
      throw new ErrorWithStatus({ message: 'Mật khẩu không chính xác', status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    }

    const user_id = user._id.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    const { iat, exp } = await import('jsonwebtoken').then((jwt) =>
      jwt.default.decode(refresh_token) as { iat: number; exp: number }
    )
    await RefreshToken.create({
      token: refresh_token,
      user_id,
      iat,
      exp
    })

    await this.updateStreak(user_id)

    const userResponse = user.toObject()
    const { password, ...userWithoutPassword } = userResponse

    return {
      access_token,
      refresh_token,
      user: userWithoutPassword
    }
  }

  async logout(refresh_token: string) {
    await RefreshToken.deleteOne({ token: refresh_token })
  }

  async refreshToken(user_id: string, old_refresh_token: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    await RefreshToken.deleteOne({ token: old_refresh_token })
    const { iat, exp } = await import('jsonwebtoken').then((jwt) =>
      jwt.default.decode(refresh_token) as { iat: number; exp: number }
    )
    await RefreshToken.create({
      token: refresh_token,
      user_id,
      iat,
      exp
    })

    return { access_token, refresh_token }
  }

  async getProfile(user_id: string) {
    const user = await User.findById(user_id)
    if (!user) throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    return user.toJSON()
  }

  async updateProfile(user_id: string, payload: UpdateProfileReqBody) {
    const updateData: Record<string, any> = {}
    if (payload.name) updateData.name = payload.name
    if (payload.avatar) updateData.avatar = payload.avatar
    if (payload.date_of_birth) updateData.date_of_birth = new Date(payload.date_of_birth)

    const user = await User.findByIdAndUpdate(user_id, { $set: updateData }, { new: true, runValidators: true })
    if (!user) throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    return user.toJSON()
  }

  async changePassword(user_id: string, old_password: string, new_password: string) {
    const user = await User.findById(user_id).select('+password')
    if (!user) throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })

    if (user.password !== hashPassword(old_password)) {
      throw new ErrorWithStatus({ message: USERS_MESSAGES.OLD_PASSWORD_INCORRECT, status: HTTP_STATUS.BAD_REQUEST })
    }

    user.password = hashPassword(new_password)
    await user.save()
  }

  async updateSettings(user_id: string, payload: UpdateSettingsReqBody) {
    const updateObj: Record<string, string> = {}
    if (payload.font) updateObj['settings.font'] = payload.font
    if (payload.theme) updateObj['settings.theme'] = payload.theme
    if (payload.language) updateObj['settings.language'] = payload.language

    const user = await User.findByIdAndUpdate(user_id, { $set: updateObj }, { new: true })
    if (!user) throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    return user.settings
  }

  async getStats(user_id: string) {
    const user = await User.findById(user_id)
    if (!user) throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    return user.stats
  }

  async deleteAccount(user_id: string, password: string) {
    const user = await User.findById(user_id).select('+password')
    if (!user) throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })

    if (user.password !== hashPassword(password)) {
      throw new ErrorWithStatus({ message: USERS_MESSAGES.OLD_PASSWORD_INCORRECT, status: HTTP_STATUS.BAD_REQUEST })
    }

    await Promise.all([
      KarmaLog.deleteMany({ user_id }),
      Wish.deleteMany({ user_id }),
      RefreshToken.deleteMany({ user_id }),
      User.findByIdAndDelete(user_id)
    ])
  }

  async checkUsernameExist(username: string) {
    const user = await User.findOne({ username })
    return Boolean(user)
  }

  async checkEmailExist(email: string) {
    const user = await User.findOne({ email })
    return Boolean(user)
  }

  private async updateStreak(user_id: string) {
    const user = await User.findById(user_id)
    if (!user) return

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (user.stats.lastActiveDate) {
      const lastActive = new Date(user.stats.lastActiveDate)
      const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate())
      const diffDays = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        user.stats.streak += 1
      } else if (diffDays > 1) {
        user.stats.streak = 1
      }
    } else {
      user.stats.streak = 1
    }

    user.stats.lastActiveDate = now
    await user.save()
  }
}

const usersService = new UsersService()
export default usersService