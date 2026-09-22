# 请求库

目前 unibest 支持 3 种请求方式：

- 简单版 `http`：路径 `src/http/http.ts`，适合大多数简单项目。
- `alova`：路径 `src/http/alova.ts`。
- `vue-query`：路径 `src/http/vue-query.ts`，主要用于自动生成接口，详情见 https://unibest.tech/base/17-generate 。

## 如何选择

如果您以前用过 `alova` 或 `vue-query`，可以优先使用熟悉的方案。

如果项目接口不复杂，简单版 `http` 就够了，也不会增加额外包体积。

## 关于 http 使用

```ts
import { http } from '@/http/http'

interface IUserInfoRes {
  id: number
  nickname: string
}

export function getUserInfo() {
  return http.get<IUserInfoRes>('/user/info')
}

export function updateUserInfo(data: Partial<IUserInfoRes>) {
  return http.post('/user/update', data)
}
```

响应成功时会返回业务 `data`；业务错误、登录失效、HTTP 状态码异常和网络异常会统一 reject `HttpError`：

```ts
import type { HttpError } from '@/http/types'

try {
  const userInfo = await getUserInfo()
  console.log(userInfo.nickname)
}
catch (error) {
  const httpError = error as HttpError
  console.log(httpError.type, httpError.message, httpError.statusCode)
}
```

## 与 seewis-single-admin 后端对齐

- 受保护接口由拦截器统一注入 `Authorization: Bearer <token>` 和 `clientid`。
- `/auth/login`、`/auth/register` 对应后端 `@ApiEncrypt`，调用时传入 `{ encrypt: true }`，请求体按 AES-ECB-PKCS7 加密，密钥按 RSA 公钥加密后放入 `encrypt-key` 请求头。
- 当前后端已确认提供认证、用户信息和 OSS 接口；物资业务 `/app/material/*` 尚未在后端 Controller 中提供，相关页面仍属于前端示例接口，不能当作已联调契约。

如果调用方需要自行处理错误提示，可以传入 `hideErrorToast: true`：

```ts
http.get<IUserInfoRes>('/user/info', undefined, undefined, {
  hideErrorToast: true,
})
```

## roadmap

菲鸽最近在优化脚手架，后续可以选择是否使用第三方请求库，以及选择具体请求库。
