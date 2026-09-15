<script lang="ts" setup>
import type { RequisitionOrder } from '../../mock'
import { ref } from 'vue'
import { useToast } from '@wot-ui/ui'
import { useConfirmDialog } from '@/utils/dialog'
import { ORDERS, REQUISITION_STATUS } from '../../mock'
import MaterialBottomBar from '../../components/MaterialBottomBar.vue'
import MaterialPhotoPicker from '../../components/MaterialPhotoPicker.vue'

definePage({
  style: {
    navigationBarTitleText: '归还验收',
  },
})

const toast = useToast()
const confirmDialog = useConfirmDialog()

const order = ref<RequisitionOrder | null>(null)

/** 验收行：实收数量与外观检查 */
interface InspectLine {
  materialId: string
  name: string
  spec: string
  unit: string
  returnQty: number
  receivedQty: number
  /** ok-完好 damaged-破损 */
  condition: 'ok' | 'damaged'
  remark: string
}
const lines = ref<InspectLine[]>([])
const remark = ref('')
const photoPickerRef = ref<InstanceType<typeof MaterialPhotoPicker>>()

onLoad((options) => {
  // mock：后端接口定稿后改为 getRequisitionOrder(id)
  const id = options?.id ?? ''
  const found = ORDERS.find(o => o.id === id && o.status === 'returning')
  if (found) {
    order.value = found
    lines.value = found.lines.map(line => ({
      materialId: line.materialId,
      name: line.name,
      spec: line.spec,
      unit: line.unit,
      returnQty: line.quantity,
      receivedQty: line.quantity,
      condition: 'ok',
      remark: '',
    }))
  }
})

const CONDITION_OPTIONS = [
  { label: '完好', value: 'ok' },
  { label: '破损', value: 'damaged' },
]

const submitting = ref(false)

/** mock：模拟验收通过；后端定稿后改为 inspectReturn(id, lines, remark, photos) */
async function handleSubmit() {
  if (lines.value.some(line => line.condition === 'damaged' && !line.remark.trim())) {
    toast.show('破损物资请逐项填写情况说明')
    return
  }
  if (!await confirmDialog('验收通过后库存自动回补，确认提交验收结果吗？'))
    return
  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 500))
  submitting.value = false
  if (order.value)
    Object.assign(order.value, { status: 'returned' })
  toast.success('验收完成，单据已关闭')
  setTimeout(() => uni.navigateBack(), 800)
}
</script>

<template>
  <view class="page-material-requisition-inspect min-h-screen bg-#f2f3f5 px-4 pb-[140px] pt-3">
    <template v-if="order">
      <!-- 单据信息 -->
      <view class="rounded-lg bg-white p-4">
        <view class="flex items-center justify-between">
          <text class="text-3 text-#4e5969 font-medium">{{ order.code }}</text>
          <wd-tag :type="REQUISITION_STATUS[order.status].tag">
            {{ REQUISITION_STATUS[order.status].text }}
          </wd-tag>
        </view>
        <wd-cell-group border custom-class="mt-3">
          <wd-cell title="领用人" :value="order.applicant" />
          <wd-cell title="归还登记时间" :value="order.returnTime ?? ''" />
        </wd-cell-group>
      </view>

      <!-- 验收清单 -->
      <view class="mt-3 rounded-lg bg-white p-4">
        <text class="text-4 text-#1d2129 font-medium">验收清单</text>
        <view class="mt-1">
          <view
            v-for="(line, index) in lines"
            :key="line.materialId"
            class="py-4"
            :class="index > 0 ? 'border-t border-solid border-#f2f3f5' : ''"
          >
            <view class="flex items-start justify-between">
              <view class="flex-1">
                <view class="flex items-center gap-2">
                  <text class="text-4 text-#1d2129">{{ line.name }}</text>
                  <text class="text-2 text-#86909c">{{ line.spec }}</text>
                </view>
                <text class="mt-1 block text-3 text-#86909c">应还 {{ line.returnQty }}{{ line.unit }}</text>
              </view>
              <wd-tag v-if="line.receivedQty < line.returnQty" type="warning" custom-class="!text-2">
                少收 {{ line.returnQty - line.receivedQty }}{{ line.unit }}
              </wd-tag>
            </view>
            <view class="mt-3 flex items-center justify-between gap-3">
              <view class="flex flex-1 items-center gap-2">
                <text class="flex-none text-3 text-#4e5969">实收</text>
                <wd-input-number v-model="line.receivedQty" :min="0" :max="line.returnQty" />
              </view>
            </view>
            <view class="mt-3 flex items-center justify-between gap-3">
              <text class="flex-none text-3 text-#4e5969">外观</text>
              <wd-radio-group v-model="line.condition">
                <wd-radio v-for="option in CONDITION_OPTIONS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </wd-radio>
              </wd-radio-group>
            </view>
            <view v-if="line.condition === 'damaged'" class="mt-3 rounded-lg bg-#f7f8fa px-3 py-2">
              <wd-input v-model="line.remark" placeholder="请说明破损情况" />
            </view>
          </view>
        </view>
      </view>

      <!-- 验收照片与备注 -->
      <view class="mt-3 rounded-lg bg-white p-4">
        <text class="text-4 text-#1d2129 font-medium">验收照片</text>
        <view class="mt-3">
          <MaterialPhotoPicker ref="photoPickerRef" :max="6" />
        </view>
      </view>
      <view class="mt-3 rounded-lg bg-white p-4">
        <text class="text-4 text-#1d2129 font-medium">备注</text>
        <view class="mt-2 rounded-lg bg-#f7f8fa px-3 py-2">
          <wd-textarea
            v-model="remark"
            placeholder="请填写验收备注"
            :maxlength="100"
            :show-word-limit="true"
            auto-height
          />
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
          提交验收结果
        </wd-button>
      </MaterialBottomBar>
    </template>

    <wd-empty v-else class="mt-20" description="未找到待验收的归还单" />
  </view>
</template>

<style lang="scss" scoped>
</style>
