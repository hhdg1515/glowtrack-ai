'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Lock,
  Share2,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'

export default function AnalysisResultPage() {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [showDoctorView, setShowDoctorView] = useState(true)

  useEffect(() => {
    // 从 localStorage 获取分析结果
    const stored = localStorage.getItem('latest_analysis')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setAnalysisData(data)
      } catch (e) {
        console.error('Failed to parse analysis data', e)
      }
    }
  }, [])

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">暂无分析结果</h2>
          <p className="text-gray-600 mb-6">请先上传照片进行分析</p>
          <Link href="/upload" className="btn-primary">
            去上传照片
          </Link>
        </div>
      </div>
    )
  }

  const { patient_report, doctor_view, analysis } = analysisData

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
              <Link href="/upload" className="text-gray-700 hover:text-primary-600">
                上传分析
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/upload" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回上传
        </Link>

        {/* Toggle View */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">分析结果</h2>
            <EffectBadge level={doctor_view?.effect_level} />
          </div>
          <button
            onClick={() => setShowDoctorView(!showDoctorView)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {showDoctorView ? (
              <>
                <Eye className="h-5 w-5" />
                <span>医生视图</span>
              </>
            ) : (
              <>
                <EyeOff className="h-5 w-5" />
                <span>患者视图</span>
              </>
            )}
          </button>
        </div>

        {/* Patient Report Section */}
        {!showDoctorView && (
          <div className="mb-6">
            <PatientReportView report={patient_report} />
          </div>
        )}

        {/* Doctor View Section */}
        {showDoctorView && (
          <>
            {/* Doctor Alerts */}
            {doctor_view?.alerts && doctor_view.alerts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ 医生提醒</h3>
                <div className="space-y-3">
                  {doctor_view.alerts.map((alert: any, index: number) => (
                    <DoctorAlert key={index} alert={alert} />
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {doctor_view?.risks && doctor_view.risks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🚨 风险检测</h3>
                <div className="space-y-3">
                  {doctor_view.risks.map((risk: any, index: number) => (
                    <RiskCard key={index} risk={risk} />
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <OverviewCard
                title="效果等级"
                value={doctor_view?.effect_level || 'N/A'}
                icon={TrendingUp}
                color="primary"
              />
              <OverviewCard
                title="可见性状态"
                value={doctor_view?.visibility_status || 'N/A'}
                icon={eye_visibility_icon(doctor_view?.visibility_status)}
                color={visibility_color(doctor_view?.visibility_status)}
              />
              <OverviewCard
                title="治疗后天数"
                value={`${doctor_view?.days_after_treatment || 'N/A'} 天`}
                icon={Clock}
                color="secondary"
              />
            </div>

            {/* Timing Status */}
            {doctor_view?.timing_status && (
              <div className="card mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">⏱️ 时间窗口评估</h3>
                <TimingStatusCard timing={doctor_view.timing_status} />
              </div>
            )}

            {/* Detailed Analysis Results */}
            {analysis && (
              <div className="card mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">📊 详细分析数据</h3>
                <DetailedAnalysis analysis={analysis} />
              </div>
            )}

            {/* Suggested Actions */}
            {doctor_view?.suggested_actions && doctor_view.suggested_actions.length > 0 && (
              <div className="card mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💡 建议处理措施</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {doctor_view.suggested_actions.map((action: string, index: number) => (
                    <ActionItem key={index} action={action} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>下载报告</span>
          </button>
          {patient_report?.can_share && (
            <button className="btn-primary flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>生成分享版本</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Patient Report View Component
function PatientReportView({ report }: { report: any }) {
  if (!report) {
    return (
      <div className="card bg-gray-100 text-center py-12">
        <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">报告不可用</h3>
        <p className="text-gray-600">该报告仅医生可见</p>
      </div>
    )
  }

  if (report.status === 'pending_review') {
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-4">
          <Clock className="h-8 w-8 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-yellow-900 mb-2">等待医生审核</h3>
            <p className="text-yellow-800">{report.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-gradient-to-br from-primary-50 to-white">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{report.headline}</h3>
        <span className="inline-block px-4 py-2 bg-primary-100 text-primary-800 rounded-full font-semibold">
          {report.badge}
        </span>
      </div>

      <p className="text-lg text-gray-700 mb-6">{report.encouragement}</p>

      {/* Overall Improvement */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900">综合改善度</span>
          <span className="text-3xl font-bold text-primary-600">{report.overall_improvement}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            style={{ width: `${report.overall_improvement}%` }}
          />
        </div>
      </div>

      {/* Highlights */}
      {report.highlights && report.highlights.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-3">✨ 主要改善</h4>
          <ul className="space-y-2">
            {report.highlights.map((highlight: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {report.next_steps && report.next_steps.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-bold text-gray-900 mb-3">📝 下一步建议</h4>
          <ul className="space-y-2">
            {report.next_steps.map((step: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-primary-600 font-bold">{index + 1}.</span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Other helper components...
function EffectBadge({ level }: { level?: string }) {
  const badges: Record<string, { color: string; label: string }> = {
    excellent: { color: 'bg-green-100 text-green-800', label: '⭐ 优秀' },
    good: { color: 'bg-blue-100 text-blue-800', label: '✓ 良好' },
    fair: { color: 'bg-yellow-100 text-yellow-800', label: '⏳ 一般' },
    poor: { color: 'bg-orange-100 text-orange-800', label: '⚠️ 不佳' },
    negative: { color: 'bg-red-100 text-red-800', label: '❌ 负面' },
  }

  const badge = badges[level || ''] || { color: 'bg-gray-100 text-gray-800', label: '未知' }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
      {badge.label}
    </span>
  )
}

function DoctorAlert({ alert }: { alert: any }) {
  const levelColors: Record<string, string> = {
    urgent: 'bg-red-50 border-red-200 text-red-900',
    high: 'bg-orange-50 border-orange-200 text-orange-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  }

  return (
    <div className={`p-4 border rounded-lg ${levelColors[alert.level] || levelColors.info}`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">{alert.type}</span>
            <span className="text-xs px-2 py-1 bg-white rounded">优先级 {alert.priority}</span>
          </div>
          <p className="text-sm mb-2">{alert.message}</p>
          {alert.suggestions && (
            <ul className="text-sm space-y-1">
              {alert.suggestions.map((suggestion: string, index: number) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function RiskCard({ risk }: { risk: any }) {
  const severityColors: Record<string, string> = {
    high: 'bg-red-50 border-red-300',
    medium: 'bg-yellow-50 border-yellow-300',
    low: 'bg-blue-50 border-blue-300',
  }

  return (
    <div className={`p-4 border-2 rounded-lg ${severityColors[risk.severity] || severityColors.medium}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="font-bold text-red-900">{risk.type}</span>
        <span className="px-2 py-1 bg-red-200 text-red-900 text-xs font-bold rounded uppercase">
          {risk.severity}
        </span>
      </div>
      <p className="text-sm text-gray-800 mb-2">{risk.message}</p>
      <p className="text-xs text-gray-600">建议: {risk.action}</p>
    </div>
  )
}

function OverviewCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )
}

function TimingStatusCard({ timing }: { timing: any }) {
  const statusColors: Record<string, string> = {
    optimal: 'bg-green-100 text-green-800',
    acceptable: 'bg-blue-100 text-blue-800',
    too_early: 'bg-yellow-100 text-yellow-800',
    too_late: 'bg-orange-100 text-orange-800',
  }

  return (
    <div>
      <div className="flex items-center space-x-3 mb-3">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[timing.status]}`}>
          {timing.status}
        </span>
        <span className="text-sm text-gray-600">可靠性: {timing.reliability}</span>
      </div>
      <p className="text-gray-700 mb-2">{timing.message}</p>
      {timing.recommendation && (
        <p className="text-sm text-blue-600">💡 {timing.recommendation}</p>
      )}
    </div>
  )
}

function DetailedAnalysis({ analysis }: { analysis: any }) {
  const categories = [
    { key: 'wrinkle_analysis', title: '皱纹分析' },
    { key: 'skin_quality', title: '肤质分析' },
    { key: 'facial_contour', title: '面部轮廓' },
    { key: 'volume_fullness', title: '体积饱满度' },
  ]

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const data = analysis[category.key]
        if (!data) return null

        return (
          <div key={category.key}>
            <h4 className="font-bold text-gray-900 mb-4">{category.title}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(data).map(([key, value]: [string, any]) => {
                if (typeof value !== 'object') return null

                return (
                  <div key={key} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{formatMetricName(key)}</span>
                      <span className="text-lg font-bold text-green-600">
                        +{value.improvement_pct || 0}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{value.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">术前: </span>
                        <span className="font-semibold">{value.before_score}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">术后: </span>
                        <span className="font-semibold text-primary-600">{value.after_score}</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                        style={{ width: `${Math.min(value.improvement_pct || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Overall Assessment */}
      {analysis.overall_assessment && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-bold text-gray-900 mb-4">综合评估</h4>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <StatItem label="综合改善度" value={`${analysis.overall_assessment.overall_improvement}%`} />
            <StatItem label="自然度" value={`${analysis.overall_assessment.naturalness}/100`} />
            <StatItem label="年轻化效果" value={`${analysis.overall_assessment.rejuvenation_effect}/100`} />
          </div>
          <p className="text-gray-700 mb-4">{analysis.overall_assessment.summary}</p>
          {analysis.overall_assessment.recommendations && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">建议</h5>
              <ul className="space-y-1">
                {analysis.overall_assessment.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActionItem({ action }: { action: string }) {
  const actionLabels: Record<string, string> = {
    urgent_doctor_contact: '🚨 紧急联系患者',
    schedule_consultation: '📅 安排面诊',
    offer_free_correction: '🎁 提供免费修正',
    offer_free_touch_up: '💉 提供免费补打',
    schedule_followup: '📆 安排复查',
    schedule_followup_2weeks: '📆 2周后复查',
    send_care_instructions: '📝 发送护理指导',
    request_testimonial: '⭐ 请求好评',
    offer_referral_discount: '🎁 推荐优惠',
    document_case: '📋 记录病例',
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-sm text-blue-900 font-medium">
        {actionLabels[action] || action}
      </span>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-primary-600">{value}</p>
    </div>
  )
}

function formatMetricName(key: string): string {
  const names: Record<string, string> = {
    forehead_lines: '额头纹',
    glabellar_lines: '眉间纹',
    crows_feet: '鱼尾纹',
    nasolabial_folds: '法令纹',
    tone_evenness: '肤色均匀度',
    pore_size: '毛孔大小',
    radiance: '皮肤光泽',
    pigmentation: '色素沉着',
    apple_muscle_fullness: '苹果肌饱满度',
    jawline_definition: '下颌线清晰度',
    facial_symmetry: '面部对称性',
    facial_firmness: '面部紧致度',
    temple_fullness: '太阳穴饱满度',
    lip_fullness: '嘴唇饱满度',
    tear_trough: '泪沟',
  }
  return names[key] || key
}

function eye_visibility_icon(status?: string) {
  if (status === 'public_shareable') return Eye
  if (status === 'doctor_only' || status === 'hidden') return Lock
  return EyeOff
}

function visibility_color(status?: string) {
  if (status === 'public_shareable') return 'green'
  if (status === 'patient_only') return 'blue'
  if (status === 'doctor_review') return 'yellow'
  return 'red'
}
