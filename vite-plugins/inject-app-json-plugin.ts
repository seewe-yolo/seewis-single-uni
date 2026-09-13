import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * 向编译产物 app.json 注入字段。
 * 当前用途：lazyCodeLoading = requiredComponents（按需注入，提升模拟器/真机启动速度）。
 * 原因：本项目使用的 uni 版本不会把 manifest.json 的 mp-weixin.lazyCodeLoading 投影到 app.json，
 * 只能构建后写入；微信基础库 2.11.1+ 支持。
 */
export default function injectAppJsonPlugin() {
  let appJsonPath = ''
  return {
    name: 'fg-inject-app-json',
    configResolved(config: { root: string, build: { outDir: string } }) {
      appJsonPath = path.resolve(config.root, config.build.outDir, 'app.json')
    },
    writeBundle() {
      try {
        if (!appJsonPath || !fs.existsSync(appJsonPath)) {
          return
        }
        const json = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
        let changed = false
        if (json.lazyCodeLoading !== 'requiredComponents') {
          json.lazyCodeLoading = 'requiredComponents'
          changed = true
        }
        if (changed) {
          fs.writeFileSync(appJsonPath, JSON.stringify(json, null, 2))
        }
      }
      catch (error) {
        console.warn('[fg-inject-app-json] app.json 注入失败:', error)
      }
    },
  } as Plugin
}
