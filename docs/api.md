# GlowTrack AI - API文档

## 基本信息

**Base URL**: `http://localhost:8000/api/v1`

**认证方式**: Bearer Token

所有需要认证的请求都应在header中包含：
```
Authorization: Bearer {your_token}
```

---

## 患者管理 API

### 获取诊所的所有患者

```http
GET /patients/clinic/{clinic_id}
```

**Query参数**:
- `skip` (可选): 跳过的记录数，默认0
- `limit` (可选): 返回的记录数，默认100

**响应示例**:
```json
{
  "clinic_id": "uuid",
  "patients": [
    {
      "id": "uuid",
      "clinic_id": "uuid",
      "patient_id": "P-001",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane@example.com",
      "total_treatments": 3
    }
  ],
  "total": 50
}
```

### 创建患者

```http
POST /patients
```

**请求体**:
```json
{
  "clinic_id": "uuid",
  "patient_id": "P-001",
  "first_name": "Jane",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "skin_type": "II",
  "allergies": "None"
}
```

### 获取患者详情

```http
GET /patients/{patient_id}
```

### 更新患者

```http
PUT /patients/{patient_id}
```

### 删除患者

```http
DELETE /patients/{patient_id}
```

---

## 治疗管理 API

### 创建治疗记录

```http
POST /treatments
```

**请求体**:
```json
{
  "patient_id": "uuid",
  "provider_id": "uuid",
  "treatment_date": "2024-01-15",
  "treatment_type": "Botox",
  "treatment_area": "Forehead",
  "product_name": "Botox Cosmetic",
  "product_amount": "20 units",
  "cost": 500.00,
  "notes": "Patient tolerated well"
}
```

**响应示例**:
```json
{
  "treatment_id": "uuid",
  "patient_id": "uuid",
  "provider_id": "uuid",
  "treatment_date": "2024-01-15",
  "treatment_type": "Botox",
  "treatment_area": "Forehead",
  "photos_count": 0
}
```

### 获取患者的所有治疗

```http
GET /treatments/patient/{patient_id}
```

### 获取治疗详情

```http
GET /treatments/{treatment_id}
```

---

## 照片管理 API

### 上传照片

```http
POST /photos/upload
```

**Content-Type**: `multipart/form-data`

**表单字段**:
- `file`: 图像文件
- `treatment_id`: 治疗ID
- `photo_type`: before | after_2weeks | after_1month | after_3months
- `photo_angle`: front | left45 | right45 | left90 | right90

**响应示例**:
```json
{
  "photo_id": "uuid",
  "treatment_id": "uuid",
  "photo_type": "before",
  "photo_angle": "front",
  "original_url": "https://...",
  "processed_url": null,
  "thumbnail_url": "https://...",
  "face_detected": true,
  "quality_score": 0.95
}
```

### 处理照片

```http
POST /photos/process/{photo_id}
```

对上传的照片进行AI处理（对齐、标准化等）

**响应示例**:
```json
{
  "photo_id": "uuid",
  "status": "processed",
  "processed_url": "https://..."
}
```

### 获取治疗的所有照片

```http
GET /photos/treatment/{treatment_id}
```

---

## AI分析 API

### 术前术后对比分析

```http
POST /analysis/compare
```

**请求体**:
```json
{
  "treatment_id": "uuid",
  "before_photo_id": "uuid",
  "after_photo_id": "uuid",
  "analysis_types": ["wrinkles", "skin_tone", "texture", "pores"]
}
```

**响应示例**:
```json
{
  "analysis_id": "uuid",
  "treatment_id": "uuid",
  "improvements": {
    "wrinkles": {
      "overall": {
        "count_before": 45,
        "count_after": 18,
        "reduction_pct": 60
      },
      "regions": {
        "forehead": {
          "count_before": 25,
          "count_after": 8,
          "reduction_pct": 68
        }
      },
      "score": 6.0
    },
    "skin_tone": {
      "evenness_before": 0.65,
      "evenness_after": 0.87,
      "improvement_pct": 34,
      "score": 3.4
    },
    "texture": {
      "smoothness_before": 0.62,
      "smoothness_after": 0.85,
      "improvement_pct": 37,
      "score": 3.7
    },
    "pores": {
      "reduction_pct": 38,
      "score": 3.8
    },
    "overall_score": 8.5
  },
  "confidence_score": 0.92,
  "processing_time_ms": 8500,
  "comparison_image_url": "https://..."
}
```

