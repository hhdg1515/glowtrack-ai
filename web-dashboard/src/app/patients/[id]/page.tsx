'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Plus,
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react'
import { usePatient, useDeletePatient } from '@/hooks/usePatients'
import { usePatientTreatments } from '@/hooks/useTreatments'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 获取患者数据
  const { data: patient, isLoading, error } = usePatient(patientId)

  // 获取治疗记录
  const { data: treatmentsData } = usePatientTreatments(patientId)
  const treatments = treatmentsData?.treatments || []

  // 删除患者
  const deleteMutation = useDeletePatient()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(patientId)
      router.push('/patients')
    } catch (error) {
      console.error('Failed to delete patient:', error)
      alert('删除失败，请重试')
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
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/patients"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
                {patient.patient_id && (
                  <p className="text-gray-600 mt-1">患者编号: {patient.patient_id}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href={`/patients/${patientId}/edit`}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>编辑</span>
              </Link>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：患者信息 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 基本信息卡片 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {patient.first_name[0]}
                  {patient.last_name[0]}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">姓名</label>
                  <p className="text-gray-900 mt-1">{fullName}</p>
                </div>

                {patient.email && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>邮箱</span>
                    </label>
                    <p className="text-gray-900 mt-1">{patient.email}</p>
                  </div>
                )}

                {patient.phone && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>电话</span>
                    </label>
                    <p className="text-gray-900 mt-1">{patient.phone}</p>
                  </div>
                )}

                {patient.date_of_birth && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>出生日期</span>
                    </label>
                    <p className="text-gray-900 mt-1">{patient.date_of_birth}</p>
                  </div>
                )}

                {patient.skin_type && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">肤质</label>
                    <p className="text-gray-900 mt-1">{patient.skin_type}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary-600" />
                <span>统计信息</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <span className="text-gray-700">治疗次数</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {patient.total_treatments}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：治疗历史 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 治疗历史和上传分析 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <span>治疗历史</span>
                </h2>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/upload?patient_id=${patientId}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>上传分析</span>
                  </Link>
                  <Link
                    href={`/upload?patient_id=${patientId}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>新建治疗</span>
                  </Link>
                </div>
              </div>

              {treatments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    还没有治疗记录
                  </h3>
                  <p className="text-gray-600 mb-6">
                    点击上方按钮开始添加第一条治疗记录
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {treatments.map((treatment) => (
                    <TreatmentCard key={treatment.treatment_id} treatment={treatment} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除患者 <span className="font-semibold">{fullName}</span> 吗？
              此操作无法撤销，所有相关的治疗记录也会被删除。
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={deleteMutation.isPending}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>删除中...</span>
                  </span>
                ) : (
                  '确认删除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 治疗记录卡片组件
function TreatmentCard({ treatment }: { treatment: any }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-semibold text-gray-900">{treatment.treatment_type}</h4>
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
              {treatment.treatment_area}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <Calendar className="w-4 h-4 inline mr-2" />
              {format(new Date(treatment.treatment_date), 'PPP', { locale: zhCN })}
            </p>

            {treatment.product_name && (
              <p>产品: {treatment.product_name}</p>
            )}

            {treatment.notes && (
              <p className="text-gray-500 mt-2">{treatment.notes}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          {treatment.photos_count > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4" />
              <span>{treatment.photos_count} 张照片</span>
            </div>
          )}

          {treatment.cost && (
            <p className="text-lg font-semibold text-gray-900">
              ¥{treatment.cost.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
