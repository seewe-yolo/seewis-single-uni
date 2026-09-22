import CryptoJS from 'crypto-js'
import { JSEncrypt } from 'jsencrypt'

const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function generateAesPassword() {
  let result = ''
  for (let index = 0; index < 32; index++) {
    result += RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length))
  }
  return result
}

/**
 * 按后端 api-decrypt 约定加密 JSON 请求体：AES-ECB-PKCS7 + RSA 公钥加密 AES 密钥。
 */
export function encryptRequestBody(data: unknown, publicKey: string) {
  if (!publicKey) {
    throw new Error('未配置 VITE_API_ENCRYPT_PUBLIC_KEY')
  }

  const aesPassword = generateAesPassword()
  const aesKey = CryptoJS.enc.Utf8.parse(aesPassword)
  const body = CryptoJS.AES.encrypt(JSON.stringify(data ?? null), aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  }).toString()

  const rsa = new JSEncrypt()
  rsa.setPublicKey(publicKey)
  const encryptedKey = rsa.encrypt(CryptoJS.enc.Base64.stringify(aesKey))
  if (!encryptedKey) {
    throw new Error('RSA 公钥加密 AES 密钥失败')
  }

  return { body, encryptedKey }
}
