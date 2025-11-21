-- GlowTrack AI Database Schema
-- PostgreSQL / Supabase

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 诊所表
-- ============================================
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,

  -- 品牌设置
  logo_url TEXT,
  brand_color VARCHAR(20) DEFAULT '#4F46E5',

  -- 订阅信息
  subscription_tier VARCHAR(50) DEFAULT 'starter', -- starter, professional, premium
  subscription_status VARCHAR(50) DEFAULT 'active', -- active, inactive, trial, cancelled
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,

  -- 配额
  monthly_analysis_limit INTEGER DEFAULT 50,
  analysis_count_current_month INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 诊所索引
CREATE INDEX idx_clinics_email ON clinics(email);
CREATE INDEX idx_clinics_subscription_status ON clinics(subscription_status);

-- ============================================
-- 医生/员工表
-- ============================================
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,

  -- 基本信息
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),

  -- 角色
  role VARCHAR(50) NOT NULL, -- doctor, nurse, admin, staff
  specialization VARCHAR(100), -- Dermatologist, Plastic Surgeon, etc.

  -- 认证
  license_number VARCHAR(100),

  -- 状态
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 医生索引
CREATE INDEX idx_providers_clinic_id ON providers(clinic_id);
CREATE INDEX idx_providers_email ON providers(email);

-- ============================================
-- 患者表
-- ============================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,

  -- 基本信息
  patient_id VARCHAR(100), -- 诊所内部ID
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  email VARCHAR(255),
  phone VARCHAR(50),

  -- 医疗信息
  skin_type VARCHAR(50), -- I, II, III, IV, V, VI (Fitzpatrick scale)
  skin_concerns TEXT[], -- Array of concerns
  allergies TEXT,
  medical_history TEXT,

  -- 偏好设置
  marketing_consent BOOLEAN DEFAULT false,
  social_share_consent BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,

  -- 隐私级别
  privacy_level VARCHAR(50) DEFAULT 'standard', -- private, standard, public

  -- 状态
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- 确保同一诊所内patient_id唯一
  UNIQUE(clinic_id, patient_id)
);

-- 患者索引
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);

-- ============================================
-- 治疗记录表
-- ============================================
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,

  -- 治疗信息
  treatment_date DATE NOT NULL,
  treatment_type VARCHAR(100) NOT NULL, -- Botox, Filler, Laser, Chemical Peel, Microneedling, etc.
  treatment_area VARCHAR(100), -- Forehead, Lips, Cheeks, etc.
  treatment_subtype VARCHAR(100), -- Specific details

  -- 产品信息
  product_name VARCHAR(100),
  product_brand VARCHAR(100),
  product_amount VARCHAR(50), -- "20 units", "1 syringe", "1ml"
  batch_number VARCHAR(100),

  -- 治疗细节
  injection_points INTEGER,
  dilution_ratio VARCHAR(50),
  technique VARCHAR(100),

  -- 费用
  cost DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',

  -- 笔记
  notes TEXT,
  pre_treatment_notes TEXT,
  post_treatment_instructions TEXT,

  -- 预期效果
  expected_duration_days INTEGER, -- 预期持续时间
  expected_results TEXT,

  -- 后续
  follow_up_date DATE,
  follow_up_completed BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 治疗记录索引
CREATE INDEX idx_treatments_patient_id ON treatments(patient_id);
CREATE INDEX idx_treatments_provider_id ON treatments(provider_id);
CREATE INDEX idx_treatments_clinic_id ON treatments(clinic_id);
CREATE INDEX idx_treatments_date ON treatments(treatment_date);
CREATE INDEX idx_treatments_type ON treatments(treatment_type);

-- ============================================
-- 照片表
-- ============================================
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,

  -- 照片类型
  photo_type VARCHAR(50) NOT NULL, -- before, after_2weeks, after_1month, after_3months
  photo_angle VARCHAR(50) NOT NULL, -- front, left45, right45, left90, right90, top, bottom

  -- 文件信息
  original_url TEXT NOT NULL,
  processed_url TEXT,
  thumbnail_url TEXT,
  file_size_bytes BIGINT,
  image_width INTEGER,
  image_height INTEGER,

  -- 拍摄元数据
  capture_distance DECIMAL(5,2), -- 距离（米）
  lighting_score DECIMAL(3,2), -- 0-1，光线质量评分
  alignment_score DECIMAL(3,2), -- 0-1，对齐质量评分
  sharpness_score DECIMAL(3,2), -- 0-1，清晰度评分

  -- 相机信息
  camera_model VARCHAR(100),
  camera_settings JSONB, -- ISO, aperture, shutter speed, etc.

  -- 人脸检测结果
  face_detected BOOLEAN DEFAULT false,
  face_landmarks JSONB, -- MediaPipe landmarks
  face_bounding_box JSONB, -- {x, y, width, height}

  -- 环境信息
  ambient_lighting VARCHAR(50), -- natural, artificial, mixed
  background_type VARCHAR(50), -- plain, busy, outdoor, indoor

  captured_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 照片索引
