import { useLoginPopup } from '@/hooks/useLoginPopup'
import { debounce } from '@/utils/debounce'

/**
 * 唤起全局登录弹窗（原登录页已移除，登录统一由 wd-action-sheet 弹窗承载），带防抖处理
 *
 * 如果要立即唤起，可以使用 `openLoginPopup.flush()` 方法
 */
export const openLoginPopup = debounce(() => {
  useLoginPopup().open()
}, 500)
