'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Image, Scan, Brain, FileText, CheckCircle, Loader2 } from 'lucide-react'

interface AnalysisStep {
  id: string
  label: string
  icon: any
  duration: number // 毫秒
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'upload',
    label: '上传照片',
    icon: Image,
    duration: 500,
  },
  {
    id: 'detect',
    label: '检测人脸特征',
    icon: Scan,
    duration: 1500,
  },
  {
    id: 'align',
    label: '智能对齐图像',
    icon: Sparkles,
    duration: 1000,
  },
  {
    id: 'analyze',
    label: 'AI 深度分析中',
    icon: Brain,
    duration: 5000,
  },
  {
    id: 'generate',
    label: '生成智能报告',
    icon: FileText,
    duration: 2000,
  },
]

interface AIAnalysisLoaderProps {
  onComplete?: () => void
  estimatedTime?: number // 秒
}

export default function AIAnalysisLoader({ onComplete, estimatedTime = 10 }: AIAnalysisLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    // 进度条动画
    const totalDuration = ANALYSIS_STEPS.reduce((sum, step) => sum + step.duration, 0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / totalDuration) * 50
        return next >= 100 ? 100 : next
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // 步骤切换
    const currentStep = ANALYSIS_STEPS[currentStepIndex]
    if (!currentStep) return

    const timer = setTimeout(() => {
      if (currentStepIndex < ANALYSIS_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1)
      } else if (onComplete) {
        onComplete()
      }
    }, currentStep.duration)

    return () => clearTimeout(timer)
  }, [currentStepIndex, onComplete])

  useEffect(() => {
    // 计时器
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const remainingTime = Math.max(0, estimatedTime - elapsedTime)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4 animate-pulse-slow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">AI 正在分析中...</h2>
          <p className="text-gray-600">请稍候，我们正在使用 Claude Vision 进行专业医美分析</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">分析进度</span>
            <span className="font-semibold text-primary-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {ANALYSIS_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const isPending = index > currentStepIndex

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-500 ease-out transform ${
                  isCurrent
                    ? 'bg-primary-50 border-2 border-primary-300 scale-105 shadow-lg'
                    : isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200 opacity-60'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slide-in 0.5s ease-out forwards',
                }}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-primary-600 text-white shadow-primary-glow'
                      : isCompleted
                      ? 'bg-green-600 text-white scale-110'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 animate-check-success" />
                  ) : isCurrent ? (
                    <step.icon className="w-6 h-6 animate-pulse-scale" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1">
                  <h4
                    className={`font-semibold ${
                      isCurrent ? 'text-primary-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <p className="text-sm text-primary-600 animate-pulse">处理中...</p>
                  )}
                  {isCompleted && (
                    <p className="text-sm text-green-600">✓ 已完成</p>
                  )}
                </div>

                {isCurrent && (
                  <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                )}
              </div>
            )
          })}
        </div>

        {/* Time Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>已用时 {elapsedTime} 秒</span>
          </div>
          <div>
            预计剩余 <span className="font-semibold text-primary-600">{remainingTime}</span> 秒
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 提示：</span>
            我们正在使用最先进的 Claude 3.5 Sonnet 视觉模型分析您的照片，
            包括皱纹、肤质、面部轮廓等多个维度的专业评估。
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes check-success {
          0% {
            transform: scale(0.8) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-check-success {
          animation: check-success 0.4s ease-out;
        }

        .animate-pulse-scale {
          animation: pulse-scale 1.5s ease-in-out infinite;
        }

        .shadow-primary-glow {
          box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
        }
      `}</style>
    </div>
  )
}
