<script lang="ts" setup>
defineOptions({
  name: 'Home',
})
definePage({
  // 使用 type: "home" 属性设置首页，其他页面不需要设置，默认为page
  type: 'home',
  style: {
    // 全局已在 pages.config.ts 开启 navigationStyle: 'custom'，页面无需重复配置
    navigationBarTitleText: '工作台',
  },
})

const description = ref(
  'SafeResCloud（安储云）移动端，基于 uniapp + Vue3 + TypeScript + Vite5 + UnoCSS 构建，支持 H5、微信小程序与 App 多端访问。',
)

// 快捷入口：安全学习（已移至 pages-work 分包）
function goTraining() {
  uni.navigateTo({ url: '/pages-work/training/index' })
}
</script>

<template>
  <view class="bg-white px-4">
    <view class="mt-10">
      <image src="/static/logo.svg" alt="" class="mx-auto block h-28 w-28" />
    </view>
    <view class="mt-4 text-center text-4xl text-[#d14328]">
      安储云
    </view>
    <view class="mb-8 mt-2 text-center text-2xl">
      SafeResCloud
    </view>

    <view class="m-auto mb-2 max-w-100 text-justify indent text-4">
      {{ description }}
    </view>

    <!-- 快捷入口 -->
    <view class="m-auto mb-8 mt-6 max-w-100 flex flex-col gap-3">
      <view
        class="flex items-center justify-between rounded-lg bg-#f7f8fa p-4 active:bg-#eff0f1"
        @click="goTraining"
      >
        <view class="flex items-center gap-3">
          <text class="i-carbon-book text-6 text-[#18a058]" />
          <text class="text-4 text-#333639 font-medium">安全学习</text>
        </view>
        <text class="i-carbon-chevron-right text-4 text-#999" />
      </view>
    </view>
  </view>
</template>
