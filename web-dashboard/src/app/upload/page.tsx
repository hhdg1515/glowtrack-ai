'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar
} from 'lucide-react'

interface UploadedImage {
  file: File
  preview: string
}

export default function UploadPage() {
  const router = useRouter()
  const [beforeImage, setBeforeImage] = useState<UploadedImage | null>(null)
  const [afterImage, setAfterImage] = useState<UploadedImage | null>(null)
  const [treatmentType, setTreatmentType] = useState('')
  const [treatmentDate, setTreatmentDate] = useState('')
  const [patientId, setPatientId] = useState('')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = (file: File, type: 'before' | 'after') => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB')
      return
    }

    const preview = URL.createObjectURL(file)
    const uploadedImage = { file, preview }

    if (type === 'before') {
      setBeforeImage(uploadedImage)
    } else {
      setAfterImage(uploadedImage)
    }
    setError(null)
  }

  // 处理拖拽上传
  const handleDrop = (e: React.DragEvent, type: 'before' | 'after') => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file, type)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // 移除图片
  const removeImage = (type: 'before' | 'after') => {
    if (type === 'before') {
      if (beforeImage) URL.revokeObjectURL(beforeImage.preview)
      setBeforeImage(null)
    } else {
      if (afterImage) URL.revokeObjectURL(afterImage.preview)
      setAfterImage(null)
    }
  }

  // 提交分析
  const handleAnalyze = async () => {
    if (!beforeImage || !afterImage) {
      setError('请上传术前和术后照片')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('before_image', beforeImage.file)
      formData.append('after_image', afterImage.file)

      if (treatmentType) formData.append('treatment_type', treatmentType)
      if (treatmentDate) formData.append('treatment_date', treatmentDate)
      if (patientId) formData.append('patient_id', patientId)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/analysis/analyze-upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '分析失败')
      }

      const result = await response.json()
      setAnalysisResult(result)

      // 分析成功后跳转到结果页面
      // 暂时存储到 localStorage，实际应该存到数据库并通过ID获取
      localStorage.setItem('latest_analysis', JSON.stringify(result))

      // 延迟跳转以显示成功状态
      setTimeout(() => {
        router.push('/analysis/result')
      }, 1500)

    } catch (err: any) {
      setError(err.message || '分析过程中出现错误，请重试')
      setIsAnalyzing(false)
    }
  }

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
              <Link href="/upload" className="text-primary-600 font-semibold">
                上传分析
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回 Dashboard
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">AI 术前术后分析</h2>
          <p className="text-gray-600">上传照片，让 AI 为您量化分析治疗效果</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">错误</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {analysisResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">分析完成！</h4>
              <p className="text-sm text-green-700">正在跳转到结果页面...</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="card mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">上传照片</h3>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Before Image Upload */}
            <UploadBox
              title="术前照片"
              subtitle="拍摄于治疗前"
              image={beforeImage}
              onDrop={(e) => handleDrop(e, 'before')}
              onDragOver={handleDragOver}
              onClick={() => beforeInputRef.current?.click()}
              onRemove={() => removeImage('before')}
              inputRef={beforeInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'before')}
            />

            {/* After Image Upload */}
            <UploadBox
              title="术后照片"
              subtitle="拍摄于治疗后"
              image={afterImage}
              onDrop={(e) => handleDrop(e, 'after')}
              onDragOver={handleDragOver}
              onClick={() => afterInputRef.current?.click()}
              onRemove={() => removeImage('after')}
              inputRef={afterInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'after')}
              accent="secondary"
            />
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">治疗信息（可选）</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  治疗类型
                </label>
                <select
                  value={treatmentType}
                  onChange={(e) => setTreatmentType(e.target.value)}
                  className="input-field"
                >
                  <option value="">请选择</option>
                  <option value="肉毒素注射">肉毒素注射</option>
                  <option value="玻尿酸填充">玻尿酸填充</option>
                  <option value="激光美肤">激光美肤</option>
                  <option value="线雕提升">线雕提升</option>
                  <option value="化学换肤">化学换肤</option>
                  <option value="微针治疗">微针治疗</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  治疗日期
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={treatmentDate}
                    onChange={(e) => setTreatmentDate(e.target.value)}
                    className="input-field pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  患者编号
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="例如: P12345"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>• 支持 JPG, PNG 格式</p>
            <p>• 文件大小不超过 10MB</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                removeImage('before')
                removeImage('after')
                setTreatmentType('')
                setTreatmentDate('')
                setPatientId('')
              }}
              className="btn-secondary"
              disabled={isAnalyzing}
            >
              重置
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!beforeImage || !afterImage || isAnalyzing}
              className="btn-primary flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>分析中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>开始 AI 分析</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3">📸 拍照建议</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ 确保光线充足且均匀</li>
            <li>✓ 保持相同的拍摄角度和距离</li>
            <li>✓ 面部表情自然，不要过度用力</li>
            <li>✓ 背景简洁，避免杂乱</li>
            <li>✓ 建议在治疗后 2-4 周拍摄术后照片</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Upload Box Component
function UploadBox({
  title,
  subtitle,
  image,
  onDrop,
  onDragOver,
  onClick,
  onRemove,
  inputRef,
  onChange,
  accent = 'primary'
}: {
  title: string
  subtitle: string
  image: UploadedImage | null
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onClick: () => void
  onRemove: () => void
  inputRef: React.RefObject<HTMLInputElement>
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  accent?: 'primary' | 'secondary'
}) {
  const accentColor = accent === 'primary' ? 'primary' : 'secondary'

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{subtitle}</p>

      {image ? (
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
          <img
            src={image.preview}
            alt={title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className={`absolute top-3 left-3 px-3 py-1 bg-${accentColor}-600 text-white rounded-full text-sm font-semibold`}>
            {title}
          </div>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={onClick}
          className={`
            aspect-[3/4] border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center
            cursor-pointer transition-all
            hover:border-${accentColor}-500 hover:bg-${accentColor}-50
            border-gray-300 bg-gray-50
          `}
        >
          <Upload className={`h-12 w-12 text-gray-400 mb-3`} />
          <p className="font-medium text-gray-700 mb-1">点击上传或拖拽文件</p>
          <p className="text-sm text-gray-500">JPG, PNG (最大 10MB)</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
    </div>
  )
}
