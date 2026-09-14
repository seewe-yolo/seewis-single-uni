import type { IOssUploadRes } from '@/api/types/oss'
import { OSS_UPLOAD_URL } from '@/api/oss'
import { useFileUpload } from '@/utils/uploadFile'

/**
 * 上传文件到 OSS：基于通用上传钩子（@/utils/uploadFile）的 Promise 化业务封装
 * Authorization 由全局 uploadFile 拦截器自动注入；登录态失效 / 业务失败的提示与兜底由钩子内部处理
 *
 * @param filePath 本地临时文件路径（uni.chooseMedia/chooseImage 或拍照所得）
 * @param options.onProgress 上传进度回调（0-100）
 * @returns 上传结果：{ url, fileName, ossId }
 */
export function uploadOssFile(filePath: string, options: { onProgress?: (progress: number) => void } = {}): Promise<IOssUploadRes> {
  return new Promise<IOssUploadRes>((resolve, reject) => {
    const { run } = useFileUpload<IOssUploadRes>(OSS_UPLOAD_URL, filePath, {}, {
      onProgress: options.onProgress,
      onSuccess: res => resolve(res as IOssUploadRes),
      onError: err => reject(err instanceof Error ? err : new Error('上传失败')),
    })
    run()
  })
}
