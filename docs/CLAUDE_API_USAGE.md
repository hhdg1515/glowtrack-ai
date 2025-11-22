# Claude API 医美分析使用指南

## 概述

GlowTrack AI 使用 **Claude 3.5 Sonnet Vision API** 作为主要的医美术前术后分析引擎。Claude 能够理解语义概念，提供专业的医美评估。

## 为什么选择 Claude API？

### ✅ 优势

1. **语义理解能力强**
   - 可以分析"苹果肌饱满度"、"下颌线清晰度"等抽象概念
   - 无需专门训练医美模型，直接使用通用视觉模型

2. **分析维度全面**
   - 皱纹分析（额头纹、眉间纹、鱼尾纹、法令纹）
   - 肤质分析（肤色均匀度、毛孔、光泽、色斑）
   - 面部轮廓（苹果肌、下颌线、对称性、紧致度）
   - 体积与饱满度（太阳穴、嘴唇、泪沟）

3. **输出结构化**
   - 返回标准 JSON 格式
   - 包含评分、改善百分比、专业描述

4. **成本可控**
   - 每次分析约 $0.02-0.05
   - 可根据用户等级选择是否使用

### ❌ 注意事项

- 需要网络连接调用 API
- 有一定延迟（通常 3-8 秒）
- 需要管理 API 配额

---

## 快速开始

### 1. 获取 Claude API Key

