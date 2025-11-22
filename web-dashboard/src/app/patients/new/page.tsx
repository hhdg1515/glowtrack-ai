'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePatient } from '@/hooks/usePatients'
import type { PatientCreate } from '@/types/api'

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

export default function NewPatientPage() {
  const router = useRouter()
  const createMutation = useCreatePatient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      // TODO: 从用户 session 获取 clinic_id
      const patientData: PatientCreate = {
        ...data,
        clinic_id: 'clinic-demo-001',
      }

      const newPatient = await createMutation.mutateAsync(patientData)
      router.push(`/patients/${newPatient.id}`)
    } catch (error) {
      console.error('Failed to create patient:', error)
      alert('创建失败，请重试')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/patients"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">添加新患者</h1>
              <p className="text-gray-600 mt-1">填写患者基本信息</p>
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
                placeholder="张"
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
                placeholder="三"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            {/* 患者编号 */}
            <div>
              <label htmlFor="patient_id" className="block text-sm font-semibold text-gray-700 mb-2">
                患者编号（可选）
              </label>
              <input
                {...register('patient_id')}
                type="text"
                id="patient_id"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="P-001"
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
                placeholder="patient@example.com"
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
                placeholder="138-0000-0000"
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
              href="/patients"
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </Link>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>创建中...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>创建患者</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
