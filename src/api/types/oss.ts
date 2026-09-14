/**
 * OSS 对象存储上传返回（后端 SysOssUploadVo record）
 */
export interface IOssUploadRes {
  /** 文件访问地址 */
  url: string
  /** 原始文件名 */
  fileName: string
  /** OSS 对象 ID（字符串形式的雪花 ID） */
  ossId: string
}

/**
 * OSS 对象存储信息（后端 SysOssVo，按需取用）
 */
export interface IOssInfo {
  ossId: number
  fileName: string
  originalName: string
  fileSuffix: string
  url: string
  [key: string]: any
}
