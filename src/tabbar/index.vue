<script setup lang="ts">
// i-carbon-code
import { customTabbarEnable, needHideNativeTabbar, tabbarCacheEnable } from './config'
import { setTabbarItem } from './i18n'
import { tabbarList, tabbarStore } from './store'
import TabbarItem from './TabbarItem.vue'

// #ifdef MP-WEIXIN
// 将自定义节点设置成虚拟的（去掉自定义组件包裹层），更加接近Vue组件的表现，能更好的使用flex属性
defineOptions({
  virtualHost: true,
})
// #endif

/**
 * tabbarItem 的点击事件（含中间鼓包项，鼓包同样是正常 Tab 页，需切换）
 */
function handleClick(index: number) {
  // 点击原来的不做操作
  if (index === tabbarStore.curIdx) {
    return
  }
  const list = tabbarList.value
  if (!list[index]) {
    return
  }
  const url = list[index].pagePath
  tabbarStore.setCurIdx(index)
  if (tabbarCacheEnable) {
    uni.switchTab({ url })
  }
  else {
    uni.navigateTo({ url })
  }
}
// #ifndef MP-WEIXIN || MP-ALIPAY
// 因为有了 custom:true， 微信里面不需要多余的hide操作
onLoad(() => {
  // 解决原生 tabBar 未隐藏导致有2个 tabBar 的问题
  needHideNativeTabbar
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
  })
})
// #endif

// #ifdef MP-ALIPAY
onMounted(() => {
  // 解决支付宝自定义tabbar 未隐藏导致有2个 tabBar 的问题; 注意支付宝很特别，需要在 onMounted 钩子调用
  customTabbarEnable // 另外，支付宝里面，只要是 customTabbar 都需要隐藏
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
  })
})
// #endif
const activeColor = 'var(--wot-color-theme, #1890ff)'
const inactiveColor = '#666'
function getColorByIndex(index: number) {
  return tabbarStore.curIdx === index ? activeColor : inactiveColor
}

// 注意，上面处理的是自定义tabbar，下面处理的是原生tabbar，参考：https://unibest.tech/base/10-i18n
onShow(() => {
  setTabbarItem()
})
</script>

<template>
  <view v-if="customTabbarEnable" class="h-56px pb-safe">
    <view class="capsule-fixed rounded-full bg-white" @touchmove.stop.prevent>
      <view class="h-56px flex items-center px-2">
        <view
          v-for="(item, index) in tabbarList" :key="index"
          class="flex flex-1 flex-col items-center justify-center"
          :style="{ color: getColorByIndex(index) }"
          @click="handleClick(index)"
        >
          <view v-if="item.isBulge" class="relative">
            <!-- 中间一个鼓包tabbarItem的处理 -->
            <view class="bulge">
              <TabbarItem :item="item" :index="index" class="text-center" is-bulge />
            </view>
          </view>
          <TabbarItem v-else :item="item" :index="index" class="relative px-3 text-center" />
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
// 胶囊状悬浮 tabbar：距底部为安全区距离，左右留边悬浮
.capsule-fixed {
  position: fixed;
  bottom: env(safe-area-inset-bottom);
  left: 32rpx;
  right: 32rpx;
  z-index: 1000;
  box-sizing: border-box;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.12);
}
// 中间悬浮按钮：真实尺寸圆钮（不缩放，边缘清晰平滑），白环与胶囊衔接，浮起带柔和投影
.bulge {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -66%);
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 120rpx;
  height: 120rpx;
  border: 8rpx solid #fff;
  border-radius: 50%;
  background: linear-gradient(160deg, #56a8f5 0%, var(--wot-color-theme, #1890ff) 100%);
  color: #fff;
  box-shadow: 0 10rpx 24rpx rgba(24, 144, 255, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:active {
    transform: translate(-50%, -64%) scale(0.94);
    box-shadow: 0 6rpx 14rpx rgba(24, 144, 255, 0.3);
  }
}
</style>
