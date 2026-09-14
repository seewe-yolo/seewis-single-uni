import { onMounted, onUnmounted, reactive } from 'vue'
import { currRoute } from '@/utils'

/** 页面下拉刷新处理器注册表：key 为路由 path，由 App.ku.vue 的滚动区消费 */
export const pageRefreshState = reactive({
  handlers: new Map<string, () => Promise<void> | void>(),
})

/**
 * 页面下拉刷新注册：
 * 调用后，当前路由在 App.ku.vue 滚动区启用下拉刷新，触发时执行 handler（支持异步），
 * 完成后刷新动画自动收起；路由离开时自动注销
 *
 * 注意：路径必须在 onMounted 后解析——setup（attached）阶段页面的 $page 尚未挂载，
 * 此时调用 currRoute() 会因解构 undefined 报错
 */
export function usePageRefresh(handler: () => Promise<void> | void) {
  let path = ''

  onMounted(() => {
    path = currRoute().path
    pageRefreshState.handlers.set(path, handler)
  })
  onUnmounted(() => {
    if (path) {
      pageRefreshState.handlers.delete(path)
    }
  })
}
