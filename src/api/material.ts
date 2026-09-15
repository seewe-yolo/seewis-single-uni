import type { MaterialItem, PageResult, RequisitionOrder } from './types/material'
import { http } from '@/http/http'

export function getMaterials(query?: Record<string, any>) {
  return http.get<PageResult<MaterialItem>>('/app/material/list', query)
}

export function getMaterial(materialId: number) {
  return http.get<MaterialItem>(`/app/material/${materialId}`)
}

export function getMaterialByCode(materialCode: string) {
  return http.get<MaterialItem>(`/app/material/code/${encodeURIComponent(materialCode)}`)
}

export function getRequisitions(query?: Record<string, any>) {
  return http.get<PageResult<RequisitionOrder>>('/app/material/requisition/list', query)
}

export function getRequisition(requisitionId: number) {
  return http.get<RequisitionOrder>(`/app/material/requisition/${requisitionId}`)
}

export function createRequisition(data: { title: string, items: { materialId: number, quantity: number, remark?: string }[], remark?: string }) {
  return http.post<number>('/app/material/requisition', data)
}

export function submitRequisition(requisitionId: number) {
  return http.post<void>(`/app/material/requisition/${requisitionId}/submit`)
}

export function outboundRequisition(requisitionId: number, data: { operationNo?: string, items: { itemId: number, quantity: number }[], remark?: string }) {
  return http.post<void>(`/app/material/requisition/${requisitionId}/outbound`, data)
}

export function signRequisition(requisitionId: number) {
  return http.post<void>(`/app/material/requisition/${requisitionId}/sign`)
}

export function returnRequisition(requisitionId: number, data: { operationNo?: string, items: { itemId: number, quantity: number }[], remark?: string }) {
  return http.post<void>(`/app/material/requisition/${requisitionId}/return`, data)
}
