'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  User,
  Plus,
  Search,
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
import Pagination from '@/components/Pagination'
import PatientFilters, { type PatientFilterOptions } from '@/components/PatientFilters'

export default function PatientsPage() {
  // TODO: 从用户 session 获取 clinic_id
  const clinicId = 'clinic-demo-001'

  // 获取患者数据
  const { data, isLoading, error } = useClinicPatients(clinicId)

  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'treatments'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // 高级筛选状态
  const [filters, setFilters] = useState<PatientFilterOptions>({
    skinTypes: [],
    treatmentCountRange: null,
  })

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // 筛选、排序和分页患者
  const { paginatedPatients, totalFilteredCount } = useMemo(() => {
    if (!data?.patients) return { paginatedPatients: [], totalFilteredCount: 0 }

    // 第一步：搜索筛选
    let filtered = data.patients.filter((patient) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        patient.first_name.toLowerCase().includes(searchLower) ||
        patient.last_name.toLowerCase().includes(searchLower) ||
        patient.email?.toLowerCase().includes(searchLower) ||
        patient.phone?.includes(searchQuery)

      if (!matchesSearch) return false

      // 第二步：肤质筛选
      if (filters.skinTypes.length > 0) {
        if (!patient.skin_type || !filters.skinTypes.includes(patient.skin_type)) {
          return false
        }
      }

      // 第三步：治疗次数筛选
      if (filters.treatmentCountRange) {
        const { min, max } = filters.treatmentCountRange
        const treatmentCount = patient.total_treatments
        if (treatmentCount < min || treatmentCount > max) {
          return false
        }
      }

      return true
    })

    const totalFilteredCount = filtered.length

    // 第四步：排序
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

    // 第五步：分页
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedPatients = filtered.slice(startIndex, endIndex)

    return { paginatedPatients, totalFilteredCount }
  }, [data?.patients, searchQuery, sortBy, sortOrder, filters, currentPage, itemsPerPage])

  // 计算总页数
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage)

  // 切换排序顺序
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  // 清除筛选条件
  const handleClearFilters = () => {
    setFilters({
      skinTypes: [],
      treatmentCountRange: null,
    })
    setCurrentPage(1) // 重置到第一页
  }

  // 当筛选条件改变时，重置到第一页
  const handleFiltersChange = (newFilters: PatientFilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

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
        {/* 搜索和排序栏 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* 搜索框 */}
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

        {/* 高级筛选 */}
        <div className="mb-6">
          <PatientFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
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
              {searchQuery || filters.skinTypes.length > 0 || filters.treatmentCountRange
                ? '未找到匹配的患者'
                : '还没有患者'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filters.skinTypes.length > 0 || filters.treatmentCountRange
                ? '尝试调整搜索条件或筛选条件'
                : '点击上方"添加患者"按钮开始添加患者'}
            </p>
            {(searchQuery || filters.skinTypes.length > 0 || filters.treatmentCountRange) && (
              <div className="flex items-center justify-center space-x-3">
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="px-6 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    清除搜索
                  </button>
                )}
                {(filters.skinTypes.length > 0 || filters.treatmentCountRange) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    清除筛选
                  </button>
                )}
              </div>
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
