/**
 * TypeScript类型定义
 */

export interface Patient {
  id: string
  clinic_id: string
  patient_id?: string
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

export interface Treatment {
  id: string
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

export interface Photo {
  id: string
  treatment_id: string
  patient_id: string
  photo_type: 'before' | 'after_2weeks' | 'after_1month' | 'after_3months'
  photo_angle: 'front' | 'left45' | 'right45' | 'left90' | 'right90'
  original_url: string
  processed_url?: string
  thumbnail_url?: string
  face_detected: boolean
  quality_score?: number
  captured_at?: string
  created_at?: string
}

export interface WrinkleAnalysis {
  count_before: number
  count_after: number
  reduction_pct: number
  depth_before_mm?: number
  depth_after_mm?: number
  depth_reduction_pct?: number
}

export interface SkinToneAnalysis {
  evenness_before: number
  evenness_after: number
  improvement_pct: number
  brightness_before?: number
  brightness_after?: number
  redness_reduction_pct?: number
}

export interface TextureAnalysis {
  smoothness_before: number
  smoothness_after: number
  improvement_pct: number
}

export interface PoreAnalysis {
  average_size_before: number
  average_size_after: number
  reduction_pct: number
  visibility_score_before?: number
  visibility_score_after?: number
}

export interface AnalysisImprovements {
  wrinkles?: WrinkleAnalysis & { score: number }
  skin_tone?: SkinToneAnalysis & { score: number }
  texture?: TextureAnalysis & { score: number }
  pores?: PoreAnalysis & { score: number }
  overall_score: number
}

export interface AnalysisResult {
  id: string
  treatment_id: string
  patient_id: string
  before_photo_id: string
  after_photo_id: string
  days_elapsed: number
  improvements: AnalysisImprovements
  comparison_image_url?: string
  side_by_side_url?: string
  ai_confidence_score?: number
  analyzed_at?: string
  created_at?: string
}

export interface Report {
  id: string
  analysis_id: string
  treatment_id: string
  patient_id: string
  report_type: 'doctor' | 'patient' | 'social_media'
  report_format: 'pdf' | 'html' | 'image'
  file_url: string
  share_url?: string
  thumbnail_url?: string
  view_count: number
  download_count: number
  share_count: number
  generated_at?: string
  created_at?: string
}

export interface Clinic {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  subscription_tier: 'starter' | 'professional' | 'premium'
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled'
  monthly_analysis_limit: number
  analysis_count_current_month: number
  created_at?: string
  updated_at?: string
}

export interface ClinicAnalytics {
  clinic_id: string
  total_patients: number
  total_treatments: number
  total_analyses: number
  total_reports: number
  average_satisfaction: number
  recommendation_rate: number
  social_share_rate: number
}

export interface Provider {
  id: string
  clinic_id: string
  first_name: string
  last_name: string
  email: string
  role: 'doctor' | 'nurse' | 'admin' | 'staff'
  specialization?: string
  is_active: boolean
}

// API响应类型
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  skip: number
  limit: number
}

// 表单类型
export interface PatientFormData {
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

export interface TreatmentFormData {
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
