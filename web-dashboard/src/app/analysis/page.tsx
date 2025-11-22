'use client'

import Link from 'next/link'
import { Sparkles, ArrowLeft, TrendingUp, Image as ImageIcon, Zap } from 'lucide-react'

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">GlowTrack AI</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>
              <Link href="/patients" className="text-gray-700 hover:text-primary-600">
                患者管理
              </Link>
              <Link href="/analysis" className="text-primary-600 font-semibold">
                AI分析
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回 Dashboard
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">AI 对比分析</h2>
          <p className="text-gray-600">张小姐 - 肉毒素注射治疗</p>
        </div>

        {/* Before/After Comparison */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">术前术后对比</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div>
              <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden mb-3">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">术前照片</p>
                    <p className="text-sm text-gray-400">2024-01-15</p>
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  术前
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-gray-200 rounded"></div>
                <div className="aspect-square bg-gray-200 rounded"></div>
                <div className="aspect-square bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* After */}
            <div>
              <div className="relative aspect-[3/4] bg-gradient-to-br from-primary-200 to-secondary-200 rounded-lg overflow-hidden mb-3">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-primary-600 mx-auto mb-2" />
                    <p className="text-gray-700 font-medium">术后照片</p>
                    <p className="text-sm text-gray-600">2024-02-20</p>
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  术后 5周
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-primary-100 rounded"></div>
                <div className="aspect-square bg-primary-100 rounded"></div>
                <div className="aspect-square bg-primary-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Overall Improvement */}
          <div className="card bg-gradient-to-br from-primary-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">综合改善度</h3>
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div className="text-5xl font-bold text-primary-600 mb-2">68%</div>
            <p className="text-gray-600">AI 量化评分</p>
            <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>

          {/* Processing Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">处理状态</h3>
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-3">
              <StatusItem label="人脸检测" status="completed" />
              <StatusItem label="关键点识别" status="completed" />
              <StatusItem label="图像对齐" status="completed" />
              <StatusItem label="AI 分析" status="completed" />
              <StatusItem label="报告生成" status="completed" />
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">详细分析指标</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <MetricCard
              title="皱纹分析"
              metrics={[
                { label: '额头纹', before: '深度 4.2mm', after: '深度 1.8mm', improvement: 57 },
                { label: '眉间纹', before: '深度 3.8mm', after: '深度 1.2mm', improvement: 68 },
                { label: '鱼尾纹', before: '深度 3.2mm', after: '深度 0.9mm', improvement: 72 },
              ]}
            />
            <MetricCard
              title="肤质分析"
              metrics={[
                { label: '肤色均匀度', before: '62分', after: '78分', improvement: 26 },
                { label: '毛孔大小', before: '2.3mm', after: '1.8mm', improvement: 22 },
                { label: '皮肤光泽', before: '58分', after: '82分', improvement: 41 },
              ]}
            />
            <MetricCard
              title="面部轮廓"
              metrics={[
                { label: '苹果肌饱满度', before: '65分', after: '88分', improvement: 35 },
                { label: '下颌线清晰度', before: '58分', after: '79分', improvement: 36 },
                { label: '面部对称性', before: '92分', after: '95分', improvement: 3 },
              ]}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button className="btn-secondary">
            下载报告
          </button>
          <button className="btn-primary">
            生成分享版本
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-600 font-semibold">完成</span>
      </div>
    </div>
  )
}

function MetricCard({ title, metrics }: { title: string; metrics: any[] }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="font-bold text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">{metric.label}</span>
              <span className="text-sm font-bold text-green-600">+{metric.improvement}%</span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>术前:</span>
                <span>{metric.before}</span>
              </div>
              <div className="flex justify-between">
                <span>术后:</span>
                <span className="text-primary-600 font-semibold">{metric.after}</span>
              </div>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                style={{ width: `${metric.improvement}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