访问 [Anthropic Console](https://console.anthropic.com/) 注册并获取 API Key

### 2. 配置环境变量

```bash
# 在 backend/.env 文件中添加
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxx
```

### 3. 安装依赖

```bash
cd backend
pip install anthropic opencv-python numpy
```

### 4. 运行示例代码

```python
from app.ai.claude_analyzer import analyze_before_after

# 分析术前术后照片
result = analyze_before_after(
    before_image_path="path/to/before.jpg",
    after_image_path="path/to/after.jpg",
    api_key="your-api-key",
    treatment_type="肉毒素注射"
)

# 查看结果
print(result['overall_assessment']['overall_improvement'])  # 68%
print(result['wrinkle_analysis']['forehead_lines']['improvement_pct'])  # 73%
```

---

## API 接口使用

### 方法 1: 直接上传照片分析

```bash
curl -X POST "http://localhost:8000/api/v1/analysis/analyze-upload" \
  -F "before_image=@before.jpg" \
  -F "after_image=@after.jpg" \
  -F "treatment_type=肉毒素注射"
```

### 方法 2: Python 代码调用

```python
import requests

url = "http://localhost:8000/api/v1/analysis/analyze-upload"

files = {
    'before_image': open('before.jpg', 'rb'),
    'after_image': open('after.jpg', 'rb'),
}

data = {
    'treatment_type': '肉毒素注射'
}

response = requests.post(url, files=files, data=data)
result = response.json()

print(result['analysis']['overall_assessment']['overall_improvement'])
```

### 方法 3: 在代码中直接使用分析器

```python
from app.ai.claude_analyzer import ClaudeVisionAnalyzer
import cv2

# 初始化分析器
analyzer = ClaudeVisionAnalyzer(api_key="your-api-key")

# 加载图像
before_img = cv2.imread("before.jpg")
after_img = cv2.imread("after.jpg")

# 执行分析
result = analyzer.analyze_comprehensive(
    before_image=before_img,
    after_image=after_img,
    treatment_type="玻尿酸填充",
    focus_areas=["苹果肌", "泪沟"]  # 可选：指定重点分析区域
)

# 访问结果
print(f"综合改善度: {result['overall_assessment']['overall_improvement']}%")
print(f"苹果肌饱满度改善: {result['facial_contour']['apple_muscle_fullness']['improvement_pct']}%")
print(f"API 成本: ${result['_meta']['cost_usd']}")
```

---

## 返回数据结构

```json
{
  "success": true,
  "wrinkle_analysis": {
    "forehead_lines": {
      "before_score": 45,
      "after_score": 78,
      "improvement_pct": 73,
      "description": "额头横纹明显减少，深度降低约70%"
    },
    "glabellar_lines": {...},
    "crows_feet": {...},
    "nasolabial_folds": {...}
  },
  "skin_quality": {
    "tone_evenness": {
      "before_score": 62,
      "after_score": 78,
      "improvement_pct": 26,
      "description": "肤色更加均匀，红血丝减少"
    },
    "pore_size": {...},
    "radiance": {...},
    "pigmentation": {...}
  },
  "facial_contour": {
    "apple_muscle_fullness": {
      "before_score": 65,
      "after_score": 88,
      "improvement_pct": 35,
      "description": "苹果肌明显饱满，面部立体感增强"
    },
    "jawline_definition": {...},
    "facial_symmetry": {...},
    "facial_firmness": {...}
  },
  "volume_fullness": {
    "temple_fullness": {...},
    "lip_fullness": {...},
    "tear_trough": {...}
  },
  "overall_assessment": {
    "overall_improvement": 68,
    "naturalness": 92,
    "rejuvenation_effect": 75,
    "summary": "整体效果显著，皱纹减少明显...",
    "recommendations": [
      "建议3-4个月后进行维持性治疗",
      "可考虑增加眼周精细化护理"
    ]
  },
  "_meta": {
    "model": "claude-3-5-sonnet-20241022",
    "treatment_type": "肉毒素注射",
    "tokens_used": 2458,
    "cost_usd": 0.0234
  }
}
```

---

## 评分标准

- **0-100 分制**: 0 分最差，100 分完美
- **Improvement %**: 改善百分比 = ((术后评分 - 术前评分) / (100 - 术前评分)) × 100

### 示例

- 术前: 45 分
- 术后: 78 分
- 改善度: ((78 - 45) / (100 - 45)) × 100 = **60%**

---

## 成本估算

### Claude 3.5 Sonnet 定价

- **Input tokens**: $3 / 1M tokens
- **Output tokens**: $15 / 1M tokens

### 实际成本

每次分析大约使用：
- 输入: ~1500 tokens (两张图片 + 提示词)
- 输出: ~1000 tokens (JSON 结果)

**单次分析成本**: 约 $0.019 - $0.025

### 月度成本估算

| 每月分析次数 | 月度成本 |
|------------|---------|
| 100 次 | ~$2 |
| 500 次 | ~$10 |
| 1000 次 | ~$20 |
| 5000 次 | ~$100 |

---

## 高级用法

### 1. 指定重点分析区域

```python
result = analyzer.analyze_comprehensive(
    before_image=before_img,
    after_image=after_img,
    treatment_type="线雕提升",
    focus_areas=["下颌线", "苹果肌", "面部紧致度"]
)
```

### 2. 单张照片评估（术前评估）

```python
result = analyzer.analyze_single_image(
    image=patient_img,
    analysis_type="skin_assessment"
)

# 返回当前状态评估和建议治疗方案
```

### 3. 批量处理

```python
from concurrent.futures import ThreadPoolExecutor

def process_patient(patient_id):
    before = load_image(f"{patient_id}_before.jpg")
    after = load_image(f"{patient_id}_after.jpg")
    return analyzer.analyze_comprehensive(before, after)

# 并行处理多个患者
with ThreadPoolExecutor(max_workers=5) as executor:
    results = executor.map(process_patient, patient_ids)
```

---

## 最佳实践

### 1. 图像预处理

```python
from app.ai.image_processor import ImageProcessor

processor = ImageProcessor()

# 检测人脸关键点
landmarks = processor.detect_face_landmarks(image)

# 对齐人脸
aligned_image = processor.align_face(image, landmarks)

# 使用对齐后的图像进行分析
result = analyzer.analyze_comprehensive(before_aligned, after_aligned)
```

### 2. 缓存结果

```python
import hashlib
import json

def get_analysis_cached(before_img, after_img):
    # 计算图像哈希
    before_hash = hashlib.md5(before_img.tobytes()).hexdigest()
    after_hash = hashlib.md5(after_img.tobytes()).hexdigest()
    cache_key = f"{before_hash}_{after_hash}"

    # 检查缓存
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)

    # 执行分析
    result = analyzer.analyze_comprehensive(before_img, after_img)

    # 保存到缓存（24小时）
    redis.setex(cache_key, 86400, json.dumps(result))

    return result
```

### 3. 错误处理

```python
try:
    result = analyzer.analyze_comprehensive(before_img, after_img)

    if not result.get('success'):
        logger.error(f"Analysis failed: {result.get('error')}")
        # 降级到传统 CV 方法
        result = fallback_cv_analysis(before_img, after_img)

except Exception as e:
    logger.exception("Claude API error")
    # 返回缓存或默认值
    result = get_cached_or_default()
```

---

## 集成到生产环境

### 1. 配置环境变量

```bash
# .env
CLAUDE_API_KEY=sk-ant-api03-xxx
ENVIRONMENT=production
```

### 2. 监控和日志

```python
import logging

# 记录每次 API 调用
logger.info(f"Claude analysis - Cost: ${cost}, Time: {time}ms")

# 监控每日成本
daily_cost_tracker.add(cost)
if daily_cost_tracker.total > 100:
    alert("Daily Claude API cost exceeded $100")
```

### 3. 速率限制

```python
from ratelimit import limits

@limits(calls=10, period=60)  # 每分钟最多 10 次
def analyze_with_rate_limit(before_img, after_img):
    return analyzer.analyze_comprehensive(before_img, after_img)
```

---

## 故障排查

### 问题: API 返回 401 Unauthorized

**解决**: 检查 API Key 是否正确配置

```bash
echo $CLAUDE_API_KEY
# 应该显示: sk-ant-api03-xxx
```

### 问题: 分析结果 JSON 解析失败

**解决**: 检查 prompt 是否清晰，或降低温度参数

```python
analyzer = ClaudeVisionAnalyzer(api_key=api_key)
# temperature 已设置为 0.3，如果仍有问题可以降到 0.1
```

### 问题: 成本过高

**解决方案**:
1. 仅对付费用户开启 Claude 分析
2. 降低图像分辨率（保持质量的情况下）
3. 使用缓存避免重复分析

---

## 下一步

- [查看完整 API 文档](./api.md)
- [了解传统 CV 方法](./cv_analysis.md)
- [集成到移动应用](./mobile_integration.md)

---

**问题反馈**: dev@glowtrack.ai
