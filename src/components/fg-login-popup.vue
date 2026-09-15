<script lang="ts" setup>
import type { ICaptcha } from '@/api/types/login'
import { ref, watch } from 'vue'
import { useToast } from '@wot-ui/ui'
import { getCode } from '@/api/login'
import { useLoginPopup } from '@/hooks/useLoginPopup'
import { loginByPassword, loginByWechat } from '@/services/auth'

// 品牌名来自环境变量（安储云）
const APP_TITLE = import.meta.env.VITE_APP_TITLE || '安储云'

const { state, close } = useLoginPopup()
// 轻提示（必须在 setup 顶层调用，内部依赖 inject）
const toast = useToast()

/** 登录方式切换（wd-tabs 以 name 回写）：wechat-微信登录 account-账号登录 */
const activeTab = ref<'wechat' | 'account'>('wechat')
const agreed = ref(false)
const loading = ref(false)
const username = ref('')
const password = ref('')
/** 图形验证码（后端关闭验证码时 captchaEnabled=false，不展示输入行） */
const captcha = ref<ICaptcha | null>(null)
const captchaCode = ref('')

/** 拉取图形验证码 */
async function loadCaptcha() {
  try {
    captcha.value = await getCode()
  }
  catch {
    // 失败提示由 http 层统一 toast；提交校验会兜底提示
  }
}

/** 切到账号登录页签时加载验证码 */
watch(activeTab, (tab) => {
  if (tab === 'account' && !captcha.value)
    loadCaptcha()
})

/** 品牌价值点（纯展示） */
const features = [
  { icon: 'i-carbon-scan', label: '扫码作业' },
  { icon: 'i-carbon-document-view', label: '过程留痕' },
  { icon: 'i-carbon-education', label: '安全学习' },
]

/** 登录前统一校验：协议必须勾选 */
function ensureAgreed() {
  if (!agreed.value) {
    toast.show('请先阅读并同意用户协议与隐私政策')
    return false
  }
  return true
}

/** 微信一键登录：获取 code → services/auth 调后端换取 token */
async function handleWxLogin() {
  if (!ensureAgreed())
    return
  loading.value = true
  try {
    await loginByWechat()
    toast.success('登录成功')
    close()
  }
  catch {
    // 失败提示由 http 层统一 toast，保持弹窗打开便于重试
  }
  finally {
    loading.value = false
  }
}

