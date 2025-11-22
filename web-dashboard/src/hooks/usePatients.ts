/**
 * 患者管理 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientsApi } from '@/lib/api-client'
import type { Patient, PatientCreate, PatientUpdate } from '@/types/api'

// Query Keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (clinicId: string) => [...patientKeys.lists(), clinicId] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
}

// ============ Queries ============

/**
 * 获取诊所的所有患者
 */
export function useClinicPatients(clinicId: string, params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: patientKeys.list(clinicId),
    queryFn: () => patientsApi.getClinicPatients(clinicId, params),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}

/**
 * 获取单个患者详情
 */
export function usePatient(patientId: string) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => patientsApi.getPatient(patientId),
    enabled: !!patientId,
  })
}

// ============ Mutations ============

/**
 * 创建新患者
 */
export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PatientCreate) => patientsApi.createPatient(data),
    onSuccess: (newPatient) => {
      // 使所有患者列表失效
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      // 预先填充新患者的详情缓存
      queryClient.setQueryData(patientKeys.detail(newPatient.id), newPatient)
    },
  })
}

/**
 * 更新患者信息
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: PatientUpdate }) =>
      patientsApi.updatePatient(patientId, data),
    onSuccess: (updatedPatient, variables) => {
      // 更新缓存中的患者详情
      queryClient.setQueryData(patientKeys.detail(variables.patientId), updatedPatient)
      // 使患者列表失效
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

/**
 * 删除患者
 */
export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patientId: string) => patientsApi.deletePatient(patientId),
    onSuccess: (_, patientId) => {
      // 移除缓存中的患者详情
      queryClient.removeQueries({ queryKey: patientKeys.detail(patientId) })
      // 使患者列表失效
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}
