import { useDialog } from '@wot-ui/ui'
import type { DialogOptions } from '@wot-ui/ui/components/wd-dialog/types'

/**
 * 页面级输入弹窗（wd-dialog prompt 模式的项目统一封装）
 *
 * 使用前提与 useConfirmDialog 相同：页面模板中需声明 <wd-dialog />，且必须在 setup 顶层调用本工厂。
 *
 * @returns 确认返回输入值（可能是空字符串）；取消、关闭返回 null
 */
export function usePromptDialog() {
  const dialog = useDialog()

  return (options: DialogOptions | string): Promise<string | null> => {
    const normalized: DialogOptions = typeof options === 'string'
      ? { title: '提示', msg: options }
      : { title: '提示', ...options }

    return dialog
      .prompt(normalized)
      .then(res => (res.action === 'confirm' ? String(res.value ?? '') : null))
      .catch(() => null)
  }
}

/**
 * 页面级二次确认弹窗（wd-dialog useDialog 的项目统一封装）
 *
 * 使用前提：页面模板中需声明 <wd-dialog />（useDialog 基于 provide/inject，
 * 弹窗 UI 由页面内的 wd-dialog 实例渲染，无法全局声明一次）。
 *
 * @example
 * ```vue
 * <template>
 *   <wd-dialog />
 * </template>
 *
 * <script setup lang="ts">
 * import { useConfirmDialog } from '@/utils/dialog'
 *
 * // 必须在 setup 顶层调用（内部依赖 inject），拿到函数后可在任意事件中使用
 * const confirmDialog = useConfirmDialog()
 *
 * const onDelete = async () => {
 *   if (await confirmDialog('确定删除该物资？')) {
 *     // 执行删除
 *   }
 * }
 * </script>
 * ```
 *
 * @returns 确认返回 true；取消、关闭弹窗或 beforeConfirm 拦截失败返回 false
 */
export function useConfirmDialog() {
  const dialog = useDialog()

  /**
   * @param options 弹窗配置；传字符串时作为消息内容，标题默认"提示"
   */
  return (options: DialogOptions | string): Promise<boolean> => {
    const normalized: DialogOptions = typeof options === 'string'
      ? { title: '提示', msg: options }
      : { title: '提示', ...options }

    return dialog
      .confirm(normalized)
      .then(res => res.action === 'confirm')
      .catch(() => false)
  }
}
