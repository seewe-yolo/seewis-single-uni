import { t } from '@/locale'
import { isCurrentPageTabbar } from '@/utils'
import { isNativeTabbar, tabbarList } from './config'

// h5 中一直可以生效，小程序里面默认是无法动态切换的，这里借助vue模板自带响应式的方式
// 直接替换 %xxx% 为 t('xxx')即可
export function getI18nText(key: string) {
  // %xxx% 视为多语言 key 查表，否则原样展示（兼容直接传纯文本）
  const match = key.match(/%(.+?)%/)
  return match ? t(match[1]) : key
}

export function setTabbarItem() {
// 只有使用原生Tabbar才需要 setTabBarItem
// 而且只有当前页是tabbar页才能设置
  if (isNativeTabbar && isCurrentPageTabbar()) {
    tabbarList.forEach((item, index) => {
      uni.setTabBarItem({
        index,
        text: getI18nText(item.text),
      })
    })
  }
}
