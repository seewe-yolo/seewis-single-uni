import type { IOssInfo } from './types/oss'
import { http } from '@/http/http'
import { getEnvBaseUrl } from '@/utils'

/** OSS 上传接口地址（后端 POST /resource/oss/upload，multipart 字段名 file） */
export const OSS_UPLOAD_URL = `${getEnvBaseUrl()}/resource/oss/upload`

/**
 * 根据 OSS ID 批量查询文件信息（后端 GET /resource/oss/listByIds/{ossIds}，逗号分隔）
 * @returns 文件信息列表（含 url、originalName 等）
 */
export function getOssListByIds(ossIds: Array<string | number>) {
  return http.get<IOssInfo[]>(`/resource/oss/listByIds/${ossIds.join(',')}`)
}
