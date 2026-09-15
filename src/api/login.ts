import type { IAuthLoginRes, ICaptcha, IGetUserInfoRes, ILoginBody, IRegisterBody } from './types/login'
import { http } from '@/http/http'

/**
 * 统一登录入口（后端按 grantType 分发认证策略）
 * - grantType=password：账号密码登录，需传 username/password
 * - grantType=xcx：微信小程序登录，需传 xcxCode
 * @param data 登录请求体（后端 LoginBody）
 */
export function login(data: ILoginBody) {
  return http.post<IAuthLoginRes>('/auth/login', data)
}

/**
 * 获取图形验证码（grantType=password 登录用）
 * 后端关闭验证码时返回 captchaEnabled=false，无需展示验证码输入
 */
export function getCode() {
  return http.get<ICaptcha>('/auth/code')
}

/**
 * 用户注册
 * @param data 注册请求体（后端 RegisterBody）
 */
export function register(data: IRegisterBody) {
  return http.post<void>('/auth/register', data)
}

/**
 * 获取当前登录用户信息（含角色、菜单权限）
 */
export function getUserInfo() {
  return http.get<IGetUserInfoRes>('/system/user/getInfo')
}

/**
 * 退出登录
 */
export function logout() {
  return http.post<void>('/auth/logout')
}
