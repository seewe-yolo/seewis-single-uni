<script lang="ts" setup>
import type { RequisitionOrder } from '@/api/types/material'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePageRefresh } from '@/hooks/usePageRefresh'
import { useScroll } from '@/hooks/useScroll'
import { debounce } from '@/utils/debounce'
import { getRequisitions } from '@/api/material'

definePage({
  style: {
    navigationBarTitleText: '我的领用单',
  },
})

/** 状态筛选 tabs：statuses 为空时表示全部 */
type RequisitionStatus = RequisitionOrder['status']

const STATUS_META: Record<RequisitionStatus, { text: string, tag: 'primary' | 'success' | 'danger' | 'warning' | 'default' }> = {
  draft: { text: '草稿', tag: 'default' },
  approving: { text: '审批中', tag: 'warning' },
  approved: { text: '待出库', tag: 'primary' },
  rejected: { text: '已驳回', tag: 'danger' },
  outbound: { text: '已出库', tag: 'primary' },
  returned: { text: '归还中', tag: 'warning' },
  done: { text: '已完成', tag: 'success' },
}

const FILTER_TABS: { label: string, statuses?: RequisitionStatus[] }[] = [
  { label: '全部' },
  { label: '待审批', statuses: ['approving'] },
  { label: '待出库', statuses: ['approved'] },
  { label: '已出库', statuses: ['outbound'] },
  { label: '归还中', statuses: ['returned'] },
  { label: '已完成', statuses: ['done'] },
  { label: '已驳回', statuses: ['rejected'] },
]
const activeTab = ref(0)
const keyword = ref('')

/** mock 分页查询：按 tab 状态与关键字过滤后分页返回（后端接口定稿后替换） */
async function fetchOrders(page: number, pageSize: number): Promise<RequisitionOrder[]> {
  const statuses = FILTER_TABS[activeTab.value].statuses
  const result = await getRequisitions({ pageNum: page, pageSize, status: statuses?.[0], title: keyword.value.trim() || undefined })
  return result.rows
}

const { list, loading, finished, refresh, loadMore } = useScroll<RequisitionOrder>({ fetchData: fetchOrders })

/** 首次查询完成后才展示空态，避免加载中闪空 */
const ready = computed(() => list.value.length > 0 || finished.value)

watch(activeTab, () => refresh())
const debouncedRequery = debounce(() => refresh(), 300)
watch(keyword, debouncedRequery)

/** 全局滚动区触底 → 加载下一页（App.ku.vue 广播 app:scrolltolower） */
onMounted(() => {
  uni.$on('app:scrolltolower', loadMore)
})
onUnmounted(() => {
  uni.$off('app:scrolltolower', loadMore)
})

/** 下拉刷新（App.ku.vue 全局滚动区） */
usePageRefresh(() => refresh())

function goDetail(order: RequisitionOrder) {
  uni.navigateTo({ url: `/pages-material/requisition/detail/index?id=${order.requisitionId}` })
}

function summary(order: RequisitionOrder) {
  const first = order.items[0]
  return order.items.length > 1 ? `${first.materialName ?? '物资'} 等 ${order.items.length} 种物资` : `${first.materialName ?? '物资'} × ${first.quantity}${first.unit ?? ''}`
}
</script>

<template>
  <view class="page-material-requisition-list min-h-screen bg-#f2f3f5 px-4 pb-[140px]">
    <wd-tabs v-model="activeTab">
      <wd-tab v-for="tab in FILTER_TABS" :key="tab.label" :title="tab.label" />
    </wd-tabs>

    <view class="mt-2">
      <wd-search v-model="keyword" placeholder="搜索单号 / 物资名称" />
    </view>

    <view v-if="list.length" class="mt-3 flex flex-col gap-3">
      <view
        v-for="order in list"
        :key="order.requisitionId"
        class="rounded-lg bg-white p-4 active:bg-#fafafa"
        @click="goDetail(order)"
      >
        <view class="flex items-center justify-between">
          <text class="text-3 text-#4e5969 font-medium">{{ order.requisitionNo }}</text>
          <wd-tag :type="STATUS_META[order.status].tag">
            {{ STATUS_META[order.status].text }}
          </wd-tag>
        </view>
        <text class="mt-3 block text-4 text-#1d2129 font-medium">{{ summary(order) }}</text>
        <text class="mt-1 block text-3 text-#86909c">{{ order.title }}</text>
        <view class="mt-3 flex items-center justify-between border-t border-#f2f3f5 border-solid pt-3">
          <text class="text-3 text-#86909c">{{ order.createTime ?? '' }}</text>
          <text class="i-carbon-chevron-right text-3 text-#c9cdd4" />
        </view>
      </view>

      <wd-loadmore :state="loading ? 'loading' : 'finished'" finished-text="没有更多了" />
    </view>

    <wd-empty v-else-if="ready" class="mt-20" description="暂无符合条件的领用单" />
  </view>
</template>

<style lang="scss" scoped>
</style>
