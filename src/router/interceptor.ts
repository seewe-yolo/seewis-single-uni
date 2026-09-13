import { isMp } from '@uni-helper/uni-env'
/**
 * by 菲鸽 on 2025-08-19
 * 路由拦截，通常也是登录拦截
 * 黑、白名单的配置，请看 config.ts 文件， EXCLUDE_LOGIN_PATH_LIST
 * 登录页已移除：未登录时不再跳转登录页，而是唤起全局登录弹窗（toLoginPage）
 */
import { useTokenStore } from '@/store/token'
import { tabbarStore } from '@/tabbar/store'
import { getAllPages, getLastPage, parseUrlToObj } from '@/utils/index'
import { toLoginPage } from '@/utils/toLoginPage'
import { EXCLUDE_LOGIN_PATH_LIST, isNeedLoginMode } from './config'

export const FG_LOG_ENABLE = false

export function judgeIsExcludePath(path: string) {
  const isDev = import.meta.env.DEV
  if (!isDev) {
    return EXCLUDE_LOGIN_PATH_LIST.includes(path)
  }
  const allExcludeLoginPages = getAllPages('excludeLoginPath') // dev 环境下，需要每次都重新获取，否则新配置就不会生效
  return EXCLUDE_LOGIN_PATH_LIST.includes(path) || (isDev && allExcludeLoginPages.some(page => page.path === path))
}

export const navigateToInterceptor = {
  // 注意，这里的url是 '/' 开头的，如 '/pages/work/index'，跟 'pages.json' 里面的 path 不同
  // 增加对相对路径的处理，BY 网友 @ideal
  invoke({ url, query }: { url: string, query?: Record<string, string> }) {
    if (url === undefined) {
      return
    }
    let { path, query: _query } = parseUrlToObj(url)

    FG_LOG_ENABLE && console.log('\n\n路由拦截器:-------------------------------------')
    FG_LOG_ENABLE && console.log('路由拦截器 1: url->', url, ', query ->', query)
    const myQuery = { ..._query, ...query }
    // /pages/route-interceptor/index?name=feige&age=30
    FG_LOG_ENABLE && console.log('路由拦截器 2: path->', path, ', _query ->', _query)
    FG_LOG_ENABLE && console.log('路由拦截器 3: myQuery ->', myQuery)

    // 处理相对路径
    if (!path.startsWith('/')) {
      const currentPath = getLastPage()?.route || ''
      const normalizedCurrentPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`
      const baseDir = normalizedCurrentPath.substring(0, normalizedCurrentPath.lastIndexOf('/'))
      path = `${baseDir}/${path}`
    }

    // // 处理路由不存在的情况
    // if (path !== '/' && !getAllPages().some(page => page.path === path)) {
    //   console.warn('路由不存在:', path)
    //   return false // 明确表示阻止原路由继续执行
    // }

    // // 插件页面
    // if (url.startsWith('plugin://')) {
    //   FG_LOG_ENABLE && console.log('路由拦截器 4: plugin:// 路径 ==>', url)
    //   path = url
    // }

    // 处理直接进入路由非首页时，tabbarIndex 不正确的问题
    tabbarStore.setAutoCurIdx(path)

    // 小程序使用弹窗式登录（无登录页），路由不做登录拦截，由业务操作 / 401 响应唤起登录弹窗
    if (isMp) {
      return true // 明确表示允许路由继续执行
    }

    const tokenStore = useTokenStore()

    // 已登录直接放行
    if (tokenStore.hasLogin) {
      return true // 明确表示允许路由继续执行
    }

    // #region 1/2 默认需要登录的情况(白名单策略) ---------------------------
    if (isNeedLoginMode) {
      // 需要登录里面的 EXCLUDE_LOGIN_PATH_LIST 表示白名单，可以直接通过
      if (judgeIsExcludePath(path)) {
        return true // 明确表示允许路由继续执行
      }
      // 否则需要登录：唤起全局登录弹窗并阻止本次路由
      else {
        toLoginPage()
        return false // 明确表示阻止原路由继续执行
      }
    }
    // #endregion 1/2 默认需要登录的情况(白名单策略) ---------------------------

    // #region 2/2 默认不需要登录的情况(黑名单策略) ---------------------------
    else {
      // 不需要登录里面的 EXCLUDE_LOGIN_PATH_LIST 表示黑名单，需要登录
      if (judgeIsExcludePath(path)) {
        toLoginPage()
        return false // 明确表示阻止原路由继续执行
      }
      return true // 明确表示允许路由继续执行
    }
    // #endregion 2/2 默认不需要登录的情况(黑名单策略) ---------------------------
  },
}

// 针对 chooseLocation 的特殊处理
export const chooseLocationInterceptor = {
  invoke(options: any) {
    // 直接放行 chooseLocation 调用
    FG_LOG_ENABLE && console.log('chooseLocation 调用，直接放行:', options)
    return true
  },
}

export const routeInterceptor = {
  install() {
    uni.addInterceptor('navigateTo', navigateToInterceptor)
    uni.addInterceptor('reLaunch', navigateToInterceptor)
    uni.addInterceptor('redirectTo', navigateToInterceptor)
    uni.addInterceptor('switchTab', navigateToInterceptor)

    // 添加 chooseLocation 的拦截器，确保直接放行
    uni.addInterceptor('chooseLocation', chooseLocationInterceptor)
  },
}
