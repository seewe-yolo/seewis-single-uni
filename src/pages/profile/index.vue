<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useToast } from '@wot-ui/ui'
import { toLoginPage } from '@/utils/toLoginPage'
import { useConfirmDialog } from '@/utils/dialog'
import { logout } from '@/services/auth'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '我的',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
// 使用storeToRefs解构userInfo
const { userInfo } = storeToRefs(userStore)

// 必须在 setup 顶层调用（内部依赖 inject）
const confirmDialog = useConfirmDialog()
const toast = useToast()

// 登录：唤起全局登录弹窗（微信一键登录）
function handleLogin() {
  toLoginPage()
}

async function handleLogout() {
  if (!(await confirmDialog('确定要退出登录吗？'))) {
    return
  }
  // 退出登录：注销后端会话并清空本地登录态与用户信息
  await logout()
  // 执行退出登录逻辑
  toast.success('退出登录成功')
  // #ifdef MP-WEIXIN
  // 微信小程序，去首页
  // uni.reLaunch({ url: '/pages/work/index' })
  // #endif
  // #ifndef MP-WEIXIN
  // 非微信小程序，去登录页
  // uni.navigateTo({ url: LOGIN_PAGE })
  // #endif
}
</script>

<template>
  <view class="profile-container">
    <wd-toast />
    <wd-dialog />
    <view class="mt-3 break-all px-3 text-center text-green-500">
      {{ userInfo.username ? '已登录' : '未登录' }}
    </view>
    <view class="mt-3 break-all px-3">
      {{ JSON.stringify(userInfo, null, 2) }}
    </view>

    <view class="mt-[60vh] px-3">
      <view class="m-auto w-160px text-center">
        <button v-if="tokenStore.hasLogin" type="warn" class="w-full" @click="handleLogout">
          退出登录
        </button>
        <button v-else type="primary" class="w-full" @click="handleLogin">
          登录
        </button>
      </view>
    </view>
  </view>
</template>
