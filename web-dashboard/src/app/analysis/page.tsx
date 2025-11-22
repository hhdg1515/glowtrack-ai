'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ArrowLeft,
  Search,
  SortAsc,
  SortDesc,
  TrendingUp,
  Calendar,
  User,
  Eye,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Plus,
} from 'lucide-react'
import Pagination from '@/components/Pagination'
import AnalysisFilters, { type AnalysisFilterOptions } from '@/components/AnalysisFilters'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// Mock 数据 - 实际环境中应该从 API 获取
const mockAnalyses = [
  {
    id: 'analysis-001',
    patient_id: 'patient-001',
    patient_name: '张小姐',
    treatment_type: '肉毒素注射',
    treatment_area: '额头皱纹',
    analysis_date: '2024-02-20',
    treatment_date: '2024-01-15',
    days_after: 36,
    overall_improvement: 68,
    effect_level: 'good',
    before_image_url: null,
    after_image_url: null,
    wrinkles_score: 85,
    skin_quality_score: 72,
    contour_score: 65,
  },
  {
    id: 'analysis-002',
    patient_id: 'patient-002',
    patient_name: '李女士',
    treatment_type: '玻尿酸填充',
    treatment_area: '苹果肌',
    analysis_date: '2024-02-19',
    treatment_date: '2024-01-10',
    days_after: 40,
    overall_improvement: 82,
    effect_level: 'excellent',
    before_image_url: null,
    after_image_url: null,
    wrinkles_score: 78,
    skin_quality_score: 88,
    contour_score: 92,
  },
  {
    id: 'analysis-003',
    patient_id: 'patient-003',
    patient_name: '王女士',
    treatment_type: '激光美肤',
    treatment_area: '全脸',
    analysis_date: '2024-02-18',
    treatment_date: '2024-01-25',
    days_after: 24,
    overall_improvement: 45,
    effect_level: 'fair',
    before_image_url: null,
    after_image_url: null,
    wrinkles_score: 55,
    skin_quality_score: 62,
    contour_score: 48,
  },
  {
    id: 'analysis-004',
    patient_id: 'patient-004',
    patient_name: '陈小姐',
    treatment_type: '线雕提升',
    treatment_area: '下颌线',
    analysis_date: '2024-02-17',
    treatment_date: '2024-01-05',
    days_after: 43,
    overall_improvement: 91,
    effect_level: 'excellent',
    before_image_url: null,
    after_image_url: null,
    wrinkles_score: 92,
    skin_quality_score: 85,
    contour_score: 95,
  },
  {
    id: 'analysis-005',
    patient_id: 'patient-005',
    patient_name: '刘女士',
    treatment_type: '水光针',
    treatment_area: '全脸',
    analysis_date: '2024-02-16',
    treatment_date: '2024-02-01',
    days_after: 15,
    overall_improvement: 28,
    effect_level: 'poor',
    before_image_url: null,
    after_image_url: null,
    wrinkles_score: 35,
    skin_quality_score: 42,
    contour_score: 25,
  },
]

