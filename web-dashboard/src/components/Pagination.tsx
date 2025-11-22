/**
 * 通用分页组件
 */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  itemsPerPageOptions?: number[]
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const goToFirstPage = () => onPageChange(1)
  const goToLastPage = () => onPageChange(totalPages)
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1))
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))

  // 生成页码数组（显示当前页前后各2页）
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // 如果总页数少于等于5，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 显示部分页码
      if (currentPage <= 3) {
        // 当前页在前面
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // 当前页在后面
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 当前页在中间
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null // 只有一页时不显示分页
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
      {/* 左侧：显示信息 */}
      <div className="flex items-center space-x-4">
        <p className="text-sm text-gray-700">
          显示 <span className="font-semibold">{startItem}</span> 到{' '}
          <span className="font-semibold">{endItem}</span>，共{' '}
          <span className="font-semibold">{totalItems}</span> 条
        </p>

        {/* 每页显示数量选择 */}
        <div className="flex items-center space-x-2">
          <label htmlFor="items-per-page" className="text-sm text-gray-700">
            每页
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-sm"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">条</span>
        </div>
      </div>

      {/* 右侧：分页控件 */}
      <div className="flex items-center space-x-2">
        {/* 第一页 */}
        <button
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="第一页"
        >
          <ChevronsLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* 上一页 */}
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="上一页"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* 页码 */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-primary-600 text-white font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 下一页 */}
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="下一页"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        {/* 最后一页 */}
        <button
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="最后一页"
        >
          <ChevronsRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
