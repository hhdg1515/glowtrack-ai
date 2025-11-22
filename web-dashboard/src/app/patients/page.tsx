'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  User,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  Activity,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { useClinicPatients } from '@/hooks/usePatients'
import type { Patient } from '@/types/api'
import Pagination from '@/components/Pagination'

export default function PatientsPage() {
  // TODO: 从用户 session 获取 clinic_id
  const clinicId = 'clinic-demo-001'

  // 获取患者数据
  const { data, isLoading, error } = useClinicPatients(clinicId)

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('')

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // 搜索和分页患者
  const { paginatedPatients, totalFilteredCount } = useMemo(() => {
    if (!data?.patients) return { paginatedPatients: [], totalFilteredCount: 0 }

    // 搜索筛选
    let filtered = data.patients.filter((patient) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        patient.first_name.toLowerCase().includes(searchLower) ||
        patient.last_name.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.phone?.includes(searchQuery)
      )
    })

    const totalFilteredCount = filtered.length

    // 分页
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedPatients = filtered.slice(startIndex, endIndex)

    return { paginatedPatients, totalFilteredCount }
  }, [data?.patients, searchQuery, currentPage, itemsPerPage])

  // 计算总页数
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage)

  // 当搜索改变时，重置到第一页
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  // 改变每页显示数量时，重置到第一页
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">患者管理</h1>
                <p className="text-gray-600 mt-1">
                  {totalFilteredCount < (data?.total || 0) ? (
                    <>
                      显示 {totalFilteredCount} 位 / 共 {data?.total || 0} 位患者
                    </>
                  ) : (
                    <>共 {data?.total || 0} 位患者</>
                  )}
                </p>
              </div>
            </div>

            <Link
              href="/patients/new"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>添加患者</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索框 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索患者姓名、邮箱或电话..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 患者列表 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">加载患者数据中...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">加载失败</h3>
              <p className="text-red-700">{(error as any)?.detail || '无法加载患者数据'}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && totalFilteredCount === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? '未找到匹配的患者' : '还没有患者'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? '尝试调整搜索条件'
                : '点击上方"添加患者"按钮开始添加患者'}
            </p>
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="px-6 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                清除搜索
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && totalFilteredCount > 0 && (
          <>
            {/* 患者卡片网格 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {paginatedPatients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>

              {/* 分页控件 */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalFilteredCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[12, 24, 48, 96]}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// 患者卡片组件
function PatientCard({ patient }: { patient: Patient }) {
  const fullName = `${patient.first_name} ${patient.last_name}`

  // 随机颜色数组
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-red-500',
    'bg-amber-600',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-rose-500',
  ]

  // 根据患者 ID 生成一致的颜色
  const colorIndex = patient.id.charCodeAt(0) % colors.length
  const avatarColor = colors[colorIndex]

  return (
    <Link
      href={`/patients/${patient.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden group"
    >
      <div className="p-6">
        {/* 头像和姓名 */}
        <div className="flex items-center space-x-4 mb-4">
          <div className={`w-16 h-16 ${avatarColor} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
            {patient.first_name[0]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {fullName}
            </h3>
            {patient.patient_id && (
              <p className="text-sm text-gray-500">ID: {patient.patient_id}</p>
            )}
          </div>
        </div>

        {/* 患者信息 */}
        <div className="space-y-2">
          {patient.email && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}

          {patient.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{patient.phone}</span>
            </div>
          )}

          {patient.date_of_birth && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{patient.date_of_birth}</span>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary-600" />
              <span className="text-sm text-gray-600">治疗次数</span>
            </div>
            <span className="text-xl font-bold text-primary-600">
              {patient.total_treatments}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
