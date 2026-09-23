/**
 * /auth/login 请求体（后端 LoginBody 及各认证策略的扩展字段）
 */
export interface ILoginBody {
  /** 客户端id（sys_client 表配置，必填） */
  clientId: string
  /** 授权类型：password 账号密码 / xcx 微信小程序 */
  grantType: 'password' | 'xcx'
  /** 图形验证码（grantType=password 且后端开启验证码时必填） */
  code?: string
  /** 验证码唯一标识 */
  uuid?: string
  /** grantType=password：用户名 */
  username?: string
  /** grantType=password：密码 */
  password?: string
  /** grantType=xcx：小程序 appid（多个小程序时使用） */
  appid?: string
  /** grantType=xcx：wx.login 获取的授权 code */
  xcxCode?: string
  /** grantType=xcx：wx.getPhoneNumber 获取的手机号授权 code */
  phoneCode?: string
}

/**
 * /auth/register 请求体（后端 RegisterBody extends LoginBody）
 */
export interface IRegisterBody extends ILoginBody {
  /** 用户名（2-30 位） */
  username: string
  /** 密码（5-30 位） */
  password: string
  /** 用户类型 */
  userType?: string
}

/**
 * /auth/code 响应（后端 CaptchaVo）
 */
export interface ICaptcha {
  /** 是否启用验证码（false 时 uuid/img 为空，无需展示验证码输入） */
  captchaEnabled: boolean
  /** 验证码唯一标识（登录时随 code 回传） */
  uuid?: string
  /** Base64 图片数据（不含 data:image 前缀） */
  img?: string
}

/**
 * 登录返回的令牌信息（后端 LoginVo，字段为 snake_case）
 */
export interface IAuthLoginRes {
  /** 授权令牌 */
  access_token: string
  /** 授权令牌有效期（秒） */
  expire_in: number
  /** 刷新令牌 */
  refresh_token?: string
  /** 刷新令牌有效期（秒） */
  refresh_expire_in?: number
  /** 应用id */
  client_id?: string
  /** 令牌权限 */
  scope?: string
  /** 用户 openid（grantType=xcx 时返回） */
  openid?: string
}

/**
 * 用户信息
 */
export type UserRole = string

export interface IUserInfoRes {
  userId: number
  username: string
  nickname: string
  avatar?: string
  roles?: UserRole[]
  permissions?: string[]
  [key: string]: any // 允许其他扩展字段
}

/**
 * /system/user/getInfo 响应（后端 UserInfoVo）
 */
export interface IGetUserInfoRes {
  /** 用户基本信息（后端 SysUserVo） */
  user: {
    userId: number
    userName: string
    nickName: string
    /** 头像 ossId */
    avatar?: string
    userType?: string
    [key: string]: any
  }
  /** 角色权限字集合 */
  roles: string[]
  /** 菜单权限字集合 */
  permissions: string[]
}
