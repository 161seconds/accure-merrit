import express from 'express'
import {
  changePasswordController,
  emailVerifyController,
  fotgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator
} from '~/middlewares/users.middlewares'
import { updateMeReqBody } from '~/models/request/user.requests'
import userServices from '~/services/users.services'
import { wrapAsync } from '~/utils/handler'

const userRouter = express.Router() //tạo userRouter chứa api liên quan user

/*
// userRouter sẽ có middleWare
userRouter.use(
  (req, res, next) => {
    console.log('Time1', Date.now())
    next()
    // return res.status(400).json({
    //   data: 'not allowed'
    // })
    // console.log('56528525')
    //bản chất server là promise luôn hứa và kh bao giờ reject, nên phải return chứ kh là nó vẫn chạy các hàm ở dưới ó. chú ý dcm
  },
  (req, res, next) => {
    console.log('Time2', Date.now())
    next()
  }
)

userRouter.get('/get-me', (req, res) => {
  res.json({
    data: {
      fname: 'Hank',
      yob: 2006
    }
  })
})
***************************************************/

// login
/**
 path: /users/login
 method: POST
 body: {email, password}

 trong request cos 4 phan: header, body, ...
 */

userRouter.post('/login', loginValidator, wrapAsync(loginController))
// loginValidator đang là middleware nè, nó có next, tại nó đứng giữa,
// loginController là controller, chỉ in ra kết quả cúi

/*
  register
  path: users/register
  method: POST
  body:{
    email: string,
    name: string,
    password: string,
    confirm_password: string,
    date_of_birth: ISO8601
  }
*/
userRouter.post(
  '/register',
  registerValidator, //
  wrapAsync(registerController)
  // (err, req, res, next) => {
  //   console.log('lỗi nè' + err.message)
  //   res.status(400).json({ message: err.message })
  // }
  //đừng để ở đây, vì chúng ta muốn ném tất cả lỗi ở toàn bộ hệ thống vào 1 chỗ, nên ném nó ở cúi index
)

/**
Logout: 
path: /users/logout
method: post
header:{
  Authorization: "Bearer access_token"
}
body: {
  refresh_token: string
} 

 */

userRouter.post(
  '/logout',
  accessTokenValidator, //
  refreshTokenValidator,
  wrapAsync(logoutController)
)

/**
khi người dùng nhấn vào link trong email sẽ lập tức gửi token len route này, 
mình sẽ verify token thông qua link này và verify người dùng
path: /users/verify-email/?email_verify_token=string
method: GET

 */
userRouter.get(
  '/verify-email/', //
  emailVerifyTokenValidator,
  wrapAsync(emailVerifyController)
)

/**
Resend email verify token
des: khi người dùng kh nhận được email verify token thì có thể gửi lại
path: /users/resend-verify-email
method: post
header: {
  Authorization: 'Bearer access_token'
}
 */
userRouter.post(
  '/resend-verify-email', //
  accessTokenValidator, //hàm làm gòi, khỏe ge
  wrapAsync(resendEmailVerifyController)
)

/**
Forgot password
des: khi người dùng quên mk có thể gửi yêu cầu đặt lại mk, ta tạo link gửi vào email
path: /users/forgot-password
method: post
body: {
  email: string
}
 */
userRouter.post('/forgot-password', forgotPasswordValidator, fotgotPasswordController)

// verify-forgot-password
// khi người dùng vào mail click vào link để verify, họ sẽ gửi
// forgot_password_token cho frontend, frontend sẽ gửi token này lên server đẻ verify nếu oke
//thì hiển thị form nhập mk mới
// path: /users/verify-forgot-password
// method: POST
// body: {
//    forgot_password_token: string
// }
userRouter.post(
  '/verify-forgot-password', //
  forgotPasswordTokenValidator, //kiểm tra forgot_password_token trong body
  wrapAsync(verifyForgotPasswordController)
)

/**
  reset-password
  des: Frontend sẽ gửi password và confirm_password, kèm với forgot_password_token mới lên cho backend tiến hành xác thực và đổi mật khẩu
  path: users/reset-password
  method: POST
  body: {
    password: string,
    confirm_password: string,
    forgot_password_token: string
  }
 */
userRouter.post(
  '/reset-password', //
  forgotPasswordTokenValidator, //hàm kiểm tra mã
  resetPasswordValidator, // kiểm tra password và confirm_password mới
  wrapAsync(resetPasswordController)
)

//
/**
  getMe
  des: lấy thông tin của chính mình, của user đang đăng nhập
  path: /users/me
  method: post
  headers{
    Authorization: 'Bearer access_token'
  }
 */
userRouter.post(
  '/me',
  accessTokenValidator, //
  wrapAsync(getMeController)
)
/*
des: update profile của user
path: '/me'
method: patch
Header: {Authorization: Bearer <access_token>}
body: {
  name?: string
  date_of_birth?: Date
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional}
*/

userRouter.patch(
  '/me', //
  accessTokenValidator,
  updateMeValidator,
  filterMiddleware<updateMeReqBody>([
    //
    'bio',
    'avatar',
    'name',
    'date_of_birth',
    'location',
    'website',
    'username',
    'cover_photo'
  ]),
  wrapAsync(updateMeController)
)

/**
  chức năng thay đổi mk
  des: người dùng đang đăng nhập và muốn đổi mật khẩu
  path: /change-password
  method: PUT
  header:{
    Authorization: "Bearer access_token"
  }
    body:{
    old_password: string,
    password: string,
    confim_password: string
  }
 */
userRouter.put(
  '/change-password', //
  accessTokenValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

/**
  des: Khi access_token hết hạn thì mình phải gửi lên mã refresh_token để xin lại một mã access_token khác
  path: "/refresh-token"
  method: "POST"
  body: {
    refresh_token: string
  }
 */
userRouter.post(
  '/refresh-token', //
  refreshTokenValidator,
  wrapAsync(refreshTokenController)
)
//
export default userRouter
