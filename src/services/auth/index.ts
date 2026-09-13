import type { IAuthLoginRes, ILoginBody, IUserInfoRes } from '@/api/types/login'
import { getUserInfo, login as loginApi, logout as logoutApi, register as registerApi } from '@/api/login'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

/** 客户端id：需为 sys_client 中配置且授权类型包含对应 grantType 的客户端 */
const CLIENT_ID = import.meta.env.VITE_APP_CLIENT_ID
/** 当前系统未启用多租户，与管理端保持一致 */
const TENANT_ID = '000000'

/**
 * 登录后统一处理：缓存 token 并拉取用户信息
 */
async function postLogin(res: IAuthLoginRes) {
  useTokenStore().setTokenInfo({
    token: res.access_token,
    expiresIn: res.expire_in,
    openid: res.openid,
  })
  await fetchUserInfo()
}

/**
 * 调用 wx.login 获取微信授权 code
 */
function getWxCode() {
  return new Promise<string>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => resolve(res.code),
      fail: err => reject(new Error(err.errMsg || '微信登录凭证获取失败')),
    })
  })
}

/**
 * 账号密码登录
 */
export async function loginByPassword(form: { username: string, password: string, code?: string, uuid?: string }) {
  const body: ILoginBody = { clientId: CLIENT_ID, tenantId: TENANT_ID, grantType: 'password', ...form }
  const res = await loginApi(body)
  await postLogin(res)
  return res
}

/**
 * 微信小程序一键登录（wx.login 取 code → 后端换取 token）
 * appid/appsecret 由后端 sys_config 或 justauth yml 配置决定，前端不传
 */
export async function loginByWechat() {
  const xcxCode = await getWxCode()
  const body: ILoginBody = {
    clientId: CLIENT_ID,
    tenantId: TENANT_ID,
    grantType: 'xcx',
    xcxCode,
  }
  const res = await loginApi(body)
  await postLogin(res)
  return res
}

/**
 * 用户注册
 */
export async function registerAccount(data: { username: string, password: string }) {
  return registerApi({ clientId: CLIENT_ID, tenantId: TENANT_ID, grantType: 'password', ...data })
}

/**
 * 获取当前登录用户信息并写入用户 store 缓存
 * @returns 映射后的用户信息
 */
export async function fetchUserInfo(): Promise<IUserInfoRes> {
  const res = await getUserInfo()
  const user = res.user
  const userInfo: IUserInfoRes = {
    userId: user.userId,
    username: user.userName,
    nickname: user.nickName,
    avatar: user.avatarUrl,
    roles: res.roles,
    permissions: res.permissions,
  }
  useUserStore().setUserInfo(userInfo)
  return userInfo
}

/**
 * 退出登录：请求后端注销（失败不阻塞），无论成败都清除本地登录态
 */
export async function logout() {
  try {
    await logoutApi()
  }
  catch (error) {
    console.error('退出登录失败:', error)
  }
  finally {
    useTokenStore().clear()
    useUserStore().clearUserInfo()
  }
}
