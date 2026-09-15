<script lang="ts" setup>
import type { RequisitionOrder } from '../../mock'
import { ref } from 'vue'
import { useToast } from '@wot-ui/ui'
import dayjs from 'dayjs'
import { useConfirmDialog } from '@/utils/dialog'
import { ORDERS, REQUISITION_STATUS } from '../../mock'
import MaterialBottomBar from '../../components/MaterialBottomBar.vue'

definePage({
  style: {
    navigationBarTitleText: '签收确认',
  },
})

const toast = useToast()
const confirmDialog = useConfirmDialog()

const order = ref<RequisitionOrder | null>(null)

onLoad((options) => {
  // mock：后端接口定稿后改为 getRequisitionOrder(id)
  const id = options?.id ?? ''
  order.value = ORDERS.find(o => o.id === id && o.status === 'outbound') ?? null
})

const submitting = ref(false)

/** mock：模拟签收；后端定稿后改为 signRequisition(id) */
async function handleSubmit() {
  if (!await confirmDialog('请核对实物与出库单一致后再签收，签收后进入使用中状态。'))
    return
  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  submitting.value = false
  if (order.value)
    Object.assign(order.value, { status: 'signed', signTime: dayjs().format('YYYY-MM-DD HH:mm') })
  toast.success('签收成功')
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<template>
  <view class="page-material-requisition-sign min-h-screen bg-#f2f3f5 px-4 pb-[140px] pt-3">
    <template v-if="order">
      <wd-notice-bar text="请当面清点物资数量与外观，确认无误后再签收" />

      <!-- 出库信息 -->
      <view class="mt-3 rounded-lg bg-white p-4">
        <view class="flex items-center justify-between">
          <text class="text-3 text-#4e5969 font-medium">{{ order.code }}</text>
          <wd-tag :type="REQUISITION_STATUS[order.status].tag">
            {{ REQUISITION_STATUS[order.status].text }}
          </wd-tag>
        </view>
        <text class="mt-3 block text-4 text-#1d2129">{{ order.purpose }}</text>
        <wd-cell-group border custom-class="mt-3">
          <wd-cell title="领用人" :value="order.applicant" />
          <wd-cell title="出库人" :value="order.outboundBy ?? ''" />
          <wd-cell title="出库时间" :value="order.outboundTime ?? ''" />
          <wd-cell title="预计归还" :value="order.expectReturnDate || '未填写'" />
        </wd-cell-group>
      </view>

      <!-- 物资清单 -->
      <view class="mt-3 rounded-lg bg-white p-4">
        <text class="text-4 text-#1d2129 font-medium">物资清单</text>
        <view class="mt-1">
          <view
            v-for="(line, index) in order.lines"
            :key="line.materialId"
            class="flex items-center justify-between py-3"
            :class="index > 0 ? 'border-t border-solid border-#f2f3f5' : ''"
          >
            <view>
              <text class="block text-4 text-#1d2129">{{ line.name }}</text>
              <text class="mt-1 block text-3 text-#86909c">{{ line.spec }}</text>
            </view>
            <text class="text-4 text-#1d2129 font-medium">× {{ line.quantity }}{{ line.unit }}</text>
          </view>
        </view>
      </view>

      <MaterialBottomBar>
        <wd-button
          block
          type="primary"
          :loading="submitting"
          :disabled="submitting"
          @click="handleSubmit"
        >
          确认签收
        </wd-button>
      </MaterialBottomBar>
    </template>

    <wd-empty v-else class="mt-20" description="未找到待签收的领用单" />
  </view>
</template>

<style lang="scss" scoped>
</style>