/** 账号密码登录：校验非空 → services/auth 走 password 授权类型 */
async function handleAccountLogin() {
  if (!ensureAgreed())
    return
  if (!username.value.trim()) {
    toast.show('请输入账号')
    return
  }
  if (!password.value) {
    toast.show('请输入密码')
    return
  }
  if (captcha.value?.captchaEnabled && !captchaCode.value.trim()) {
    toast.show('请输入验证码')
    return
  }
  loading.value = true
  try {
    await loginByPassword({
      username: username.value.trim(),
      password: password.value,
      code: captcha.value?.captchaEnabled ? captchaCode.value.trim() : undefined,
      uuid: captcha.value?.captchaEnabled ? captcha.value.uuid : undefined,
    })
    toast.success('登录成功')
    close()
  }
  catch {
    // 失败提示由 http 层统一 toast；验证码一次性有效，失败后换新再重试
    captchaCode.value = ''
    if (captcha.value?.captchaEnabled)
      loadCaptcha()
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <wd-toast />
  <wd-action-sheet v-model="state.visible" :close-on-click-modal="!loading" :z-index="2000" @close="close">
    <!-- 右上角关闭按钮：登录请求进行中不允许关闭 -->
    <template #close="{ close: onClose }">
      <wd-icon custom-class="wd-action-sheet__close" name="close" @click="!loading && onClose()" />
    </template>
    <view class="login-sheet" style="padding-bottom: calc(env(safe-area-inset-bottom) + 36rpx);">
      <text class="login-watermark" aria-hidden="true">储</text>
      <view class="login-handle" />

      <view class="login-toolbar">
        <view class="login-mark">
          <text class="i-carbon-security text-38rpx text-white" />
        </view>
        <view class="login-brand">
          <text class="login-eyebrow">安全应急物资平台</text>
          <text class="login-brand-name">{{ APP_TITLE }}</text>
        </view>
      </view>

      <view class="login-copy">
        <text class="login-title">登录后继续使用平台功能</text>
        <text class="login-subtitle">扫码、领用、应急调用与安全学习，一次登录即可使用</text>
      </view>

      <view class="login-trust-list">
        <view
          v-for="(item, index) in features"
          :key="item.label"
          class="login-trust-item"
          :class="{ 'login-trust-item-last': index === features.length - 1 }"
        >
          <text :class="item.icon" class="login-trust-icon" />
          <text>{{ item.label }}</text>
        </view>
      </view>

      <!-- 登录方式切换：微信一键登录 / 账号密码登录 -->
      <view class="login-tabs">
        <wd-tabs v-model="activeTab" color="#165DFF">
          <wd-tab title="微信登录" name="wechat" />
          <wd-tab title="账号登录" name="account" />
        </wd-tabs>
      </view>

      <!-- 微信一键登录 -->
      <view v-if="activeTab === 'wechat'" class="login-actions">
        <wd-button
          block
          :loading="loading"
          :disabled="loading"
          custom-style="height:96rpx;border:none;border-radius:24rpx;background:#165DFF;color:#ffffff;font-size:30rpx;font-weight:600;box-shadow:0 12rpx 28rpx rgba(22,93,255,0.22);"
          @click="handleWxLogin"
        >
          <view class="login-submit-content">
            <text class="login-submit-icon i-carbon-logo-wechat" />
            <!-- #ifdef MP-WEIXIN -->
            <text>微信一键登录</text>
            <!-- #endif -->
            <!-- #ifndef MP-WEIXIN -->
            <text>一键登录</text>
            <!-- #endif -->
          </view>
        </wd-button>
      </view>

      <!-- 账号密码登录 -->
      <view v-else class="login-actions">
        <view class="login-field">
          <text class="login-field-icon i-carbon-user-avatar" />
          <wd-input
            v-model="username"
            placeholder="请输入账号"
            custom-style="flex:1;background:transparent;"
            :clearable="true"
          />
        </view>
        <view class="login-field login-field-password">
          <text class="login-field-icon i-carbon-locked" />
          <wd-input
            v-model="password"
            placeholder="请输入密码"
            custom-style="flex:1;background:transparent;"
            :show-password="true"
          />
        </view>
        <view v-if="captcha?.captchaEnabled" class="login-field login-field-captcha">
          <text class="login-field-icon i-carbon-password" />
          <wd-input
            v-model="captchaCode"
            placeholder="请输入验证码"
            custom-style="flex:1;background:transparent;"
            :clearable="true"
          />
          <image
            v-if="captcha?.img"
            class="h-64rpx w-176rpx flex-none rounded-8rpx bg-#f2f3f5"
            :src="`data:image/gif;base64,${captcha.img}`"
            mode="aspectFill"
            @click="loadCaptcha"
          />
        </view>
        <wd-button
          block
          :loading="loading"
          :disabled="loading"
          custom-style="height:96rpx;border:none;border-radius:24rpx;background:#165DFF;color:#ffffff;font-size:30rpx;font-weight:600;box-shadow:0 12rpx 28rpx rgba(22,93,255,0.22);margin-top:28rpx;"
          @click="handleAccountLogin"
        >
          登录
        </wd-button>
      </view>

      <view class="login-consent" @click="agreed = !agreed">
        <view class="login-checkbox" :class="{ 'login-checkbox-checked': agreed }">
          <text v-if="agreed" class="i-carbon-checkmark text-20rpx text-white" />
        </view>
        <text class="login-consent-text">
          我已阅读并同意<text class="login-consent-link">《用户协议》</text>和<text class="login-consent-link">《隐私政策》</text>
        </text>
      </view>

      <wd-button
        block
        variant="text"
        type="info"
        :disabled="loading"
        custom-style="height:72rpx;margin-top:12rpx;color:#8a8883;font-size:26rpx;"
        @click="close"
      >
        暂不登录
      </wd-button>
    </view>
  </wd-action-sheet>
</template>

<style lang="scss" scoped>
.login-sheet {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 16rpx 40rpx 0;
  color: #1d2129;
  background: #f2f3f5;
}

.login-sheet > view {
  position: relative;
  z-index: 1;
}

.login-watermark {
  position: absolute;
  z-index: 0;
  top: 42rpx;
  right: -72rpx;
  color: #165dff;
  font-size: 520rpx;
  font-weight: 800;
  line-height: 0.9;
  letter-spacing: -42rpx;
  opacity: 0.055;
  pointer-events: none;
  transform: rotate(-7deg);
}

.login-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto;
  border-radius: 999rpx;
  background: #d9d5ce;
}

.login-toolbar {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
}

.login-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 18rpx;
  background: #165dff;
  box-shadow: 0 8rpx 20rpx rgb(22 93 255 / 18%);
}

.login-brand {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 18rpx;
}

.login-eyebrow {
  color: #165dff;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.login-brand-name {
  margin-top: 4rpx;
  color: #292827;
  font-size: 30rpx;
  font-weight: 700;
}

.login-copy {
  margin-top: 36rpx;
}

.login-title {
  display: block;
  color: #292827;
  font-size: 46rpx;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 1rpx;
}

.login-subtitle {
  display: block;
  margin-top: 14rpx;
  color: #4e5969;
  font-size: 25rpx;
  line-height: 1.65;
}

.login-trust-list {
  display: flex;
  margin-top: 30rpx;
  padding: 22rpx 0;
  border-top: 1rpx solid #f2f3f5;
  border-bottom: 1rpx solid #f2f3f5;
}

.login-trust-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  color: #4e5969;
  font-size: 22rpx;
  line-height: 1.4;
  border-right: 1rpx solid #f2f3f5;
}

.login-trust-item-last {
  border-right: 0;
}

.login-trust-icon {
  margin-bottom: 8rpx;
  color: #165dff;
  font-size: 30rpx;
}

.login-tabs {
  margin-top: 32rpx;
}

.login-actions {
  margin-top: 32rpx;
}

.login-field {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 6rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
}

.login-field-password {
  margin-top: 24rpx;
}

.login-field-captcha {
  margin-top: 24rpx;
}

.login-field-icon {
  flex: none;
  color: #86909c;
  font-size: 34rpx;
}

.login-submit-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-submit-icon {
  margin-right: 12rpx;
  font-size: 36rpx;
}

.login-consent {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 28rpx;
}

.login-checkbox {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 34rpx;
  height: 34rpx;
  border: 2rpx solid #c9c5be;
  border-radius: 50%;
  background: #ffffff;
}

.login-checkbox-checked {
  border-color: #165dff;
  background: #165dff;
}

.login-consent-text {
  flex: 0 1 auto;
  max-width: 520rpx;
  margin-left: 12rpx;
  color: #4e5969;
  font-size: 22rpx;
  line-height: 1.7;
}

.login-consent-link {
  color: #165dff;
  font-weight: 600;
}
</style>
