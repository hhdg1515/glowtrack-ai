/**
 * 患者高级筛选组件
 */

import { useState } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'

export interface PatientFilterOptions {
  skinTypes: string[]
  treatmentCountRange: {
    min: number
    max: number
  } | null
}

interface PatientFiltersProps {
  filters: PatientFilterOptions
  onFiltersChange: (filters: PatientFilterOptions) => void
  onClear: () => void
}

const SKIN_TYPES = [
  { value: '干性', label: '干性' },
  { value: '油性', label: '油性' },
  { value: '混合性', label: '混合性' },
  { value: '敏感性', label: '敏感性' },
  { value: '中性', label: '中性' },
]

const TREATMENT_RANGES = [
  { label: '无治疗', min: 0, max: 0 },
  { label: '1-3次', min: 1, max: 3 },
  { label: '4-10次', min: 4, max: 10 },
  { label: '10次以上', min: 11, max: 999 },
]

export default function PatientFilters({
  filters,
  onFiltersChange,
  onClear,
}: PatientFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = filters.skinTypes.length > 0 || filters.treatmentCountRange !== null

  const toggleSkinType = (skinType: string) => {
    const newSkinTypes = filters.skinTypes.includes(skinType)
      ? filters.skinTypes.filter((t) => t !== skinType)
      : [...filters.skinTypes, skinType]

    onFiltersChange({
      ...filters,
      skinTypes: newSkinTypes,
    })
  }

  const setTreatmentRange = (range: { min: number; max: number } | null) => {
    onFiltersChange({
      ...filters,
      treatmentCountRange: range,
    })
  }

  const handleClear = () => {
    onClear()
    setIsExpanded(false)
  }

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
              {filters.skinTypes.length + (filters.treatmentCountRange ? 1 : 0)} 个筛选条件
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
          {/* 肤质筛选 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">肤质类型</h4>
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPES.map((skinType) => (
                <button
                  key={skinType.value}
                  onClick={() => toggleSkinType(skinType.value)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    filters.skinTypes.includes(skinType.value)
                      ? 'bg-primary-100 border-primary-500 text-primary-700 font-semibold'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {skinType.label}
                  {filters.skinTypes.includes(skinType.value) && (
                    <X className="inline-block ml-1 w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 治疗次数筛选 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">治疗次数</h4>
            <div className="flex flex-wrap gap-2">
              {TREATMENT_RANGES.map((range) => {
                const isSelected =
                  filters.treatmentCountRange?.min === range.min &&
                  filters.treatmentCountRange?.max === range.max

                return (
                  <button
                    key={range.label}
                    onClick={() =>
                      setTreatmentRange(
                        isSelected ? null : { min: range.min, max: range.max }
                      )
                    }
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-primary-100 border-primary-500 text-primary-700 font-semibold'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                    {isSelected && <X className="inline-block ml-1 w-4 h-4" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 已选筛选条件摘要 */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-start space-x-2">
                <span className="text-sm font-semibold text-gray-700">已选条件：</span>
                <div className="flex-1 flex flex-wrap gap-2">
                  {filters.skinTypes.map((skinType) => (
                    <span
                      key={skinType}
                      className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      肤质: {skinType}
                      <button
                        onClick={() => toggleSkinType(skinType)}
                        className="ml-1 hover:bg-primary-100 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.treatmentCountRange && (
                    <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                      治疗次数:{' '}
                      {TREATMENT_RANGES.find(
                        (r) =>
                          r.min === filters.treatmentCountRange?.min &&
                          r.max === filters.treatmentCountRange?.max
                      )?.label}
                      <button
                        onClick={() => setTreatmentRange(null)}
                        className="ml-1 hover:bg-primary-100 rounded-full p-0.5"
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
