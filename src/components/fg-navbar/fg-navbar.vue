<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { navbarState, useNavbarRegistry } from '@/hooks/useNavbar'
import { isPageTabbar } from '@/tabbar/store'
import { currRoute, getAllPages } from '@/utils'

const props = withDefaults(defineProps<{
  /** 覆盖自动获取的页面标题（默认取 pages.json 的 navigationBarTitleText） */
  title?: string
  /** 覆盖返回箭头显隐（默认：非 Tab 页显示） */
  leftArrow?: boolean
  /** 全局实例（由布局挂载）：当前路由存在页面级 <fg-navbar> 时自动隐藏 */
  global?: boolean
  /** 是否固定在顶部 */
  fixed?: boolean
  /** 固定后是否生成等高占位（把页面内容顶下来） */
  placeholder?: boolean
}>(), {
  title: '',
  leftArrow: undefined,
  global: false,
  fixed: true,
  placeholder: true,
})

/** 扫码页不显示导航栏 */
const SCAN_PAGE = '/pages/material/index'

const { register, unregister } = useNavbarRegistry()

const route = ref('')

function syncRoute() {
  route.value = currRoute().path
}

onMounted(() => {
  syncRoute()
  // 页面级实例：注册路由，让全局实例对本页隐藏
  if (!props.global) {
    register(route.value)
  }
})
onUnmounted(() => {
  if (!props.global) {
    unregister(route.value)
  }
})
onShow(syncRoute)

const visible = computed(() => {
  if (!route.value || route.value === SCAN_PAGE) {
    return false
  }
  if (props.global && navbarState.customRoutes.has(route.value)) {
    return false
  }
  return true
})

const pageTitle = computed(() => {
  if (props.title) {
    return props.title
  }
  return getAllPages().find(page => page.path === route.value)?.style?.navigationBarTitleText || ''
})

const arrowVisible = computed(() => {
  if (props.leftArrow !== undefined) {
    return props.leftArrow
  }
  // 非 Tab 页（二级页面）显示返回箭头
  return !isPageTabbar(route.value)
})

/** 返回：有上级页面则返回上一页，否则回工作台 */
function handleBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
  }
  else {
    uni.switchTab({ url: '/pages/work/index' })
  }
}
</script>

<template>
  <wd-navbar
    v-if="visible"
    :title="pageTitle"
    :fixed="fixed"
    :placeholder="placeholder"
    :safe-area-inset-top="true"
    :z-index="99"
  >
    <!-- 左侧：返回箭头 + 用户自定义按钮（不绑定 wd-navbar 的 click-left，自定义按钮点击不会误触返回） -->
    <template #left>
      <view v-if="arrowVisible" class="center" @click="handleBack">
        <wd-icon name="left" custom-class="wd-navbar__arrow" />
      </view>
      <slot name="left" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </wd-navbar>
</template>
