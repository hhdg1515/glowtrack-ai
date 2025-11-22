'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePatient, useUpdatePatient } from '@/hooks/usePatients'
import type { PatientUpdate } from '@/types/api'

// 表单验证 schema
const patientSchema = z.object({
  first_name: z.string().min(1, '请输入名字'),
  last_name: z.string().min(1, '请输入姓氏'),
  email: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  skin_type: z.string().optional(),
  patient_id: z.string().optional(),
  allergies: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

export default function EditPatientPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const { data: patient, isLoading, error } = usePatient(patientId)
  const updateMutation = useUpdatePatient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  })

  // 加载患者数据到表单
  useEffect(() => {
    if (patient) {
      reset({
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        skin_type: patient.skin_type || '',
        patient_id: patient.patient_id || '',
        // Note: allergies 字段在 PatientResponse 中没有，但在创建时有
      })
    }
  }, [patient, reset])

  const onSubmit = async (data: PatientFormData) => {
    try {
      const updateData: PatientUpdate = {
        ...data,
        clinic_id: patient?.clinic_id,
      }

      await updateMutation.mutateAsync({ patientId, data: updateData })
      router.push(`/patients/${patientId}`)
    } catch (error) {
      console.error('Failed to update patient:', error)
      alert('更新失败，请重试')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载患者信息中...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">加载失败</h3>
              <p className="text-red-700 mb-4">
                {(error as any)?.detail || '无法加载患者信息'}
              </p>
              <Link
                href="/patients"
                className="text-red-600 hover:text-red-700 underline"
              >
                返回患者列表
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const fullName = `${patient.first_name} ${patient.last_name}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/patients/${patientId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">编辑患者信息</h1>
              <p className="text-gray-600 mt-1">{fullName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 姓氏 */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                姓氏 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('last_name')}
                type="text"
                id="last_name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            {/* 名字 */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-2">
                名字 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('first_name')}
                type="text"
                id="first_name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            {/* 患者编号 */}
            <div>
              <label htmlFor="patient_id" className="block text-sm font-semibold text-gray-700 mb-2">
                患者编号
              </label>
              <input
                {...register('patient_id')}
                type="text"
                id="patient_id"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* 出生日期 */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-700 mb-2">
                出生日期
              </label>
              <input
                {...register('date_of_birth')}
                type="date"
                id="date_of_birth"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                邮箱
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* 电话 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                电话
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* 肤质 */}
            <div>
              <label htmlFor="skin_type" className="block text-sm font-semibold text-gray-700 mb-2">
                肤质类型
              </label>
              <select
                {...register('skin_type')}
                id="skin_type"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">请选择</option>
                <option value="干性">干性</option>
                <option value="油性">油性</option>
                <option value="混合性">混合性</option>
                <option value="敏感性">敏感性</option>
                <option value="中性">中性</option>
              </select>
            </div>

            {/* 过敏史 */}
            <div className="md:col-span-2">
              <label htmlFor="allergies" className="block text-sm font-semibold text-gray-700 mb-2">
                过敏史
              </label>
              <textarea
                {...register('allergies')}
                id="allergies"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="请输入已知的过敏信息..."
              />
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="mt-8 flex items-center justify-end space-x-4">
            <Link
              href={`/patients/${patientId}`}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </Link>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>保存更改</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
