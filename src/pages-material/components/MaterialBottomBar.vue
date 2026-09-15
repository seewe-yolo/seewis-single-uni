<script lang="ts" setup>
defineOptions({ name: 'MaterialBottomBar' })
/**
 * 物资分包统一底部操作栏：固定悬浮 + 安全区适配，按钮与左侧摘要由页面插槽提供。
 */
</script>

<template>
  <view class="bottom-bar">
    <slot />
  </view>
</template>

<style lang="scss" scoped>
.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: flex;
  gap: 24rpx;
  align-items: center;
  padding: 20rpx 32rpx;
  padding-bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  background-color: #ffffff;
  box-shadow: 0 -2rpx 16rpx rgb(29 33 41 / 6%);
}
</style>
