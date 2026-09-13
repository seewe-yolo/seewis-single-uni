<script lang="ts" setup>
import { ref } from 'vue'
import { useToast } from '@wot-ui/ui'
import { useLoginPopup } from '@/hooks/useLoginPopup'
import { loginByWechat } from '@/services/auth'

// 品牌名来自环境变量（安储云）
const APP_TITLE = import.meta.env.VITE_APP_TITLE || '安储云'

const { state, close } = useLoginPopup()
// 轻提示（必须在 setup 顶层调用，内部依赖 inject）
const toast = useToast()

const agreed = ref(false)
const loading = ref(false)

/** 品牌价值点（纯展示） */
const features = [
  { icon: 'i-carbon-scan', label: '扫码作业' },
  { icon: 'i-carbon-document-view', label: '过程留痕' },
  { icon: 'i-carbon-education', label: '安全学习' },
]

/** 微信一键登录：获取 code → services/auth 调后端换取 token */
async function handleWxLogin() {
  if (!agreed.value) {
    toast.show('请先阅读并同意用户协议与隐私政策')
    return
  }
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

      <view class="login-actions">
        <wd-button
          block
          :loading="loading"
          :disabled="loading"
          custom-style="height:96rpx;border:none;border-radius:24rpx;background:#9f1d24;color:#ffffff;font-size:30rpx;font-weight:600;box-shadow:0 12rpx 28rpx rgba(159,29,36,0.2);"
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
    </view>
  </wd-action-sheet>
</template>

<style lang="scss" scoped>
.login-sheet {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 16rpx 40rpx 0;
  color: #292827;
  background: #f6f4f1;
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
  color: #9f1d24;
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
  background: #9f1d24;
  box-shadow: 0 8rpx 20rpx rgb(159 29 36 / 18%);
}

.login-brand {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 18rpx;
}

.login-eyebrow {
  color: #9f1d24;
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
  color: #77736d;
  font-size: 25rpx;
  line-height: 1.65;
}

.login-trust-list {
  display: flex;
  margin-top: 30rpx;
  padding: 22rpx 0;
  border-top: 1rpx solid #e5dfd8;
  border-bottom: 1rpx solid #e5dfd8;
}

.login-trust-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  color: #77736d;
  font-size: 22rpx;
  line-height: 1.4;
  border-right: 1rpx solid #eeeae4;
}

.login-trust-item-last {
  border-right: 0;
}

.login-trust-icon {
  margin-bottom: 8rpx;
  color: #9f1d24;
  font-size: 30rpx;
}

.login-actions {
  margin-top: 32rpx;
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
  border-color: #9f1d24;
  background: #9f1d24;
}

.login-consent-text {
  flex: 0 1 auto;
  max-width: 520rpx;
  margin-left: 12rpx;
  color: #77736d;
  font-size: 22rpx;
  line-height: 1.7;
}

.login-consent-link {
  color: #9f1d24;
  font-weight: 600;
}
</style>
