<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePageRefresh } from '@/hooks/usePageRefresh'
import { fetchUserInfo } from '@/services/auth'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import type { WorkbenchMenuItem } from './workbench-menu'
import { getVisibleWorkbenchMenus } from './workbench-menu'

defineOptions({
  name: 'Workbench',
})

definePage({
  type: 'home',
  style: {
    navigationBarTitleText: '工作台',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
const { userInfo } = storeToRefs(userStore)
const displayName = computed(() => userInfo.value.nickname || userInfo.value.username || '安环管理员')

// 下拉刷新：重新拉取当前登录用户信息（未登录时忽略）
usePageRefresh(async () => {
  if (!tokenStore.hasLogin) {
    return
  }
  await fetchUserInfo()
})

const quickActions = computed(() => getVisibleWorkbenchMenus({
  roles: userInfo.value.roles,
  permissions: userInfo.value.permissions,
}))

const todoItems = [
  { type: '审批', title: '呼吸器领用申请', meta: '张三 · 15 分钟前', tone: 'blue', route: '/pages-work/approval/detail/index' },
  { type: '预警', title: '急救药品批次临期', meta: '剩余 28 天 · 待处理', tone: 'amber', route: '/pages-work/alert/detail/index' },
  { type: '盘点', title: '中心库循环盘点', meta: '今日 18:00 截止', tone: 'teal', route: '/pages-work/todo/index' },
]

const recentRecords = [
  { type: '应急调用', title: '二号应急柜 · 防毒面具', meta: '2 件 · 今天 10:32', tone: 'red' },
  { type: '归还入库', title: '正压式空气呼吸器', meta: '1 件 · 昨日 16:20', tone: 'green' },
  { type: '扫码盘点', title: '车间应急箱 A-03', meta: '12 件 · 昨日 14:08', tone: 'blue' },
]

const quickToneClasses: Record<string, string> = {
  blue: 'text-#165DFF bg-#E8F3FF',
  teal: 'text-#0FC6C2 bg-#E8FFFB',
  red: 'text-#F53F3F bg-#FFF1F0',
  amber: 'text-#FF7D00 bg-#FFF3E8',
}

const todoToneClasses: Record<string, string> = {
  blue: 'text-#165DFF bg-#E8F3FF',
  amber: 'text-#FF7D00 bg-#FFF3E8',
  teal: 'text-#0FC6C2 bg-#E8FFFB',
}

const recentToneClasses: Record<string, string> = {
  red: 'bg-#F53F3F',
  green: 'bg-#00B42A',
  blue: 'bg-#165DFF',
}

function handleQuickAction(action: WorkbenchMenuItem) {
  uni.navigateTo({ url: action.route })
}

function handleTodo(item: typeof todoItems[number]) {
  uni.navigateTo({ url: item.route })
}

function goTodoList() {
  uni.navigateTo({ url: '/pages-work/todo/index' })
}
</script>

<template>
  <view class="p-32rpx">
    <view class="flex items-center justify-between">
      <view>
        <text class="block text-22rpx text-#86909C tracking-2rpx">今日工作台</text>
        <text class="mt-10rpx block text-42rpx text-#1D2129 font-bold leading-tight">上午好，{{ displayName }}</text>
        <text class="mt-10rpx block text-24rpx text-#4E5969">物资可用，风险可控，任务有序</text>
      </view>
      <view class="h-80rpx w-80rpx flex items-center justify-center border-6rpx border-#D6E4FF rounded-full bg-#165DFF text-30rpx text-white font-bold">
        <text>{{ displayName.slice(0, 1) }}</text>
      </view>
    </view>

    <view class="relative mt-30rpx overflow-hidden rounded-16px bg-#165DFF p-30rpx text-white shadow-[0_16rpx_36rpx_rgba(22,93,255,0.22)]">
      <text class="pointer-events-none absolute z-0 text-330rpx text-white/5 font-bold leading-none -right-28rpx -top-78rpx -rotate-8">储</text>
      <view class="relative z-1 flex items-start justify-between">
        <view>
          <text class="block text-22rpx text-white/60">今日运营状态</text>
          <text class="mt-8rpx block text-32rpx font-bold">库区运行平稳</text>
        </view>
        <view class="flex items-center border border-white/18 rounded-full bg-white/8 px-14rpx py-8rpx text-22rpx text-white">
          <view class="mr-8rpx h-12rpx w-12rpx rounded-full bg-#00B42A" />
          <text>正常</text>
        </view>
      </view>
      <view class="relative z-1 mt-32rpx flex border-t border-white/14 pt-24rpx">
        <view class="flex-1 border-r border-white/14">
          <text class="block text-center text-38rpx font-bold">3</text>
          <text class="mt-6rpx block text-center text-20rpx text-white/60">待处理预警</text>
        </view>
        <view class="flex-1 border-r border-white/14">
          <text class="block text-center text-38rpx font-bold">2</text>
          <text class="mt-6rpx block text-center text-20rpx text-white/60">待办审批</text>
        </view>
        <view class="flex-1 border-r-0">
          <text class="block text-center text-38rpx font-bold">98%</text>
          <text class="mt-6rpx block text-center text-20rpx text-white/60">账实相符率</text>
        </view>
      </view>
    </view>

    <view class="mx-4rpx mb-18rpx mt-36rpx flex items-center justify-between">
      <text class="text-30rpx text-#1d2129 font-bold">快捷作业</text>
      <text class="text-22rpx text-#86909c">常用功能</text>
    </view>
    <view class="grid grid-cols-3 gap-16rpx">
      <view
        v-for="action in quickActions"
        :key="action.key"
        class="min-w-0 flex flex-col items-center border border-#f2f3f5 rounded-16px bg-white p-[18rpx_8rpx_16rpx] transition-transform duration-120 active:scale-97"
        @click="handleQuickAction(action)"
      >
        <view
          class="h-66rpx w-66rpx flex items-center justify-center rounded-20rpx text-32rpx"
          :class="quickToneClasses[action.tone]"
        >
          <text :class="action.icon" />
        </view>
        <text class="mt-12rpx whitespace-nowrap text-22rpx text-#1d2129 font-semibold">{{ action.label }}</text>
        <text class="mt-6rpx whitespace-nowrap text-17rpx text-#86909c">{{ action.hint }}</text>
      </view>
    </view>

    <view class="mx-4rpx mb-18rpx mt-36rpx flex items-center justify-between">
      <text class="text-30rpx text-#1d2129 font-bold">我的待办</text>
      <text class="text-22rpx text-primary" @click="goTodoList">查看全部</text>
    </view>
    <view class="overflow-hidden border border-#f2f3f5 rounded-16px bg-white">
      <view
        v-for="(item, index) in todoItems"
        :key="item.title"
        class="mx-24rpx min-h-110rpx flex items-center border-b border-#f2f3f5"
        :class="{ 'border-b-0': index === todoItems.length - 1 }"
        @click="handleTodo(item)"
      >
        <view
          class="mr-18rpx h-36rpx w-62rpx flex items-center justify-center rounded-10rpx text-20rpx"
          :class="todoToneClasses[item.tone]"
        >
          {{ item.type }}
        </view>
        <view class="min-w-0 flex flex-1 flex-col">
          <text class="overflow-hidden text-ellipsis whitespace-nowrap text-25rpx text-#1d2129 font-semibold">{{ item.title }}</text>
          <text class="mt-8rpx text-20rpx text-#86909c">{{ item.meta }}</text>
        </view>
        <text class="i-carbon-chevron-right ml-12rpx text-28rpx text-#86909c" />
      </view>
    </view>

    <view class="grid grid-cols-2 mt-16rpx gap-16rpx">
      <view class="min-w-0 border border-#f2f3f5 rounded-16px bg-white p-24rpx">
        <view class="flex items-center justify-between">
          <text class="text-24rpx text-#1d2129 font-semibold">库存速览</text>
          <text class="text-18rpx text-#86909c">中心库</text>
        </view>
        <view class="mt-22rpx text-44rpx text-#1d2129 font-bold">
          128<text>件</text>
        </view>
        <text class="mt-2rpx block text-20rpx text-#86909c">可用库存</text>
        <view class="mt-20rpx h-10rpx overflow-hidden rounded-full bg-#f2f3f5">
          <view class="h-full w-88% rounded-full bg-primary" />
        </view>
        <view class="mt-10rpx flex justify-between text-18rpx text-#4e5969">
          <text>正常 112</text>
          <text>临期 8</text>
        </view>
      </view>

      <view class="min-w-0 border border-#f2f3f5 rounded-16px bg-white p-24rpx">
        <view class="flex items-center justify-between">
          <text class="text-24rpx text-#1d2129 font-semibold">培训进度</text>
          <text class="text-18rpx text-#86909c">本月</text>
        </view>
        <view class="mt-22rpx text-44rpx text-#1d2129 font-bold">
          78<text>%</text>
        </view>
        <text class="mt-2rpx block text-20rpx text-#86909c">参训任务完成率</text>
        <view class="mt-20rpx h-10rpx overflow-hidden rounded-full bg-#f2f3f5">
          <view class="h-full w-78% rounded-full bg-#0fc6c2" />
        </view>
        <text class="mt-10rpx block text-18rpx text-#4e5969">24 / 31 人已完成</text>
      </view>
    </view>

    <view class="mx-4rpx mb-18rpx mt-36rpx flex items-center justify-between">
      <text class="text-30rpx text-#1d2129 font-bold">最近记录</text>
      <text class="text-22rpx text-#86909c">示例数据</text>
    </view>
    <view class="overflow-hidden border border-#f2f3f5 rounded-16px bg-white">
      <view
        v-for="(item, index) in recentRecords"
        :key="item.title"
        class="mx-24rpx min-h-108rpx flex items-center border-b border-#f2f3f5"
        :class="{ 'border-b-0': index === recentRecords.length - 1 }"
      >
        <view class="mr-18rpx h-54rpx w-6rpx rounded-full" :class="recentToneClasses[item.tone]" />
        <view class="min-w-0 flex flex-1 flex-col">
          <text class="text-18rpx text-#86909c">{{ item.type }}</text>
          <text class="mt-4rpx overflow-hidden text-ellipsis whitespace-nowrap text-24rpx text-#1d2129 font-semibold">{{ item.title }}</text>
          <text class="mt-8rpx text-20rpx text-#86909c">{{ item.meta }}</text>
        </view>
        <text v-if="index === 0" class="mt--34rpx self-start text-18rpx text-#F53F3F">刚刚</text>
      </view>
    </view>
  </view>
</template>
