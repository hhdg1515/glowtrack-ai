# 智能报告控制系统使用指南

## 概述

GlowTrack AI 的智能报告控制系统会自动评估治疗效果，并根据效果等级、时间窗口和风险因素，智能控制报告的可见性和分享权限。

**核心原则**: 保护医美诊所和患者利益，绝不让负面报告外流。

---

## 🎯 功能特性

### 1. 自动效果评估

系统自动将治疗效果分为 5 个等级：

| 等级 | 改善度 | 处理方式 |
|------|--------|----------|
| **优秀** | 50%+ | ✅ 患者可见可分享，鼓励传播 |
| **良好** | 30-50% | ✅ 患者可见可分享 |
| **一般** | 10-30% | ⚠️ 患者可见但不可分享 |
| **不佳** | 0-10% | 🔒 需医生审核才能显示 |
| **负面** | <0% | 🔒 仅医生可见，患者完全看不到 |

### 2. 时间窗口保护

```python
时间检查规则：
├── < 14 天：太早，效果未完全显现 → 提示 2-4 周后再拍
├── 14-21 天：可接受
├── 21-90 天：最佳评估期 ⭐
├── 90-180 天：可接受但效果可能减退
└── > 180 天：太晚，效果已消退 → 提示仅供参考
```

### 3. 风险检测

自动检测以下风险：

- ❌ **面部不对称加重** (严重等级: high)
- ❌ **不自然外观** (自然度 < 70)
- ❌ **负面改善项目** (任何指标下降 > 5%)

### 4. 医生提醒系统

根据风险等级自动发送提醒：

```
🚨 紧急 (Urgent)
   → 高风险情况，立即通知医生
   → 建议: 马上联系患者安排面诊

⚠️  重要 (High)
   → 效果不佳或负面
   → 建议: 评估是否需要补打或修正

ℹ️  信息 (Info)
   → 时间太早或其他提示
   → 建议: 安排后续复查
```

---

## 📊 API 使用示例

### 示例 1: 上传照片并自动控制报告

```bash
curl -X POST "http://localhost:8000/api/v1/analysis/analyze-upload" \
  -F "before_image=@before.jpg" \
  -F "after_image=@after.jpg" \
  -F "treatment_type=肉毒素注射" \
  -F "treatment_date=2024-01-15"  # 治疗日期（ISO格式）
```

### 示例 2: Python 代码调用

```python
import requests
from datetime import datetime, timedelta

# 假设治疗在 4 周前
treatment_date = (datetime.now() - timedelta(days=28)).isoformat()

files = {
    'before_image': open('before.jpg', 'rb'),
    'after_image': open('after.jpg', 'rb'),
}

data = {
    'treatment_type': '肉毒素注射',
    'treatment_date': treatment_date,
    'patient_id': 'P12345'
}

response = requests.post(
    'http://localhost:8000/api/v1/analysis/analyze-upload',
    files=files,
    data=data
)

result = response.json()

# 检查患者能否看到报告
if result['patient_report']:
    if result['patient_report']['can_view']:
        print(f"✅ 患者可见: {result['patient_report']['headline']}")
    else:
        print(f"⏳ 待审核: {result['patient_report']['message']}")
else:
    print("🔒 仅医生可见（效果不佳或有风险）")

# 医生查看完整数据
doctor_view = result['doctor_view']
print(f"\n效果等级: {doctor_view['effect_level']}")
print(f"可见性状态: {doctor_view['visibility_status']}")

if doctor_view['risks']:
    print(f"\n⚠️  检测到 {len(doctor_view['risks'])} 个风险:")
    for risk in doctor_view['risks']:
        print(f"  - [{risk['severity']}] {risk['message']}")

if doctor_view['alerts']:
    print(f"\n📢 医生提醒 ({len(doctor_view['alerts'])}):")
    for alert in doctor_view['alerts']:
        print(f"  - [{alert['level']}] {alert['message']}")
```

---

## 📱 返回数据结构

### 优秀效果（患者可见可分享）

