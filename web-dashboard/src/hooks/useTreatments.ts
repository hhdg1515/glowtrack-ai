/**
 * 治疗记录 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { treatmentsApi } from '@/lib/api-client'
import type { Treatment, TreatmentCreate, TreatmentUpdate } from '@/types/api'
import { patientKeys } from './usePatients'

// Query Keys
export const treatmentKeys = {
  all: ['treatments'] as const,
  lists: () => [...treatmentKeys.all, 'list'] as const,
  list: (patientId: string) => [...treatmentKeys.lists(), patientId] as const,
  details: () => [...treatmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...treatmentKeys.details(), id] as const,
}

// ============ Queries ============

/**
 * 获取患者的所有治疗记录
 */
export function usePatientTreatments(patientId: string) {
  return useQuery({
    queryKey: treatmentKeys.list(patientId),
    queryFn: () => treatmentsApi.getPatientTreatments(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}

/**
 * 获取单个治疗记录详情
 */
export function useTreatment(treatmentId: string) {
  return useQuery({
    queryKey: treatmentKeys.detail(treatmentId),
    queryFn: () => treatmentsApi.getTreatment(treatmentId),
    enabled: !!treatmentId,
  })
}

// ============ Mutations ============

/**
 * 创建新治疗记录
 */
export function useCreateTreatment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TreatmentCreate) => treatmentsApi.createTreatment(data),
    onSuccess: (newTreatment) => {
      // 使治疗列表失效
      queryClient.invalidateQueries({
        queryKey: treatmentKeys.list(newTreatment.patient_id),
      })
      // 使患者详情失效（因为 total_treatments 可能改变）
      queryClient.invalidateQueries({
        queryKey: patientKeys.detail(newTreatment.patient_id),
      })
      // 预先填充新治疗的详情缓存
      queryClient.setQueryData(
        treatmentKeys.detail(newTreatment.treatment_id),
        newTreatment
      )
    },
  })
}

/**
 * 更新治疗记录
 */
export function useUpdateTreatment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ treatmentId, data }: { treatmentId: string; data: TreatmentUpdate }) =>
      treatmentsApi.updateTreatment(treatmentId, data),
    onSuccess: (updatedTreatment, variables) => {
      // 更新缓存中的治疗详情
      queryClient.setQueryData(
        treatmentKeys.detail(variables.treatmentId),
        updatedTreatment
      )
      // 使治疗列表失效
      queryClient.invalidateQueries({
        queryKey: treatmentKeys.list(updatedTreatment.patient_id),
      })
    },
  })
}

/**
 * 删除治疗记录
 */
export function useDeleteTreatment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (treatmentId: string) => treatmentsApi.deleteTreatment(treatmentId),
    onSuccess: (_, treatmentId) => {
      // 移除缓存中的治疗详情
      queryClient.removeQueries({ queryKey: treatmentKeys.detail(treatmentId) })
      // 使所有治疗列表失效
      queryClient.invalidateQueries({ queryKey: treatmentKeys.lists() })
      // 使所有患者详情失效
      queryClient.invalidateQueries({ queryKey: patientKeys.details() })
    },
  })
}
