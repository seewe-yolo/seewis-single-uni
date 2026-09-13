import { reactive } from 'vue'

/** 全局登录弹窗单例状态：由 App.ku.vue 挂载的 FgLoginPopup 消费 */
const state = reactive({ visible: false })

/**
 * 登录弹窗控制
 * 任意位置调用 open() 唤起全局登录弹窗（wd-action-sheet 实现，无独立登录页）
 */
export function useLoginPopup() {
  const open = () => {
    state.visible = true
  }
  const close = () => {
    state.visible = false
  }
  return { state, open, close }
}
