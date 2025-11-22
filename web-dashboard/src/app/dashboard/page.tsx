'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Users, FileText, TrendingUp, Loader2, LogOut, Camera, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react'
import { useClinicPatients } from '@/hooks/usePatients'

export default function Dashboard() {
  // TODO: 从用户 session 获取 clinic_id
  const clinicId = 'clinic-demo-001'
  const { data: patientsData, isLoading } = useClinicPatients(clinicId)

  const totalPatients = patientsData?.total || 0
  const patients = patientsData?.patients || []

  // 计算总治疗次数
  const totalTreatments = patients.reduce((sum, p) => sum + p.total_treatments, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
              <button
                onClick={() => {
                  // TODO: 实现登出逻辑 (清除 session, 重定向到登录页)
                  console.log('用户登出')
                  window.location.href = '/'
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="登出系统"
              >
                <LogOut className="w-4 h-4" />
                <span>登出</span>
              </button>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                title="总患者数"
                value={totalPatients.toString()}
                change="实时数据"
                positive={true}
              />
              <StatCard
                icon={Camera}
                title="总治疗次数"
                value={totalTreatments.toString()}
                change="实时数据"
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
              {/* Left Column - Recent Patients and Day View */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Patients */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">最近的患者</h3>
                    <Link href="/patients" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                      查看全部 →
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {patients.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>还没有患者数据</p>
                        <Link
                          href="/patients/new"
                          className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                        >
                          添加第一位患者 →
                        </Link>
                      </div>
                    ) : (
                      patients.slice(0, 5).map((patient) => (
                        <PatientItem key={patient.id} patient={patient} />
                      ))
                    )}
                  </div>
                </div>

                {/* Day View */}
                <DayView />
              </div>

              {/* Quick Actions and Calendar */}
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">快速操作</h3>
                  <div className="space-y-3">
                    <QuickActionButton
                      icon={Users}
                      label="添加患者"
                      description="创建新患者档案"
                      href="/patients/new"
                    />
                    <QuickActionButton
                      icon={FileText}
                      label="患者列表"
                      description="查看所有患者"
                      href="/patients"
                    />
                  </div>
                </div>

                {/* Calendar */}
                <MonthCalendar />
              </div>
            </div>
          </>
        )}
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
          <p className={`text-sm mt-1 ${positive ? 'text-green-600' : 'text-gray-500'}`}>
            {change}
          </p>
        </div>
        <div className="p-3 bg-primary-100 rounded-lg">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
    </div>
  )
}

function PatientItem({ patient }: { patient: any }) {
  const fullName = `${patient.first_name} ${patient.last_name}`

  return (
    <Link
      href={`/patients/${patient.id}`}
      className="flex items-center justify-between py-2 hover:opacity-75 transition-opacity cursor-pointer border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold">
          {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{fullName}</h4>
          <p className="text-sm text-gray-600">
            {patient.email || patient.phone || '无联系信息'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-primary-600">
          {patient.total_treatments} 次治疗
        </p>
        {patient.patient_id && (
          <p className="text-xs text-gray-500">{patient.patient_id}</p>
        )}
      </div>
    </Link>
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

function DayView() {
  const today = new Date()
  const dayName = today.toLocaleDateString('zh-CN', { weekday: 'long' })
  const dateString = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Mock 今日预约数据 - 实际应该从 API 获取
  const todayAppointments = [
    { id: 1, time: '09:00', patient: 'Sarah Zhang', type: '肉毒素注射', duration: '30分钟' },
    { id: 2, time: '10:30', patient: 'Emma Li', type: '玻尿酸填充', duration: '45分钟' },
    { id: 3, time: '14:00', patient: 'Jessica Wang', type: '激光美肤', duration: '60分钟' },
    { id: 4, time: '16:00', patient: 'Amanda Chen', type: '线雕提升', duration: '90分钟' },
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">今日日程</h3>
          </div>
          <p className="text-sm text-gray-600">{dateString} · {dayName}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">{todayAppointments.length}</p>
          <p className="text-xs text-gray-500">个预约</p>
        </div>
      </div>

      <div className="space-y-3">
        {todayAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">今天没有预约</p>
          </div>
        ) : (
          todayAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-lg flex-shrink-0">
                <div className="text-center">
                  <p className="text-xs text-primary-600 font-semibold">
                    {appointment.time.split(':')[0]}
                  </p>
                  <p className="text-lg font-bold text-primary-700">
                    {appointment.time.split(':')[1]}
                  </p>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {appointment.patient}
                </h4>
                <p className="text-sm text-gray-600">{appointment.type}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500">{appointment.duration}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MonthCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthName = currentDate.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
    const isToday = date.getTime() === today.getTime()
    days.push({ date, isCurrentMonth, isToday })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{monthName}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="上月"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="下月"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`aspect-square flex items-center justify-center text-sm font-medium rounded transition-colors ${
              day.isToday
                ? 'bg-primary-600 text-white'
                : day.isCurrentMonth
                ? 'text-gray-900 hover:bg-gray-100'
                : 'text-gray-300'
            }`}
          >
            {day.date.getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}
