# GlowTrack AI - 开发指南

## 开发环境设置

### 前置要求

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. 克隆仓库

```bash
git clone https://github.com/your-org/glowtrack-ai.git
cd glowtrack-ai
```

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入实际配置

# 运行后端
uvicorn app.main:app --reload
```

后端将在 `http://localhost:8000` 运行

### 3. Web Dashboard设置

```bash
cd web-dashboard

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件

# 运行开发服务器
npm run dev
```

Web Dashboard将在 `http://localhost:3000` 运行

### 4. Mobile App设置

```bash
cd mobile-app

# 安装依赖
npm install

# 启动开发服务器
npm start

# 在iOS模拟器运行
npm run ios

# 在Android模拟器运行
npm run android
```

### 5. 数据库设置

```bash
# 使用PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE glowtrack;

# 导入Schema
\i database/schema.sql

# 或使用Supabase
# 1. 在 https://supabase.com 创建项目
# 2. 复制连接字符串到 .env
# 3. 在Supabase SQL编辑器中运行 database/schema.sql
```

## 项目结构详解

### 后端 (FastAPI)

```
backend/
├── app/
│   ├── api/              # API路由
│   │   ├── analysis.py   # AI分析端点
│   │   ├── photos.py     # 照片管理
│   │   ├── treatments.py # 治疗记录
│   │   ├── patients.py   # 患者管理
│   │   ├── clinics.py    # 诊所管理
│   │   └── reports.py    # 报告生成
│   ├── core/             # 核心配置
│   │   └── config.py     # 环境配置
│   ├── models/           # 数据模型
│   ├── services/         # 业务逻辑
│   ├── ai/               # AI处理模块
│   │   ├── image_processor.py  # 图像处理
│   │   └── analyzer.py         # AI分析
│   └── main.py           # 主应用
├── tests/                # 测试
├── requirements.txt      # Python依赖
└── .env.example          # 环境变量模板
```

### Web Dashboard (Next.js)

```
web-dashboard/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # 根布局
│   │   ├── page.tsx      # 首页
│   │   ├── globals.css   # 全局样式
│   │   └── providers.tsx # Provider组件
│   ├── components/       # React组件
│   ├── lib/              # 工具库
│   │   └── api.ts        # API客户端
│   ├── types/            # TypeScript类型
│   │   └── index.ts      # 类型定义
│   └── hooks/            # 自定义Hooks
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### Mobile App (React Native)

```
mobile-app/
├── src/
│   ├── navigation/       # 导航配置
│   ├── screens/          # 屏幕组件
│   │   ├── HomeScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── PatientsScreen.tsx
│   │   └── ...
│   ├── components/       # 通用组件
│   ├── services/         # API服务
│   └── types/            # TypeScript类型
├── App.tsx               # 主应用
├── app.json              # Expo配置
└── package.json
```

## 开发工作流

### 1. 创建新功能

```bash
# 创建新分支
git checkout -b feature/your-feature-name

# 开发...

# 提交代码
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# 创建Pull Request
```

### 2. 代码规范

#### Python (后端)

```bash
# 格式化代码
black app/

# 代码检查
flake8 app/

# 类型检查
mypy app/
```

#### TypeScript (Web/Mobile)

```bash
# 格式化和检查
npm run lint

# 类型检查
npm run type-check
```

### 3. 测试

#### 后端测试

```bash
cd backend
pytest
```

#### 前端测试

```bash
cd web-dashboard
npm test
```

### 4. 提交信息规范

使用 Conventional Commits 格式：

- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建或辅助工具

示例：
```
feat: add AI wrinkle analysis
fix: resolve photo upload issue
docs: update API documentation
```

## AI模型集成

### 使用Face++ API

```python
# app/ai/facepp_client.py
from app.core.config import settings
import requests

def analyze_face(image_url):
    response = requests.post(
        'https://api-us.faceplusplus.com/facepp/v3/detect',
        data={
            'api_key': settings.FACEPP_API_KEY,
            'api_secret': settings.FACEPP_API_SECRET,
            'image_url': image_url,
            'return_attributes': 'age,gender,skinstatus'
        }
    )
    return response.json()
```

### 使用MediaPipe（本地）

```python
# app/ai/image_processor.py
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1
)

results = face_mesh.process(image)
```

## 部署

### 后端部署 (AWS/Railway)

```bash
# 使用Docker
docker build -t glowtrack-backend .
docker run -p 8000:8000 glowtrack-backend

# 或使用Railway
railway up
```

### Web部署 (Vercel)

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
cd web-dashboard
vercel
```

### Mobile App发布

#### iOS

```bash
# 使用EAS Build
eas build --platform ios
eas submit --platform ios
```

#### Android

```bash
eas build --platform android
eas submit --platform android
```

## 常见问题

### Q: 照片上传失败？

A: 检查：
1. 文件大小是否超过限制（10MB）
2. 文件格式是否支持（jpg, png）
3. S3/R2配置是否正确

### Q: AI分析很慢？

A: 优化建议：
1. 使用GPU加速（如果可用）
2. 降低图像分辨率
3. 使用异步处理
4. 考虑使用缓存

### Q: MediaPipe安装失败？

A: 可能需要额外依赖：
```bash
# macOS
brew install cmake

# Ubuntu
sudo apt-get install cmake
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 资源链接

- [FastAPI文档](https://fastapi.tiangolo.com/)
- [Next.js文档](https://nextjs.org/docs)
- [React Native文档](https://reactnative.dev/docs/getting-started)
- [MediaPipe文档](https://google.github.io/mediapipe/)
- [Face++ API文档](https://console.faceplusplus.com/documents/4888373)

## 技术支持

- Slack: #glowtrack-dev
- Email: dev@glowtrack.ai
- 周会: 每周一 10:00 AM

---

Happy coding! 🚀
