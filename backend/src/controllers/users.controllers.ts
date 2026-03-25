import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import {
  ChangePasswordReqBody,
  EmailVerifyReqQuery,
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  updateMeReqBody,
  VerifyForgotPasswordTokenReqBdy
} from '~/models/request/user.requests'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import userServices from '~/services/users.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { UserVerifyStatus } from '~/constants/enums'
import { validateHeaderName } from 'http'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>, //
  res: Response
) => {
  //code mà vào được đây tức là dữ liệu truyền lên ngon
  //body có email và password ngon, chỉ cần kiểm tra đúng không thôi
  const result = await userServices.login(req.body)
  //gửi result cho client
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result //ac và rf để nó truy cập
  })
}
// export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
// cái này là định nghĩa lại cái thứ 3 để có thể spam ra xem thử là mình gửi cái gì lên server, nên 2 cái đầu tiên phải giữ lại
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>, //
  res: Response,
  next: NextFunction
) => {
  //ở đây dữ liệu xem như đã được kiểm tra(valid)
  // mình chỉ xài theo mục đích thôi
  // kiểm tra xem password và confirm_password có giống nhau không?

  // kiểm tra xem email có tồn tại không?
  let isEmailExisted = await userServices.checkEmail(req.body.email)
  if (isEmailExisted) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY, //422
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
    })
  }
  // tạo user và lưu vào database(ra lệnh database tạo user từ các thông tin trên)
  const result = await userServices.register(req.body)
  // đóng gói kiện nếu tạo thành công
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>, //
  res: Response
) => {
  const { user_id: user_id_ac } = req.decoded_authorization as TokenPayload
  const { user_id: user_id_rf } = req.decoded_refresh_token as TokenPayload
  if (user_id_ac !== user_id_rf) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
    })
  }
  const { refresh_token } = req.body
  // kiểm tra xem rf còn trên hệ thống không?
  await userServices.checkRefreshToken({
    user_id: user_id_rf,
    refresh_token
  })
  //nếu khớp mã thì xóa rf
  await userServices.logout(refresh_token) // xóa rf token khỏi hệ thống
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, any, EmailVerifyReqQuery>, // vị trí thứ 4
  res: Response
) => {
  const { email_verify_token } = req.query
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  //kiểm tra xem user_id có còn sở hữu cặp mã email_verify_token này kh?
  await userServices.checkEmailVerifyToken({ user_id, email_verify_token })
  //nếu còn thì mình đổi trạng thái verify của account
  await userServices.checkVerifyEmail(user_id)
  // nếu mà ok hết thì sao
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS
  })
}

export const resendEmailVerifyController = async (
  req: Request, //
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const verifyStatus = await userServices.getUserVerifyStatus(user_id)
  //nếu mà trạng thái hiện tại đã verify rồi thi xin làm gì
  if (verifyStatus == UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.OK)
    {
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    }
  }
  //nếu mà trạng thái hiện tại là banned rồi thì sao
  if (verifyStatus == UserVerifyStatus.Banned) {
    return res.status(HTTP_STATUS.OK)
    {
      message: USERS_MESSAGES.ACCOUNT_HAS_BEEN_BANNED
    }
  }
  // nếu chưa verify thì gữi mã
  if (verifyStatus == UserVerifyStatus.Unverified) {
    await userServices.resendEmailVerifyToken(user_id)
    return res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.CHECK_YOUR_EMAIL
    })
  }
}

export const fotgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>, //
  res: Response
) => {
  const { email } = req.body
  //kiểm tra xem email có tồn tại kh
  const isExisted = await userServices.checkEmail(email)
  if (!isExisted) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // nếu tồn tại thì tạo link reset password và gửi vào email
  await userServices.forgotPassword(email)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CHECK_YOUR_EMAIL
  })
}

//
export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBdy>, //
  res: Response
) => {
  // người ta đưa mã cho mình và muốn biết mã đã verify hay chưa
  // mình đã verify có nghĩa là mã do mình tạo ra
  // nhưng mình phải xem thử mã này là cũ hya mới trong hệ thống
  // tức là trong database có còn mã này nữa hay không
  // tức là user_id có còn sở hữu forgot_password_token này không
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { forgot_password_token } = req.body
  await userServices.checkForgotPasswordToken({
    user_id, //
    forgot_password_token
  })
  //nếu có thông tin thì ok thoi
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  //kiểm tra xem forgot_password_token có còn khớp với user_id nữa không?
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { forgot_password_token, password } = req.body
  //nếu còn thì tiến hành đối mật khẩu mới do req cung cấp
  await userServices.checkForgotPasswordToken({
    user_id,
    forgot_password_token
  })

  await userServices.resetPassword({
    user_id,
    password
  })
  //xong thì res
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
  })
}

export const getMeController = async (
  req: Request, //
  res: Response
) => {
  //dùng user_id tìm thông tin user
  const { user_id } = req.decoded_authorization as TokenPayload
  const userInfor = await userServices.getMe(user_id)
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: userInfor
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, updateMeReqBody>, //
  res: Response
) => {
  // chức năng update này tôi muốn chỉ khi user đã verify thì tui mới cho
  const { user_id } = req.decoded_authorization as TokenPayload
  const verifyStatus = await userServices.getUserVerifyStatus(user_id)
  if (verifyStatus != UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: USERS_MESSAGES.USER_NOT_VERIFIED
    })
  }
  //nếu verify thì tiến hành update
  const userInfor = await userServices.updateMe({
    user_id,
    payload: req.body //payload là nội dung cần update
  })
  //nếu update thành công thì gửi thông tin user đã update
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESS,
    result: userInfor
  })
}

export const changePasswordController = async (
  //
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  // lấy user_id update cho ai
  const { user_id } = req.decoded_authorization as TokenPayload
  const { old_password, password } = req.body
  // tiến hành update cho user_id này
  await userServices.changePassword({
    user_id,
    old_password,
    password
  })
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
  })
}

export const refreshTokenController = async (
  //
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  //mình cần kiểm tra xem refresh_token người dùng đưa còn trên database hong?
  const { user_id } = req.decoded_refresh_token as TokenPayload
  const { refresh_token } = req.body
  await userServices.checkRefreshToken({ user_id, refresh_token })
  //hàm này nhận vào user_id và refresh_token tiến hành tạo access và refresh_token mới
  // gửi cho người dùng để duy trì đăng nhập
  const result = await userServices.refreshToken({ user_id, refresh_token })
  return res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REFRESH_TOKEN_IS_SUCCESS
  })
}
