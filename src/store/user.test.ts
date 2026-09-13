import { describe, expect, it } from 'vitest'
import { useUserStore } from './user'

describe('useUserStore', () => {
  it('初始状态：userId 为 -1，username 为空，avatar 为默认头像', () => {
    const store = useUserStore()
    expect(store.userInfo.userId).toBe(-1)
    expect(store.userInfo.username).toBe('')
    expect(store.userInfo.nickname).toBe('')
    expect(store.userInfo.avatar).toBe('/static/images/default-avatar.png')
  })

  it('setUserInfo：正确更新用户信息', () => {
    const store = useUserStore()
    store.setUserInfo({
      userId: 1,
      username: 'testuser',
      nickname: 'Test',
      avatar: 'https://example.com/avatar.png',
    })
    expect(store.userInfo.userId).toBe(1)
    expect(store.userInfo.username).toBe('testuser')
    expect(store.userInfo.avatar).toBe('https://example.com/avatar.png')
  })

  it('setUserInfo：avatar 为空字符串时使用默认头像', () => {
    const store = useUserStore()
    store.setUserInfo({
      userId: 2,
      username: 'user2',
      nickname: 'User2',
      avatar: '',
    })
    expect(store.userInfo.avatar).toBe('/static/images/default-avatar.png')
  })

  it('setUserAvatar：正确更新头像', () => {
    const store = useUserStore()
    store.setUserAvatar('https://example.com/new-avatar.png')
    expect(store.userInfo.avatar).toBe('https://example.com/new-avatar.png')
  })

  it('clearUserInfo：重置为初始状态并调用 uni.removeStorageSync', () => {
    const store = useUserStore()
    store.setUserInfo({ userId: 1, username: 'u', nickname: 'U', avatar: 'a' })

    store.clearUserInfo()

    expect(store.userInfo.userId).toBe(-1)
    expect(store.userInfo.username).toBe('')
    expect(uni.removeStorageSync).toHaveBeenCalledWith('user')
  })
})
