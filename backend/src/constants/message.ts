export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Lỗi xác thực dữ liệu',
  // Register
  USERNAME_IS_REQUIRED: 'Tên tài khoản là bắt buộc',
  USERNAME_MUST_BE_STRING: 'Tên tài khoản phải là chuỗi',
  USERNAME_LENGTH: 'Tên tài khoản phải từ 3 đến 30 ký tự',
  USERNAME_INVALID: 'Tên tài khoản chỉ chứa chữ, số và dấu _',
  USERNAME_EXISTED: 'Tên tài khoản đã tồn tại',
  EMAIL_IS_REQUIRED: 'Email là bắt buộc',
  EMAIL_IS_INVALID: 'Email không hợp lệ',
  EMAIL_EXISTED: 'Email đã tồn tại',
  PASSWORD_IS_REQUIRED: 'Mật khẩu là bắt buộc',
  PASSWORD_MUST_BE_STRING: 'Mật khẩu phải là chuỗi',
  PASSWORD_LENGTH: 'Mật khẩu phải từ 6 đến 50 ký tự',
  PASSWORD_MUST_BE_STRONG: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Xác nhận mật khẩu là bắt buộc',
  CONFIRM_PASSWORD_NOT_MATCH: 'Xác nhận mật khẩu không khớp',
  NAME_IS_REQUIRED: 'Tên hiển thị là bắt buộc',
  NAME_MUST_BE_STRING: 'Tên phải là chuỗi',
  NAME_LENGTH: 'Tên phải từ 1 đến 50 ký tự',
  // Auth
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGIN_FAILED: 'Sai tài khoản hoặc mật khẩu',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token là bắt buộc',
  ACCESS_TOKEN_INVALID: 'Access token không hợp lệ',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token là bắt buộc',
  REFRESH_TOKEN_INVALID: 'Refresh token không hợp lệ',
  REFRESH_TOKEN_NOT_FOUND: 'Refresh token không tồn tại',
  REFRESH_TOKEN_SUCCESS: 'Refresh token thành công',
  // User
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  GET_PROFILE_SUCCESS: 'Lấy thông tin thành công',
  UPDATE_PROFILE_SUCCESS: 'Cập nhật thông tin thành công',
  CHANGE_PASSWORD_SUCCESS: 'Đổi mật khẩu thành công',
  OLD_PASSWORD_INCORRECT: 'Mật khẩu cũ không đúng',
  UPDATE_SETTINGS_SUCCESS: 'Cập nhật cài đặt thành công',
  DELETE_ACCOUNT_SUCCESS: 'Xoá tài khoản thành công',
  GET_STATS_SUCCESS: 'Lấy thống kê thành công'
} as const

export const KARMA_MESSAGES = {
  CREATE_SUCCESS: 'Thêm bản ghi thành công',
  GET_SUCCESS: 'Lấy danh sách thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xoá bản ghi thành công',
  NOT_FOUND: 'Không tìm thấy bản ghi',
  TYPE_IS_REQUIRED: 'Loại hành động (duc/toi) là bắt buộc',
  TYPE_INVALID: 'Loại hành động phải là "duc" hoặc "toi"',
  TITLE_IS_REQUIRED: 'Tên hành động là bắt buộc',
  TITLE_LENGTH: 'Tên không được quá 100 ký tự',
  POINTS_IS_REQUIRED: 'Số điểm là bắt buộc',
  POINTS_INVALID: 'Điểm phải từ 1 đến 100',
  SUMMARY_SUCCESS: 'Lấy tổng hợp thành công'
} as const

export const WISH_MESSAGES = {
  CREATE_SUCCESS: 'Gửi lời nguyện thành công',
  GET_SUCCESS: 'Lấy danh sách lời nguyện thành công',
  DELETE_SUCCESS: 'Xoá lời nguyện thành công',
  NOT_FOUND: 'Không tìm thấy lời nguyện',
  CATEGORY_IS_REQUIRED: 'Loại nguyện là bắt buộc',
  CONTENT_IS_REQUIRED: 'Nội dung lời nguyện là bắt buộc',
  CONTENT_LENGTH: 'Lời nguyện không được quá 300 ký tự'
} as const

export const WOODEN_FISH_MESSAGES = {
  TAP_SUCCESS: 'Gõ mõ thành công',
  GET_COUNT_SUCCESS: 'Lấy số lần gõ mõ thành công'
} as const