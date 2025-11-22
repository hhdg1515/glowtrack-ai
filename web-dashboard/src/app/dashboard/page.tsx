'use client'

import Link from 'next/link'
import { Sparkles, Camera, Users, FileText, TrendingUp, Calendar } from 'lucide-react'

export default function Dashboard() {
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
              <Link href="/dashboard" className="text-primary-600 font-semibold">
                Dashboard
              </Link>
              <Link href="/patients" className="text-gray-700 hover:text-primary-600">
                患者管理
              </Link>
              <Link href="/analysis" className="text-gray-700 hover:text-primary-600">
                AI分析
              </Link>
              <Link href="/" className="text-gray-700 hover:text-primary-600">
                返回首页
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来，医生</h2>
          <p className="text-gray-600">这是您的诊所管理中心</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="活跃患者"
            value="128"
            change="+12%"
            positive={true}
          />
          <StatCard
            icon={Camera}
            title="本月照片"
            value="456"
            change="+8%"
            positive={true}
          />
          <StatCard
            icon={FileText}
            title="生成报告"
            value="89"
            change="+15%"
            positive={true}
          />
          <StatCard
            icon={TrendingUp}
            title="患者满意度"
            value="9.2/10"
            change="+0.3"
            positive={true}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Analyses */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">最近的AI分析</h3>
              <Link href="/analysis" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                查看全部 →
              </Link>
            </div>
            <div className="space-y-4">
              {recentAnalyses.map((analysis, index) => (
                <AnalysisItem key={index} {...analysis} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">快速操作</h3>
            <div className="space-y-3">
              <QuickActionButton
                icon={Camera}
                label="上传新照片"
                description="开始新的对比分析"
                href="/upload"
              />
              <QuickActionButton
                icon={Users}
                label="添加患者"
                description="创建新患者档案"
                href="/patients/new"
              />
              <QuickActionButton
                icon={FileText}
                label="生成报告"
                description="创建精美对比报告"
                href="/reports/new"
              />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">最近活动</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value, change, positive }: any) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {change} vs 上月
          </p>
        </div>
        <div className="p-3 bg-primary-100 rounded-lg">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
    </div>
  )
}

function AnalysisItem({ patient, type, date, improvement }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold">
          {patient.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{patient}</h4>
          <p className="text-sm text-gray-600">{type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-green-600">{improvement} 改善</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  )
}

function QuickActionButton({ icon: Icon, label, description, href }: any) {
  return (
    <Link
      href={href}
      className="block p-4 bg-gray-50 rounded-lg hover:bg-primary-50 hover:border-primary-200 border border-gray-200 transition-all"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white rounded-lg">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}

function ActivityItem({ action, patient, time }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3">
        <Calendar className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{patient}</span> {action}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  )
}

const recentAnalyses = [
  {
    patient: '张小姐',
    type: '肉毒素注射 - 皱纹分析',
    date: '2小时前',
    improvement: '68%',
  },
  {
    patient: '李女士',
    type: '玻尿酸填充 - 面部轮廓',
    date: '5小时前',
    improvement: '82%',
  },
  {
    patient: '王女士',
    type: '激光美肤 - 肤质分析',
    date: '1天前',
    improvement: '45%',
  },
  {
    patient: '陈小姐',
    type: '线雕提升 - 下颌线',
    date: '2天前',
    improvement: '91%',
  },
]

const recentActivities = [
  { action: '上传了术后照片', patient: '张小姐', time: '10分钟前' },
  { action: '生成了对比报告', patient: '李女士', time: '1小时前' },
  { action: '完成了AI分析', patient: '王女士', time: '3小时前' },
  { action: '创建了新档案', patient: '赵女士', time: '5小时前' },
  { action: '分享了治疗报告', patient: '陈小姐', time: '1天前' },
]