```json
{
  "success": true,
  "patient_report": {
    "status": "available",
    "can_view": true,
    "can_share": true,
    "headline": "🎉 太棒了！您的治疗效果非常显著",
    "badge": "⭐ 优秀效果",
    "encouragement": "您的改善效果超过了大多数患者，非常值得分享！",
    "overall_improvement": 68,
    "highlights": [
      "额头横纹明显减少，深度降低约70%",
      "皮肤光泽度明显提升，更加水润",
      "苹果肌明显饱满，面部立体感增强"
    ],
    "next_steps": [
      "继续保持良好的护理习惯",
      "6-8 个月后可考虑维持性治疗",
      "欢迎分享您的美丽蜕变"
    ]
  },
  "doctor_view": {
    "effect_level": "excellent",
    "visibility_status": "public_shareable",
    "risks": [],
    "alerts": [],
    "suggested_actions": [
      "request_testimonial",
      "offer_referral_discount"
    ]
  }
}
```

### 一般效果（患者可见不可分享）

```json
{
  "success": true,
  "patient_report": {
    "status": "available",
    "can_view": true,
    "can_share": false,  // ❌ 不允许分享
    "headline": "💪 您的治疗正在持续改善中",
    "badge": "⏳ 持续改善",
    "encouragement": "效果仍在显现，建议 2 周后再次拍照观察",
    "overall_improvement": 18,
    "highlights": [
      "皮肤光泽度有所提升",
      "整体肤色更加均匀"
    ],
    "next_steps": [
      "效果仍在持续显现中",
      "建议 2-3 周后再次拍照",
      "如有疑问请咨询您的医生"
    ]
  },
  "doctor_view": {
    "effect_level": "fair",
    "visibility_status": "patient_only",
    "suggested_actions": [
      "schedule_followup_2weeks",
      "send_care_instructions"
    ]
  }
}
```

### 效果不佳（仅医生可见）

```json
{
  "success": true,
  "patient_report": {
    "status": "pending_review",
    "can_view": false,  // ❌ 患者看不到
    "message": "您的复查照片已收到，医生将很快为您进行专业评估"
  },
  "doctor_view": {
    "effect_level": "poor",
    "visibility_status": "doctor_review",
    "risks": [],
    "alerts": [
      {
        "level": "high",
        "type": "poor_outcome",
        "message": "治疗效果poor，需要医生介入",
        "action": "contact_patient",
        "priority": 2,
        "suggestions": [
          "评估是否需要补打",
          "检查是否有不良反应",
          "考虑调整治疗方案"
        ]
      }
    ],
    "suggested_actions": [
      "offer_free_touch_up",  // 提供免费补打
      "schedule_followup"     // 安排复查
    ]
  }
}
```

### 负面效果（完全隐藏）

```json
{
  "success": true,
  "patient_report": null,  // ❌ 患者完全看不到
  "doctor_view": {
    "effect_level": "negative",
    "visibility_status": "doctor_only",
    "risks": [
      {
        "type": "asymmetry_increased",
        "severity": "high",
        "message": "面部对称性下降超过 10%",
        "action": "urgent_doctor_review"
      }
    ],
    "alerts": [
      {
        "level": "urgent",
        "message": "检测到面部不对称，可能需要调整",
        "priority": 1
      }
    ],
    "suggested_actions": [
      "urgent_doctor_contact",   // 紧急联系
      "schedule_consultation",   // 安排面诊
      "offer_free_correction",   // 免费修正
      "document_case"            // 记录病例
    ]
  }
}
```

---

## 🔧 自定义配置

### 调整效果阈值

```python
from app.ai.report_controller import ReportController

controller = ReportController()

# 自定义阈值
controller.thresholds = {
    "excellent": 60,  # 提高优秀标准到 60%
    "good": 40,
    "fair": 15,
    "poor": 0,
}
```

### 调整时间窗口

```python
controller.timing = {
    "too_early_days": 10,      # 缩短到 10 天
    "optimal_min_days": 14,
    "optimal_max_days": 120,   # 延长到 120 天
    "too_late_days": 240,
}
```

