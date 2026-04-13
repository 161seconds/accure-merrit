import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

export interface RegisterReqBody {
  username: string
  email: string
  password: string
  confirm_password: string
  name: string
}

export interface LoginReqBody {
  username: string
  password: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface UpdateProfileReqBody {
  name?: string
  avatar?: string
  date_of_birth?: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface UpdateSettingsReqBody {
  font?: string
  theme?: string
  language?: string
}