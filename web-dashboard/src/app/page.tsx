import Link from 'next/link'
import { Sparkles, Camera, LineChart, FileText, Users, Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                GlowTrack AI
              </h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>
              <Link href="/patients" className="text-gray-700 hover:text-primary-600">
                患者
              </Link>
              <Link href="/treatments" className="text-gray-700 hover:text-primary-600">
                治疗
              </Link>
              <button className="btn-primary">
                登录
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              AI驱动的医美术前术后对比系统
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              自动标准化照片、量化改善、生成精美报告，帮助诊所提高患者满意度和口碑传播
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
                开始使用
              </Link>
              <Link href="/demo" className="btn-secondary text-lg px-8 py-3">
                查看演示
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">核心功能</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h4 className="ml-3 text-xl font-semibold">{feature.title}</h4>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6" />
              <span className="text-lg font-semibold">GlowTrack AI</span>
            </div>
            <p className="text-gray-400">
              © 2024 GlowTrack AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Camera,
    title: 'AR辅助拍照',
    description: '实时指导标准化拍摄，确保角度、距离、光线一致性',
  },
  {
    icon: Sparkles,
    title: 'AI自动对齐',
    description: '智能检测人脸关键点，自动对齐和标准化照片',
  },
  {
    icon: LineChart,
    title: '量化分析',
    description: '皱纹、肤质、轮廓等多维度AI分析，数据化展示改善效果',
  },
  {
    icon: FileText,
    title: '精美报告',
    description: '医生版、患者版、社交媒体版，一键生成专业报告',
  },
  {
    icon: Users,
    title: '患者管理',
    description: '完整的治疗历史追踪，多次治疗效果对比',
  },
  {
    icon: Settings,
    title: '诊所定制',
    description: '品牌定制、数据分析、营销支持，全方位解决方案',
  },
]

const stats = [
  { value: '95%+', label: '对齐准确率' },
  { value: '<10s', label: '处理速度' },
  { value: '50%+', label: '分享率提升' },
  { value: '8.5/10', label: '患者满意度' },
]