### 获取分析结果

```http
GET /analysis/results/{analysis_id}
```

### 批量分析

```http
POST /analysis/batch
```

**请求体**:
```json
{
  "treatment_ids": ["uuid1", "uuid2", "uuid3"]
}
```

---

## 报告生成 API

### 生成报告

```http
POST /reports/generate
```

**请求体**:
```json
{
  "analysis_id": "uuid",
  "report_type": "patient",
  "report_format": "pdf",
  "include_patient_name": true,
  "blur_eyes": false,
  "custom_message": "Thank you for choosing our clinic!"
}
```

**报告类型**:
- `doctor`: 医生版（详细数据）
- `patient`: 患者版（精美可分享）
- `social_media`: 社交媒体版（Instagram/小红书优化）

**报告格式**:
- `pdf`: PDF文档
- `html`: HTML网页
- `image`: 图像（JPG/PNG）

**响应示例**:
```json
{
  "report_id": "uuid",
  "analysis_id": "uuid",
  "report_type": "patient",
  "report_format": "pdf",
  "file_url": "https://.../report.pdf",
  "share_url": "https://.../share/abc123",
  "thumbnail_url": "https://.../thumb.jpg"
}
```

### 获取报告

```http
GET /reports/{report_id}
```

### 创建分享链接

```http
POST /reports/{report_id}/share
```

**请求体**:
```json
{
  "password": "optional_password"
}
```

### 访问分享的报告

```http
GET /reports/share/{share_token}
```

公开访问，不需要认证

---

## 诊所管理 API

### 获取诊所信息

```http
GET /clinics/{clinic_id}
```

**响应示例**:
```json
{
  "id": "uuid",
  "name": "ABC Medical Spa",
  "email": "contact@abc.com",
  "subscription_tier": "professional",
  "subscription_status": "active",
  "monthly_analysis_limit": 150,
  "analysis_count_current_month": 42
}
```

### 获取诊所Analytics

```http
GET /clinics/{clinic_id}/analytics
```

**响应示例**:
```json
{
  "clinic_id": "uuid",
  "total_patients": 120,
  "total_treatments": 450,
  "total_analyses": 380,
  "total_reports": 320,
  "average_satisfaction": 8.7,
  "recommendation_rate": 85.5,
  "social_share_rate": 42.3
}
```

---

## 错误响应

所有API在出错时返回标准错误格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

**HTTP状态码**:
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 速率限制

- 免费层: 100 请求/小时
- Starter: 1000 请求/小时
- Professional: 5000 请求/小时
- Premium: 无限制

超过限制会返回 `429 Too Many Requests`

---

## Webhooks（计划中）

未来版本将支持Webhook，在以下事件发生时通知您的服务器：

- `photo.uploaded`: 照片上传完成
- `analysis.completed`: 分析完成
- `report.generated`: 报告生成完成
- `patient.created`: 新患者创建

---

## SDK和代码示例

### JavaScript/TypeScript

```typescript
import { patientApi, analysisApi } from '@/lib/api'

// 创建患者
const patient = await patientApi.create({
  clinic_id: 'clinic-123',
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com'
})

// 运行分析
const analysis = await analysisApi.compare({
  treatment_id: 'treatment-123',
  before_photo_id: 'photo-before',
  after_photo_id: 'photo-after'
})
```

### Python

```python
import requests

API_URL = "http://localhost:8000/api/v1"
TOKEN = "your_token"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# 创建患者
response = requests.post(
    f"{API_URL}/patients",
    headers=headers,
    json={
        "clinic_id": "clinic-123",
        "first_name": "Jane",
        "last_name": "Doe"
    }
)
patient = response.json()
```

---

## 更新日志

### v1.0.0 (2024-11-21)
- 初始版本发布
- 患者、治疗、照片管理API
- AI分析和报告生成API
- 诊所管理和Analytics

---

## 支持

如有问题，请联系：
- Email: support@glowtrack.ai
- 文档: https://docs.glowtrack.ai
- GitHub Issues: https://github.com/glowtrack/glowtrack-ai/issues
