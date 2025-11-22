/**
 * API 客户端 - 使用 Axios
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  Patient,
  PatientCreate,
  PatientUpdate,
  PatientsResponse,
  Treatment,
  TreatmentCreate,
  TreatmentUpdate,
  TreatmentsResponse,
  AnalysisResult,
  ApiError,
} from '@/types/api'

// API 基础 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// 创建 Axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 秒超时（AI 分析可能需要更长时间）
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use(
  (config) => {
    // TODO: 添加认证 token
    // const token = localStorage.getItem('auth_token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      // 服务器返回错误状态码
      const apiError: ApiError = {
        detail: error.response.data?.detail || error.message,
        status_code: error.response.status,
      }
      return Promise.reject(apiError)
    } else if (error.request) {
      // 请求发送但没有收到响应
      return Promise.reject({
        detail: '无法连接到服务器，请检查网络连接',
        status_code: 0,
      })
    } else {
      // 其他错误
      return Promise.reject({
        detail: error.message,
        status_code: -1,
      })
    }
  }
)

// ============ 患者 API ============

export const patientsApi = {
  /**
   * 获取诊所的所有患者
   */
  getClinicPatients: async (
    clinicId: string,
    params?: { skip?: number; limit?: number }
  ): Promise<PatientsResponse> => {
    const response = await apiClient.get<PatientsResponse>(
      `/api/v1/patients/clinic/${clinicId}`,
      { params }
    )
    return response.data
  },

  /**
   * 获取单个患者详情
   */
  getPatient: async (patientId: string): Promise<Patient> => {
    const response = await apiClient.get<Patient>(`/api/v1/patients/${patientId}`)
    return response.data
  },

  /**
   * 创建新患者
   */
  createPatient: async (data: PatientCreate): Promise<Patient> => {
    const response = await apiClient.post<Patient>('/api/v1/patients/', data)
    return response.data
  },

  /**
   * 更新患者信息
   */
  updatePatient: async (patientId: string, data: PatientUpdate): Promise<Patient> => {
    const response = await apiClient.put<Patient>(`/api/v1/patients/${patientId}`, data)
    return response.data
  },

  /**
   * 删除患者
   */
  deletePatient: async (patientId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/patients/${patientId}`)
  },
}

// ============ 治疗记录 API ============

export const treatmentsApi = {
  /**
   * 获取患者的所有治疗记录
   */
  getPatientTreatments: async (patientId: string): Promise<TreatmentsResponse> => {
    const response = await apiClient.get<TreatmentsResponse>(
      `/api/v1/treatments/patient/${patientId}`
    )
    return response.data
  },

  /**
   * 获取单个治疗记录详情
   */
  getTreatment: async (treatmentId: string): Promise<Treatment> => {
    const response = await apiClient.get<Treatment>(`/api/v1/treatments/${treatmentId}`)
    return response.data
  },

  /**
   * 创建新治疗记录
   */
  createTreatment: async (data: TreatmentCreate): Promise<Treatment> => {
    const response = await apiClient.post<Treatment>('/api/v1/treatments/', data)
    return response.data
  },

  /**
   * 更新治疗记录
   */
  updateTreatment: async (
    treatmentId: string,
    data: TreatmentUpdate
  ): Promise<Treatment> => {
    const response = await apiClient.put<Treatment>(
      `/api/v1/treatments/${treatmentId}`,
      data
    )
    return response.data
  },

  /**
   * 删除治疗记录
   */
  deleteTreatment: async (treatmentId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/treatments/${treatmentId}`)
  },
}

// ============ AI 分析 API ============

export const analysisApi = {
  /**
   * 上传照片进行 AI 分析
   */
  analyzeUpload: async (formData: FormData): Promise<AnalysisResult> => {
    const response = await apiClient.post<AnalysisResult>(
      '/api/v1/analysis/analyze-upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // AI 分析可能需要 1 分钟
      }
    )
    return response.data
  },

  /**
   * 获取分析结果
   */
  getAnalysisResults: async (analysisId: string): Promise<any> => {
    const response = await apiClient.get(`/api/v1/analysis/results/${analysisId}`)
    return response.data
  },
}

export default apiClient