CREATE INDEX idx_photos_treatment_id ON photos(treatment_id);
CREATE INDEX idx_photos_patient_id ON photos(patient_id);
CREATE INDEX idx_photos_clinic_id ON photos(clinic_id);
CREATE INDEX idx_photos_type_angle ON photos(photo_type, photo_angle);

-- ============================================
-- AI分析结果表
-- ============================================
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,

  -- 对比照片
  before_photo_id UUID REFERENCES photos(id),
  after_photo_id UUID REFERENCES photos(id),

  -- 时间跨度
  days_elapsed INTEGER,

  -- AI分析结果（JSONB格式）
  improvements JSONB NOT NULL,
  /*
  示例结构:
  {
    "wrinkles": {
      "forehead": {
        "count_before": 5,
        "count_after": 2,
        "count_reduction_pct": 60,
        "depth_before_mm": 2.8,
        "depth_after_mm": 1.1,
        "depth_reduction_pct": 62
      },
      "glabella": {...},
      "crows_feet": {...}
    },
    "skin_tone": {
      "evenness_before": 0.65,
      "evenness_after": 0.87,
      "improvement_pct": 34,
      "redness_reduction_pct": 28
    },
    "skin_texture": {
      "smoothness_before": 0.62,
      "smoothness_after": 0.85,
      "improvement_pct": 37
    },
    "pores": {
      "average_size_before": 2.3,
      "average_size_after": 1.8,
      "size_reduction_pct": 22,
      "visibility_reduction_pct": 38
    },
    "pigmentation": {
      "spots_count_before": 23,
      "spots_count_after": 11,
      "reduction_pct": 52
    },
    "contour": {
      "apple_cheek_lift_mm": 2.3,
      "jawline_definition_improvement_pct": 55,
      "nasolabial_fold_depth_reduction_pct": 40
    },
    "volume": {
      "lips_volume_increase_pct": 18,
      "cheek_fullness_increase_pct": 28
    },
    "overall_score": 8.5
  }
  */

  -- 对比图像
  comparison_image_url TEXT,
  side_by_side_url TEXT,
  annotated_image_url TEXT,

  -- AI模型信息
  ai_model_version VARCHAR(50),
  ai_confidence_score DECIMAL(3,2), -- 0-1

  -- 处理信息
  processing_time_ms INTEGER,

  -- 医生审核
  doctor_reviewed BOOLEAN DEFAULT false,
  doctor_notes TEXT,
  doctor_adjusted_score DECIMAL(3,2),

  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 分析结果索引
CREATE INDEX idx_analysis_treatment_id ON analysis_results(treatment_id);
CREATE INDEX idx_analysis_patient_id ON analysis_results(patient_id);
CREATE INDEX idx_analysis_clinic_id ON analysis_results(clinic_id);

-- ============================================
-- 报告表
-- ============================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES analysis_results(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,

  -- 报告类型
  report_type VARCHAR(50) NOT NULL, -- doctor, patient, social_media
  report_format VARCHAR(50) NOT NULL, -- pdf, html, image

  -- 文件信息
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  thumbnail_url TEXT,

  -- 分享信息
  share_url TEXT UNIQUE,
  share_token VARCHAR(100) UNIQUE,
  is_public BOOLEAN DEFAULT false,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,

  -- 统计
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- 社交媒体分享追踪
  shared_to_platforms TEXT[], -- ['instagram', 'facebook', 'xiaohongshu', 'wechat']
  first_shared_at TIMESTAMP,
  last_shared_at TIMESTAMP,

  -- 报告设置
  include_patient_name BOOLEAN DEFAULT true,
  include_treatment_details BOOLEAN DEFAULT true,
  include_clinic_branding BOOLEAN DEFAULT true,
  watermark_enabled BOOLEAN DEFAULT true,

  -- 隐私设置
  blur_eyes BOOLEAN DEFAULT false,
  anonymize_patient BOOLEAN DEFAULT false,

  -- 过期设置
  expires_at TIMESTAMP,
  is_expired BOOLEAN DEFAULT false,

  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 报告索引
CREATE INDEX idx_reports_analysis_id ON reports(analysis_id);
CREATE INDEX idx_reports_patient_id ON reports(patient_id);
CREATE INDEX idx_reports_clinic_id ON reports(clinic_id);
CREATE INDEX idx_reports_share_token ON reports(share_token);

-- ============================================
-- 患者满意度评分表
-- ============================================
CREATE TABLE satisfaction_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,

  -- 评分（1-10）
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 10),

  -- 细分评分
  treatment_effectiveness_rating INTEGER CHECK (treatment_effectiveness_rating >= 1 AND treatment_effectiveness_rating <= 10),
  staff_friendliness_rating INTEGER CHECK (staff_friendliness_rating >= 1 AND staff_friendliness_rating <= 10),
  clinic_cleanliness_rating INTEGER CHECK (clinic_cleanliness_rating >= 1 AND clinic_cleanliness_rating <= 10),
  value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 10),

  -- NPS (Net Promoter Score)
  would_recommend BOOLEAN,
  likelihood_to_recommend INTEGER CHECK (likelihood_to_recommend >= 0 AND likelihood_to_recommend <= 10),

  -- 反馈
  positive_feedback TEXT,
  negative_feedback TEXT,
  suggestions TEXT,

  -- 效果可见性
  can_see_difference BOOLEAN,
  met_expectations BOOLEAN,

  -- 社交媒体意愿
  willing_to_share BOOLEAN DEFAULT false,
  shared_on_social_media BOOLEAN DEFAULT false,

  rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 满意度索引