---

## 🛡️ 最佳实践

### 1. 始终设置治疗日期

```python
# ✅ 好
data = {
    'treatment_date': '2024-01-15'  # 精确的治疗日期
}

# ❌ 差
data = {}  # 系统会假设 28 天前，不准确
```

### 2. 处理医生提醒

```python
result = api_call(...)

# 检查并处理提醒
for alert in result['doctor_view']['alerts']:
    if alert['level'] == 'urgent':
        send_sms_to_doctor(alert['message'])
    elif alert['level'] == 'high':
        send_email_to_doctor(alert['message'])
```

### 3. 根据建议采取行动

```python
actions = result['doctor_view']['suggested_actions']

if 'urgent_doctor_contact' in actions:
    # 立即通知医生并联系患者
    notify_doctor_urgent()
    schedule_immediate_consultation()

elif 'offer_free_touch_up' in actions:
    # 自动发送免费补打优惠券
    send_touchup_coupon(patient_id)

elif 'request_testimonial' in actions:
    # 效果优秀，请求好评
    send_review_request(patient_id)
```

---

## 📈 监控和分析

### 查看效果分布

```python
from collections import Counter

# 统计效果等级分布
effect_levels = [
    result['doctor_view']['effect_level']
    for result in all_analyses
]

distribution = Counter(effect_levels)
print(distribution)
# Counter({'excellent': 120, 'good': 45, 'fair': 18, 'poor': 5, 'negative': 2})
```

### 监控风险率

```python
total_analyses = len(all_results)
risky_cases = sum(
    1 for r in all_results
    if r['doctor_view']['risks']
)

risk_rate = risky_cases / total_analyses * 100
print(f"风险率: {risk_rate:.1f}%")

# 如果风险率过高，需要检查:
# 1. 治疗技术是否需要改进
# 2. 患者筛选是否合理
# 3. 术后护理指导是否到位
```

---

## ⚠️ 常见问题

### Q: 患者看不到报告怎么办？

A: 这是系统保护机制。检查 `doctor_view` 中的提醒和建议：

```python
if not result['patient_report']:
    # 查看原因
    visibility = result['doctor_view']['visibility_status']

    if visibility == 'doctor_only':
        # 效果不佳或有风险，医生需主动联系患者
        print("需要医生介入处理")

    elif visibility == 'doctor_review':
        # 等待医生审核
        print("医生审核后决定是否显示")
```

### Q: 如何修改报告让患者看到？

A: **不建议强制显示负面报告**。正确做法：

1. 医生评估实际情况
2. 如果确实效果不佳 → 免费补打/修正
3. 补救后重新拍照分析
4. 新报告会自动显示

### Q: 时间太早怎么办？

A: 系统会提示患者 2-4 周后再拍：

```python
if result['doctor_view']['timing_status']['status'] == 'too_early':
    # 给患者发消息
    message = result['doctor_view']['timing_status']['recommendation']
    send_patient_message(message)
```

---

## 🎓 进阶应用

### 自动化工作流

```python
class AutomatedWorkflow:
    """自动化处理流程"""

    def process_analysis_result(self, result):
        """根据分析结果自动处理"""

        visibility = result['doctor_view']['visibility_status']
        actions = result['doctor_view']['suggested_actions']

        # 优秀效果 → 自动化好评请求
        if visibility == 'public_shareable':
            self.send_review_request()
            self.generate_social_media_post()

        # 一般效果 → 自动安排复查
        elif visibility == 'patient_only':
            self.schedule_followup_in_2weeks()

        # 需审核 → 通知医生
        elif visibility == 'doctor_review':
            self.notify_doctor_for_review()

        # 仅医生可见 → 紧急处理
        elif visibility == 'doctor_only':
            self.urgent_doctor_notification()
            self.prepare_correction_plan()
```

---

**让 AI 成为医美诊所的智能助手，而不是风险！** 🚀
