'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  User,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
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

export default function PatientsPage() {
  // TODO: 从用户 session 获取 clinic_id
  const clinicId = 'clinic-demo-001'

  // 获取患者数据
  const { data, isLoading, error } = useClinicPatients(clinicId)

  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'treatments'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // 筛选和排序患者
  const filteredAndSortedPatients = useMemo(() => {
    if (!data?.patients) return []

    let filtered = data.patients.filter((patient) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        patient.first_name.toLowerCase().includes(searchLower) ||
        patient.last_name.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.phone?.includes(searchQuery)
      )
    })

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'name') {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
        comparison = nameA.localeCompare(nameB, 'zh-CN')
      } else if (sortBy === 'date') {
        const dateA = a.created_at || ''
        const dateB = b.created_at || ''
        comparison = dateA.localeCompare(dateB)
      } else if (sortBy === 'treatments') {
        comparison = a.total_treatments - b.total_treatments
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [data?.patients, searchQuery, sortBy, sortOrder])

  // 切换排序顺序
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
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
                  共 {data?.total || 0} 位患者
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
        {/* 搜索和筛选栏 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* 搜索框 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索患者姓名、邮箱或电话..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 排序控制 */}
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="name">按姓名</option>
                <option value="date">按创建日期</option>
                <option value="treatments">按治疗次数</option>
              </select>

              <button
                onClick={toggleSortOrder}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={sortOrder === 'asc' ? '升序' : '降序'}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-5 h-5 text-gray-600" />
                ) : (
                  <SortDesc className="w-5 h-5 text-gray-600" />
                )}
              </button>
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

        {!isLoading && !error && filteredAndSortedPatients.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? '未找到匹配的患者' : '还没有患者'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? '尝试使用不同的搜索词'
                : '点击上方"添加患者"按钮开始添加患者'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                清除搜索
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && filteredAndSortedPatients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 患者卡片组件
function PatientCard({ patient }: { patient: Patient }) {
  const fullName = `${patient.first_name} ${patient.last_name}`

  return (
    <Link
      href={`/patients/${patient.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 overflow-hidden group"
    >
      {/* 顶部彩色条 */}
      <div className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500" />

      <div className="p-6">
        {/* 头像和姓名 */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {patient.first_name[0]}
            {patient.last_name[0]}
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
