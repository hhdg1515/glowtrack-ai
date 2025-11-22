/**
 * AI 分析结果筛选组件
 */

import { useState } from 'react'
import { Filter, X, ChevronDown, Calendar } from 'lucide-react'

export interface AnalysisFilterOptions {
  effectLevels: string[]
  treatmentTypes: string[]
  dateRange: {
    start: string
    end: string
  } | null
}

interface AnalysisFiltersProps {
  filters: AnalysisFilterOptions
  onFiltersChange: (filters: AnalysisFilterOptions) => void
  onClear: () => void
}

const EFFECT_LEVELS = [
  { value: 'excellent', label: '优秀', color: 'bg-green-100 text-green-700 border-green-500' },
  { value: 'good', label: '良好', color: 'bg-blue-100 text-blue-700 border-blue-500' },
  { value: 'fair', label: '一般', color: 'bg-yellow-100 text-yellow-700 border-yellow-500' },
  { value: 'poor', label: '较差', color: 'bg-orange-100 text-orange-700 border-orange-500' },
  { value: 'negative', label: '负面', color: 'bg-red-100 text-red-700 border-red-500' },
]

const TREATMENT_TYPES = [
  { value: '肉毒素注射', label: '肉毒素注射' },
  { value: '玻尿酸填充', label: '玻尿酸填充' },
  { value: '激光美肤', label: '激光美肤' },
  { value: '线雕提升', label: '线雕提升' },
  { value: '水光针', label: '水光针' },
  { value: '超声刀', label: '超声刀' },
]

export default function AnalysisFilters({
  filters,
  onFiltersChange,
  onClear,
}: AnalysisFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters =
    filters.effectLevels.length > 0 ||
    filters.treatmentTypes.length > 0 ||
    filters.dateRange !== null

  const toggleEffectLevel = (level: string) => {
    const newLevels = filters.effectLevels.includes(level)
      ? filters.effectLevels.filter((l) => l !== level)
      : [...filters.effectLevels, level]

    onFiltersChange({
      ...filters,
      effectLevels: newLevels,
    })
  }

  const toggleTreatmentType = (type: string) => {
    const newTypes = filters.treatmentTypes.includes(type)
      ? filters.treatmentTypes.filter((t) => t !== type)
      : [...filters.treatmentTypes, type]

    onFiltersChange({
      ...filters,
      treatmentTypes: newTypes,
    })
  }

  const setDateRange = (range: { start: string; end: string } | null) => {
    onFiltersChange({
      ...filters,
      dateRange: range,
    })
  }

  const handleClear = () => {
    onClear()
    setIsExpanded(false)
  }

  const activeFilterCount =
    filters.effectLevels.length +
    filters.treatmentTypes.length +
    (filters.dateRange ? 1 : 0)

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* 筛选器头部 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-gray-900">高级筛选</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
              {activeFilterCount} 个筛选条件
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              清除筛选
            </button>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* 筛选器内容 */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 space-y-6">
          {/* 效果等级筛选 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">效果等级</h4>
            <div className="flex flex-wrap gap-2">
              {EFFECT_LEVELS.map((level) => {
                const isSelected = filters.effectLevels.includes(level.value)

                return (
                  <button
                    key={level.value}
                    onClick={() => toggleEffectLevel(level.value)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      isSelected
                        ? `${level.color} font-semibold`
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {level.label}
                    {isSelected && <X className="inline-block ml-1 w-4 h-4" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 治疗类型筛选 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">治疗类型</h4>
            <div className="flex flex-wrap gap-2">
              {TREATMENT_TYPES.map((type) => {
                const isSelected = filters.treatmentTypes.includes(type.value)

                return (
                  <button
                    key={type.value}
                    onClick={() => toggleTreatmentType(type.value)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-primary-100 border-primary-500 text-primary-700 font-semibold'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {type.label}
                    {isSelected && <X className="inline-block ml-1 w-4 h-4" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 日期范围筛选 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              分析日期范围
            </h4>
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setDateRange({
                      start: e.target.value,
                      end: filters.dateRange?.end || e.target.value,
                    })
                  } else {
                    setDateRange(null)
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="text-gray-500">至</span>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => {
                  if (e.target.value && filters.dateRange) {
                    setDateRange({
                      start: filters.dateRange.start,
                      end: e.target.value,
                    })
                  }
                }}
                disabled={!filters.dateRange?.start}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
              {filters.dateRange && (
                <button
                  onClick={() => setDateRange(null)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="清除日期范围"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* 已选筛选条件摘要 */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start space-x-2">
                <span className="text-sm font-semibold text-gray-700">已选条件：</span>
                <div className="flex-1 flex flex-wrap gap-2">
                  {filters.effectLevels.map((level) => {
                    const levelInfo = EFFECT_LEVELS.find((l) => l.value === level)
                    return (
                      <span
                        key={level}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${levelInfo?.color}`}
                      >
                        效果: {levelInfo?.label}
                        <button
                          onClick={() => toggleEffectLevel(level)}
                          className="ml-1 hover:bg-white/50 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}

                  {filters.treatmentTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      治疗: {type}
                      <button
                        onClick={() => toggleTreatmentType(type)}
                        className="ml-1 hover:bg-primary-100 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.dateRange && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      日期: {filters.dateRange.start} 至 {filters.dateRange.end}
                      <button
                        onClick={() => setDateRange(null)}
                        className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
