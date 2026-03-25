import User from '~/models/user.schema'
import databaseServices from './database.services'
import { LoginReqBody, RegisterReqBody, updateMeReqBody } from '~/models/request/user.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { StringValue } from 'ms'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import RefreshToken from '~/models/RefreshToken.shema'
import { ObjectId } from 'mongodb'
import { verify } from 'crypto'

class UsersServices {
  private signAccessToken(user_id: string) {
    return signToken({
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      payload: { user_id, token_type: TokenType.AccessToken }, //0
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  private signRefeshToken(user_id: string) {
    return signToken({
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      payload: { user_id, token_type: TokenType.RefreshToken }, //0
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      payload: { user_id, token_type: TokenType.EmailVerificationToken }, //0
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  async register(payload: RegisterReqBody) {
    const { email, password } = payload
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    // tạo user và lưu vào database
    const result = await databaseServices.users.insertOne(
      new User({
        ...payload,
        username: `user${user_id.toString()}`,
        _id: user_id,
        date_of_birth: new Date(payload.date_of_birth), // ghi đè lên để ép kiểu dữ liệu chp date_of_birth
        password: hashPassword(payload.password), //ghi đề lại password
        email_verify_token
      })
    )
    //lấy id của user vừa tạo để làm ac và rf
    //ký ac và rf
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id.toString()),
      this.signRefeshToken(user_id.toString())
    ])
    // thiếu việc lưu rf vào database
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id
      })
    )
    // hàm gửi mail

    console.log(`http://localhost:4115/users/verify-email/?email_verify_token=${email_verify_token}`)

    // trả ra kết quả việc thêm (id của object vừa thêm)
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmail(email: string): Promise<Boolean> {
    const user = await databaseServices.users.findOne({ email })
    return Boolean(user)
  }

  async login(payload: LoginReqBody) {
    //tìm user bằng các email và password đã mã hóa
    const user = await databaseServices.users.findOne({
      ...payload, //
      password: hashPassword(payload.password)
    })
    //nếu kh có thì báo lỗi
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
        message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
      })
    }
    //nếu có thì phải tạo access và refresh từ user_id của user tìm được
    const user_id = user._id.toString()
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefeshToken(user_id)
    ])
    //
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async checkRefreshToken({ user_id, refresh_token }: { user_id: string; refresh_token: string }) {
    const refreshToken = databaseServices.refreshTokens.findOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })
    // nếu không có thì báo lỗi
    if (!refreshToken) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
      })
    }
    // nếu có thì thôi
  }

  async logout(refresh_token: string) {
    await databaseServices.refreshTokens.deleteOne({ token: refresh_token })
  }

  async checkEmailVerifyToken({
    //
    user_id,
    email_verify_token
  }: {
    user_id: string
    email_verify_token: string
  }) {
    //tìm user
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      email_verify_token
    })
    //nếu không có nghĩa là mã này cũ rồi, hoặc user bị xóa rồi
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
        message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID
      })
    }
    //nếu có thì soa
    return true
  }

  // hàm đổi trạng thái verify của user
  async checkVerifyEmail(user_id: string) {
    //cập nhật thông tin của user đó
    await databaseServices.users.updateOne(
      //
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }

  //lấy thông tin verify của user
  async getUserVerifyStatus(user_id: string) {
    const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED, //401
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    //nếu có user thì return
    return user.verify
  }

  // hàm resend email verify token
  async resendEmailVerifyToken(user_id: string) {
    // tạo email verify token mới
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    // cập nhật vào database
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            email_verify_token,
            updated_at: '$$NOW'
          }
        }
      ] //
    )
    //gửi email
    console.log(`http://localhost:4115/users/verify-email/?email_verify_token=${email_verify_token}`)
    return
  }

  //
  async signForgotPasswordToken(user_id: string) {
    return signToken({
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      payload: { user_id, token_type: TokenType.EmailVerificationToken }, //0
      options: { expiresIn: process.env.EMAIL_PASSWORD_TOKEN_EXPIRE_IN as StringValue }
    })
  }

  //
  async forgotPassword(email: string) {
    //tìm user theo email
    const user = (await databaseServices.users.findOne({ email })) as User
    //lấy user_id
    const user_id = (user._id as ObjectId).toString()
    //tạo mã forgotPassword
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    //cập nhật thêm forgot_password_token cho user
    await databaseServices.users.updateOne(
      {
        _id: user._id //
      },
      [
        {
          $set: {
            forgot_password_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
    // gửi mail cái link
    console.log(`http://localhost:8000/users/verify-email/?forgot_password_token=${forgot_password_token}`)
  }

  async checkForgotPasswordToken({
    user_id,
    forgot_password_token
  }: {
    user_id: string
    forgot_password_token: string
  }) {
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      forgot_password_token
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID
      })
    }
    //còn có thì thui, kh có gì cạ
  }
  //
  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    //tìm và cập nhập password
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) }, //filter
      [
        {
          $set: {
            forgot_password_token: '',
            password: hashPassword(password),
            updated_at: '$$NOW'
          }
        }
      ]
    )
  }
  //
  async getMe(user_id: string) {
    const user = await databaseServices.users.findOne(
      {
        _id: new ObjectId(user_id)
      }, //
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    //
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    //
    return user
  }

  async updateMe({ user_id, payload }: { user_id: string; payload: updateMeReqBody }) {
    //payload này có thứ cân fix là date ò birth
    const _payload = payload.date_of_birth //
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload

    if (_payload.username) {
      //nếu có truyền username
      //tìm user có username này chưa,
      const user = await databaseServices.users.findOne({ username: _payload.username })
      if (user) {
        //có là đã có người dùng
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS
        })
      }
    }
    const user = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            ..._payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async changePassword({
    user_id,
    old_password,
    password
  }: {
    user_id: string
    old_password: string
    password: string
  }) {
    // tìm user với user_id và old_password để xem có user không, trước khi update
    // password mới
    const user = await databaseServices.users.findOne({
      _id: new ObjectId(user_id),
      password: hashPassword(old_password)
    })
    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    //nếu có thì đổi
    await databaseServices.users.updateOne(
      { _id: new ObjectId(user_id) }, //filter)
      [
        {
          $set: {
            password: hashPassword(password),
            updated_at: '$$NOW'
          }
        }
      ]
    )
    //nếu xong thì thui
  }

  async refreshToken({
    user_id, //
    refresh_token
  }: {
    user_id: string
    refresh_token: string
  }) {
    //xóa rf token cũ
    await databaseServices.refreshTokens.deleteOne({
      token: refresh_token
    })
    //tạo hai mã mới và gửi cho người dùng
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefeshToken(user_id)
    ])
    //
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({
        token: new_refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return {
      access_token,
      refresh_token: new_refresh_token
    }
  }

  //
}

const userServices = new UsersServices()
export default userServices