CREATE INDEX idx_satisfaction_treatment_id ON satisfaction_ratings(treatment_id);
CREATE INDEX idx_satisfaction_patient_id ON satisfaction_ratings(patient_id);
CREATE INDEX idx_satisfaction_clinic_id ON satisfaction_ratings(clinic_id);
CREATE INDEX idx_satisfaction_rating ON satisfaction_ratings(overall_rating);

-- ============================================
-- 系统日志表
-- ============================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID, -- Could be provider_id or system

  -- 活动信息
  activity_type VARCHAR(100) NOT NULL, -- login, photo_upload, analysis_run, report_generated, etc.
  entity_type VARCHAR(50), -- patient, treatment, photo, report
  entity_id UUID,

  -- 详情
  description TEXT,
  metadata JSONB,

  -- IP和设备
  ip_address VARCHAR(50),
  user_agent TEXT,
  device_type VARCHAR(50), -- mobile, tablet, desktop

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 日志索引
CREATE INDEX idx_activity_logs_clinic_id ON activity_logs(clinic_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_activity_type ON activity_logs(activity_type);

-- ============================================
-- 视图：患者治疗摘要
-- ============================================
CREATE VIEW patient_treatment_summary AS
SELECT
  p.id AS patient_id,
  p.first_name,
  p.last_name,
  p.clinic_id,
  COUNT(DISTINCT t.id) AS total_treatments,
  COUNT(DISTINCT ph.id) AS total_photos,
  COUNT(DISTINCT ar.id) AS total_analyses,
  MAX(t.treatment_date) AS last_treatment_date,
  AVG(sr.overall_rating) AS average_satisfaction,
  SUM(t.cost) AS total_spent
FROM patients p
LEFT JOIN treatments t ON p.id = t.patient_id
LEFT JOIN photos ph ON t.id = ph.treatment_id
LEFT JOIN analysis_results ar ON t.id = ar.treatment_id
LEFT JOIN satisfaction_ratings sr ON t.id = sr.treatment_id
GROUP BY p.id, p.first_name, p.last_name, p.clinic_id;

-- ============================================
-- 视图：诊所Analytics
-- ============================================
CREATE VIEW clinic_analytics AS
SELECT
  c.id AS clinic_id,
  c.name AS clinic_name,
  COUNT(DISTINCT p.id) AS total_patients,
  COUNT(DISTINCT t.id) AS total_treatments,
  COUNT(DISTINCT ar.id) AS total_analyses,
  COUNT(DISTINCT r.id) AS total_reports,
  AVG(sr.overall_rating) AS average_satisfaction,
  COUNT(DISTINCT CASE WHEN sr.would_recommend = true THEN sr.id END)::FLOAT /
    NULLIF(COUNT(DISTINCT sr.id), 0) * 100 AS recommendation_rate,
  COUNT(DISTINCT CASE WHEN sr.shared_on_social_media = true THEN sr.id END)::FLOAT /
    NULLIF(COUNT(DISTINCT sr.id), 0) * 100 AS social_share_rate
FROM clinics c
LEFT JOIN patients p ON c.id = p.clinic_id
LEFT JOIN treatments t ON c.id = t.clinic_id
LEFT JOIN analysis_results ar ON c.id = ar.clinic_id
LEFT JOIN reports r ON c.id = r.clinic_id
LEFT JOIN satisfaction_ratings sr ON c.id = sr.clinic_id
GROUP BY c.id, c.name;

-- ============================================
-- 函数：更新updated_at时间戳
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 示例数据（用于测试）
-- ============================================

-- 插入示例诊所
INSERT INTO clinics (name, email, phone, subscription_tier, subscription_status)
VALUES ('ABC Medical Spa', 'contact@abcmedspa.com', '(555) 123-4567', 'professional', 'active');

-- 结束
