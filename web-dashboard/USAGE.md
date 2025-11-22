# Web Dashboard 使用指南

## 新增功能：照片上传和AI分析

### 功能概述

现在您可以通过Web界面上传术前术后照片，调用Claude Vision API进行AI分析，并查看智能报告！

### 📁 新增页面

1. **上传页面** (`/upload`)
   - 拖拽或点击上传术前术后照片
   - 填写治疗信息（治疗类型、日期、患者编号）
   - 一键开始AI分析
   - 实时显示上传和分析进度

2. **结果页面** (`/analysis/result`)
   - 展示患者报告（根据智能控制系统决定可见性）
   - 展示医生完整数据和风险检测
   - 切换患者/医生视图
   - 下载报告和生成分享版本

### 🚀 快速开始

#### 1. 启动后端服务

```bash
cd backend

# 确保已配置 Claude API Key
export CLAUDE_API_KEY=sk-ant-api03-xxxxx

# 启动服务
uvicorn app.main:app --reload --port 8000
```

#### 2. 启动前端服务

```bash
cd web-dashboard

# 安装依赖（首次）
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:3000` 运行

#### 3. 使用流程

1. 访问 `http://localhost:3000/upload`
2. 上传术前和术后照片
3. （可选）填写治疗信息
4. 点击"开始 AI 分析"
5. 等待分析完成（通常 5-10 秒）
6. 自动跳转到结果页面

### 📊 功能特性

#### 智能报告控制

系统会自动评估治疗效果，并根据效果等级控制报告可见性：

- **优秀 (50%+)**: ✅ 患者可见可分享
- **良好 (30-50%)**: ✅ 患者可见可分享
- **一般 (10-30%)**: ⚠️ 患者可见但不可分享
- **不佳 (0-10%)**: 🔒 需医生审核
- **负面 (<0%)**: 🔒 仅医生可见

#### 患者视图

如果效果足够好，患者可以看到：
- 鼓励性标题和徽章
- 综合改善度百分比
- 主要改善亮点
- 下一步护理建议

#### 医生视图

医生始终可以看到：
- 完整的AI分析数据
- 效果等级和可见性状态
- 风险检测和医生提醒
- 详细的量化指标
- 建议处理措施

### 🎯 API集成

前端通过以下API与后端通信：

```typescript
// 上传并分析
const formData = new FormData()
formData.append('before_image', beforeFile)
formData.append('after_image', afterFile)
formData.append('treatment_type', '肉毒素注射')
formData.append('treatment_date', '2024-01-15')

const response = await fetch('http://localhost:8000/api/v1/analysis/analyze-upload', {
  method: 'POST',
  body: formData,
})

const result = await response.json()
```

返回数据结构：
```json
{
  "success": true,
  "patient_report": {
    "status": "available",
    "can_view": true,
    "can_share": true,
    "headline": "🎉 太棒了！您的治疗效果非常显著",
    "overall_improvement": 68,
    "highlights": [...]
  },
  "doctor_view": {
    "effect_level": "excellent",
    "visibility_status": "public_shareable",
    "risks": [],
    "alerts": [],
    "suggested_actions": [...]
  },
  "analysis": {
    "wrinkle_analysis": {...},
    "skin_quality": {...},
    "facial_contour": {...}
  }
}
```

### 🔧 环境配置

确保 `.env.local` 文件包含：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
```

### 📝 注意事项

1. **图片格式**：支持 JPG, PNG
2. **文件大小**：最大 10MB
3. **API成本**：每次分析约 $0.02-0.05
4. **处理时间**：通常 5-10 秒

### 🐛 常见问题

#### Q: 提示 "Failed to fetch" 错误？
A: 确保后端服务正在运行，并检查API URL配置

#### Q: 分析很慢？
A: Claude API调用需要时间，通常5-10秒是正常的

#### Q: 患者看不到报告？
A: 这是智能保护机制，查看医生视图中的提醒和建议

#### Q: 如何测试不同效果等级？
A: 使用不同质量的照片对，或调整 `report_controller.py` 中的阈值

### 🎨 自定义

#### 修改效果阈值

编辑 `backend/app/ai/report_controller.py`:

```python
self.thresholds = {
    "excellent": 50,  # 调整这里
    "good": 30,
    "fair": 10,
    "poor": 0,
}
```

#### 修改UI样式

编辑 `web-dashboard/tailwind.config.ts` 自定义颜色主题

### 📚 相关文档

- [Claude API使用指南](../../docs/CLAUDE_API_USAGE.md)
- [智能报告控制系统](../../docs/SMART_REPORT_CONTROL.md)
- [完整API文档](../../docs/api.md)

---

**准备好体验AI驱动的医美分析了吗？** 🚀
