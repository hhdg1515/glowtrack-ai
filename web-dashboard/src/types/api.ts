/**
 * API 数据类型定义
 */

// ============ 患者相关 ============

export interface Patient {
  id: string
  clinic_id: string
  patient_id?: string  // 诊所内部ID
  first_name: string
  last_name: string
  date_of_birth?: string
  email?: string
  phone?: string
  skin_type?: string
  total_treatments: number
  created_at?: string
  updated_at?: string
}

export interface PatientCreate {
  clinic_id: string
  patient_id?: string
  first_name: string
  last_name: string
  date_of_birth?: string
  email?: string
  phone?: string
  skin_type?: string
  allergies?: string
}

export interface PatientUpdate extends Partial<PatientCreate> {}

export interface PatientsResponse {
  clinic_id: string
  patients: Patient[]
  total: number
}

// ============ 治疗记录相关 ============

export interface Treatment {
  treatment_id: string
  patient_id: string
  provider_id: string
  treatment_date: string
  treatment_type: string
  treatment_area: string
  product_name?: string
  product_amount?: string
  cost?: number
  notes?: string
  photos_count: number
  created_at?: string
  updated_at?: string
}

export interface TreatmentCreate {
  patient_id: string
  provider_id: string
  treatment_date: string
  treatment_type: string
  treatment_area: string
  product_name?: string
  product_amount?: string
  cost?: number
  notes?: string
}

export interface TreatmentUpdate extends Partial<TreatmentCreate> {}

export interface TreatmentsResponse {
  patient_id: string
  treatments: Treatment[]
}

// ============ AI 分析相关 ============

export interface AnalysisMetrics {
  wrinkles?: {
    score: number
    improvement_percentage: number
    details: string
  }
  skin_quality?: {
    score: number
    improvement_percentage: number
    details: string
  }
  facial_contour?: {
    score: number
    improvement_percentage: number
    details: string
  }
  volume?: {
    score: number
    improvement_percentage: number
    details: string
  }
}

export interface Risk {
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
  recommendation: string
}

export interface DoctorAlert {
  level: 'info' | 'warning' | 'critical'
  message: string
  action_required: boolean
}

export interface PatientReport {
  summary: string
  visible_metrics: AnalysisMetrics
  recommendations: string[]
}

export interface DoctorView {
  full_analysis: AnalysisMetrics
  effect_level: 'excellent' | 'good' | 'fair' | 'poor' | 'negative'
  visibility_status: 'full_visible' | 'partial_visible' | 'doctor_only'
  risks: Risk[]
  alerts: DoctorAlert[]
  suggested_actions: string[]
  timing_status: string
}

export interface AnalysisResult {
  success: boolean
  processing_time_ms: number
  patient_report?: PatientReport
  doctor_view: DoctorView
  metadata: {
    days_after_treatment: number
    api_cost: number
    model: string
  }
}

// ============ API 响应类型 ============

export interface ApiError {
  detail: string
  status_code?: number
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}