export default function AnalysisHistoryPage() {
  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'improvement' | 'patient'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // 高级筛选状态
  const [filters, setFilters] = useState<AnalysisFilterOptions>({
    effectLevels: [],
    treatmentTypes: [],
    dateRange: null,
  })

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Mock 加载状态
  const isLoading = false
  const error = null

  // 筛选、排序和分页
  const { paginatedAnalyses, totalFilteredCount } = useMemo(() => {
    let filtered = mockAnalyses.filter((analysis) => {
      // 搜索筛选
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        analysis.patient_name.toLowerCase().includes(searchLower) ||
        analysis.treatment_type.toLowerCase().includes(searchLower) ||
        analysis.treatment_area.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false

      // 效果等级筛选
      if (filters.effectLevels.length > 0) {
        if (!filters.effectLevels.includes(analysis.effect_level)) {
          return false
        }
      }

      // 治疗类型筛选
      if (filters.treatmentTypes.length > 0) {
        if (!filters.treatmentTypes.includes(analysis.treatment_type)) {
          return false
        }
      }

      // 日期范围筛选
      if (filters.dateRange) {
        const analysisDate = new Date(analysis.analysis_date)
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)
        if (analysisDate < startDate || analysisDate > endDate) {
          return false
        }
      }

      return true
    })

    const totalFilteredCount = filtered.length

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'date') {
        comparison = a.analysis_date.localeCompare(b.analysis_date)
      } else if (sortBy === 'improvement') {
        comparison = a.overall_improvement - b.overall_improvement
      } else if (sortBy === 'patient') {
        comparison = a.patient_name.localeCompare(b.patient_name, 'zh-CN')
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    // 分页
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedAnalyses = filtered.slice(startIndex, endIndex)

    return { paginatedAnalyses, totalFilteredCount }
  }, [searchQuery, sortBy, sortOrder, filters, currentPage, itemsPerPage])

  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage)

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const handleClearFilters = () => {
    setFilters({
      effectLevels: [],
      treatmentTypes: [],
      dateRange: null,
    })
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: AnalysisFilterOptions) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

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
                <h1 className="text-3xl font-bold text-gray-900">AI 分析历史</h1>
                <p className="text-gray-600 mt-1">
                  {totalFilteredCount < mockAnalyses.length ? (
                    <>
                      显示 {totalFilteredCount} 条 / 共 {mockAnalyses.length} 条分析记录
                    </>
                  ) : (
                    <>共 {mockAnalyses.length} 条分析记录</>
                  )}
                </p>
              </div>
            </div>

            <Link
              href="/upload"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>新建分析</span>
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
                  placeholder="搜索患者、治疗类型或部位..."
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
                <option value="date">按分析日期</option>
                <option value="improvement">按改善效果</option>
                <option value="patient">按患者姓名</option>
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
          <AnalysisFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* 分析记录列表 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">加载分析数据中...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">加载失败</h3>
              <p className="text-red-700">无法加载分析数据</p>
            </div>
          </div>
        )}

        {!isLoading && !error && totalFilteredCount === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filters.effectLevels.length > 0 || filters.treatmentTypes.length > 0
                ? '未找到匹配的分析记录'
                : '还没有分析记录'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filters.effectLevels.length > 0 || filters.treatmentTypes.length > 0
                ? '尝试调整搜索条件或筛选条件'
                : '点击上方"新建分析"按钮开始上传照片进行 AI 分析'}
            </p>
          </div>
        )}

        {!isLoading && !error && totalFilteredCount > 0 && (
          <>
            {/* 分析卡片列表 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                {paginatedAnalyses.map((analysis) => (
                  <AnalysisCard key={analysis.id} analysis={analysis} />
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
                  itemsPerPageOptions={[10, 20, 50, 100]}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// 分析卡片组件
function AnalysisCard({ analysis }: { analysis: any }) {
  const effectLevelConfig = {
    excellent: { label: '优秀', color: 'bg-green-100 text-green-700 border-green-500' },
    good: { label: '良好', color: 'bg-blue-100 text-blue-700 border-blue-500' },
    fair: { label: '一般', color: 'bg-yellow-100 text-yellow-700 border-yellow-500' },
    poor: { label: '较差', color: 'bg-orange-100 text-orange-700 border-orange-500' },
    negative: { label: '负面', color: 'bg-red-100 text-red-700 border-red-500' },
  }

  const effectConfig = effectLevelConfig[analysis.effect_level as keyof typeof effectLevelConfig]

  return (
    <Link
      href={`/analysis/result?id=${analysis.id}`}
      className="block p-6 hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-start space-x-6">
        {/* 照片预览 */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden relative">
            {analysis.after_image_url ? (
              <img
                src={analysis.after_image_url}
                alt="术后照片"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700">
              {analysis.days_after} 天后
            </div>
          </div>
        </div>

        {/* 分析信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {analysis.patient_name} - {analysis.treatment_type}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {analysis.treatment_area} •
                {format(new Date(analysis.analysis_date), 'PPP', { locale: zhCN })}
              </p>
            </div>

            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${effectConfig.color}`}>
              {effectConfig.label}
            </span>
          </div>

          {/* 改善效果和指标 */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-primary-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">总体改善</span>
                <TrendingUp className="w-4 h-4 text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-primary-600">
                {analysis.overall_improvement}%
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-600 block mb-1">皱纹</span>
              <p className="text-xl font-semibold text-gray-900">{analysis.wrinkles_score}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-600 block mb-1">肤质</span>
              <p className="text-xl font-semibold text-gray-900">{analysis.skin_quality_score}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-600 block mb-1">轮廓</span>
              <p className="text-xl font-semibold text-gray-900">{analysis.contour_score}</p>
            </div>
          </div>

          {/* 查看详情按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>患者 ID: {analysis.patient_id}</span>
            </div>

            <div className="flex items-center space-x-2 text-primary-600 group-hover:text-primary-700">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold">查看详情</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
