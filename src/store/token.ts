import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/** 本地缓存的令牌信息（单 token 模式） */
export interface ITokenInfo {
  token: string
  /** 有效期（秒） */
  expiresIn: number
  /** 微信 openid（小程序登录时返回） */
  openid?: string
}

// 初始化状态（单 token 模式）
const tokenInfoState: ITokenInfo = {
  token: '',
  expiresIn: 0,
}

/**
 * 登录态状态仓库：只负责 token 的缓存、过期判断与持久化
 * 登录/退出的整合流程见 @/services/auth
 */
export const useTokenStore = defineStore(
  'token',
  () => {
    const tokenInfo = ref<ITokenInfo>({ ...tokenInfoState })

    // 添加一个时间戳 ref 作为响应式依赖
    const nowTime = ref(Date.now())
    /**
     * 更新响应式数据:now
     * 确保isTokenExpired重新计算,而不是用错误过期缓存值
     * 可useTokenStore内部适时调用;也可链式调用:tokenStore.updateNowTime().hasLogin
     * @returns 最新的tokenStore实例
     */
    const updateNowTime = () => {
      nowTime.value = Date.now()
      return useTokenStore()
    }

    /**
     * 写入 token 并记录过期时间
     */
    const setTokenInfo = (val: ITokenInfo) => {
      updateNowTime()
      tokenInfo.value = val
      uni.setStorageSync('accessTokenExpireTime', Date.now() + val.expiresIn * 1000)
    }

    /**
     * 清除本地登录态
     */
    const clear = () => {
      updateNowTime()
      // 清除存储的过期时间
      uni.removeStorageSync('accessTokenExpireTime')
      tokenInfo.value = { ...tokenInfoState }
      uni.removeStorageSync('token')
    }

    /**
     * 判断token是否过期
     */
    const isTokenExpired = computed(() => {
      const expireTime = uni.getStorageSync('accessTokenExpireTime')
      if (!expireTime)
        return true
      return nowTime.value >= expireTime
    })

    /**
     * 获取有效的token（已过期则返回空）
     * 建议这样使用 tokenStore.updateNowTime().validToken
     */
    const getValidToken = computed(() => {
      if (isTokenExpired.value) {
        return ''
      }
      return tokenInfo.value.token
    })

    /**
     * 检查是否有登录信息（不考虑token是否过期）
     */
    const hasLoginInfo = computed(() => {
      return !!tokenInfo.value?.token
    })

    /**
     * 检查是否已登录且token有效
     * 建议这样使用tokenStore.updateNowTime().hasLogin
     */
    const hasValidLogin = computed(() => {
      return hasLoginInfo.value && !isTokenExpired.value
    })

    return {
      // 认证状态判断（最常用的）
      hasLogin: hasValidLogin,

      // 内部系统使用的方法
      validToken: getValidToken,

      // 调试或特殊场景可能需要直接访问的信息
      tokenInfo,
      setTokenInfo,
      clear,
      updateNowTime,
    }
  },
  {
    // 添加持久化配置，确保刷新页面后token信息不丢失
    persist: true,
  },
)
