export interface MaterialItem {
  materialId: number
  materialCode: string
  materialName: string
  category: string
  unit: string
  spec: string
  stockQty: number
  warnQty: number
  cabinetId?: number | null
  location?: string | null
  expiryDate?: string | null
  status: '0' | '1'
  remark?: string | null
}

export interface RequisitionItem {
  itemId: number
  requisitionId: number
  materialId: number
  materialName?: string
  unit?: string
  quantity: number
  outQty: number
  returnQty: number
  remark?: string | null
}

export interface RequisitionOrder {
  requisitionId: number
  requisitionNo: string
  title: string
  applyUserId: number
  applyDeptId?: number | null
  createTime?: string | null
  status: 'draft' | 'approving' | 'approved' | 'rejected' | 'outbound' | 'returned' | 'done'
  auditRemark?: string | null
  remark?: string | null
  items: RequisitionItem[]
}

export interface PageResult<T> {
  total: number
  rows: T[]
}
