"""
应用配置
使用Pydantic Settings管理环境变量
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path


class Settings(BaseSettings):
    """应用设置"""

    # 应用基本信息
    APP_NAME: str = "GlowTrack AI"
    API_VERSION: str = "v1"
    ENVIRONMENT: str = "development"  # development, staging, production

    # API配置
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # 安全配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:19006",  # Expo
    ]

    # 数据库配置
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/glowtrack"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Supabase配置（如果使用）
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # AWS S3配置
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: Optional[str] = None

    # 或 Cloudflare R2
    R2_ACCOUNT_ID: Optional[str] = None
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_BUCKET_NAME: Optional[str] = None

    # AI服务配置
    # Claude API (主要分析引擎)
    CLAUDE_API_KEY: Optional[str] = None

    # Face++ API (辅助分析)
    FACEPP_API_KEY: Optional[str] = None
    FACEPP_API_SECRET: Optional[str] = None

    # AWS Rekognition
    AWS_REKOGNITION_ENABLED: bool = False

    # Azure Face API
    AZURE_FACE_API_KEY: Optional[str] = None
    AZURE_FACE_ENDPOINT: Optional[str] = None

    # 本地AI模型路径
    AI_MODELS_DIR: Path = Path(__file__).parent.parent.parent / "models"

    # MediaPipe配置
    MEDIAPIPE_MODEL_COMPLEXITY: int = 1  # 0, 1, or 2
    MEDIAPIPE_MIN_DETECTION_CONFIDENCE: float = 0.5
    MEDIAPIPE_MIN_TRACKING_CONFIDENCE: float = 0.5

    # 图像处理配置
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_IMAGE_FORMATS: List[str] = ["jpg", "jpeg", "png"]
    STANDARD_IMAGE_SIZE: tuple = (1000, 1000)

    # 临时文件存储
    TEMP_DIR: Path = Path(__file__).parent.parent.parent / "temp"
    UPLOAD_DIR: Path = Path(__file__).parent.parent.parent / "uploads"

    # 报告生成配置
    REPORTS_DIR: Path = Path(__file__).parent.parent.parent / "reports"
    PDF_FONT_PATH: Optional[str] = None

    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = None

    # Redis配置（可选，用于缓存）
    REDIS_URL: Optional[str] = None

    # Sentry配置（可选，用于错误追踪）
    SENTRY_DSN: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


# 创建全局设置实例
settings = Settings()

# 确保必要的目录存在
settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
settings.AI_MODELS_DIR.mkdir(parents=True, exist_ok=True)
