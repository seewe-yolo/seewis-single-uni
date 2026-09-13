import type { IUserInfoRes } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 初始化状态
const userInfoState: IUserInfoRes = {
  userId: -1,
  username: '',
  nickname: '',
  avatar: '/static/images/default-avatar.png',
}

/**
 * 用户信息状态仓库：只负责用户信息的缓存与持久化
 * 用户信息的获取与映射逻辑见 @/services/auth 的 fetchUserInfo
 */
export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoRes>({ ...userInfoState })
    // 设置用户信息
    const setUserInfo = (val: IUserInfoRes) => {
      // 若头像为空 则使用默认头像
      if (!val.avatar) {
        val.avatar = userInfoState.avatar
      }
      userInfo.value = val
    }
    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
    }
    // 删除用户信息
    const clearUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('user')
    }

    return {
      userInfo,
      clearUserInfo,
      setUserInfo,
      setUserAvatar,
    }
  },
  {
    persist: true,
  },
)
