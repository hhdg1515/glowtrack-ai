"""
GlowTrack AI - Main FastAPI Application
医美术前术后AI对比系统后端服务
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging
from pathlib import Path

from app.core.config import settings
from app.api import router as api_router

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info("🚀 Starting GlowTrack AI Backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"API Version: {settings.API_VERSION}")

    # 启动时的初始化
    # TODO: 初始化数据库连接
    # TODO: 加载AI模型

    yield

    # 关闭时的清理
    logger.info("👋 Shutting down GlowTrack AI Backend...")
    # TODO: 关闭数据库连接
    # TODO: 清理临时文件


# 创建FastAPI应用
app = FastAPI(
    title="GlowTrack AI API",
    description="医美术前术后AI对比系统 - API服务",
    version=settings.API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件（如果需要）
# static_dir = Path(__file__).parent.parent / "static"
# if static_dir.exists():
#     app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# 注册路由
app.include_router(api_router, prefix=f"/api/{settings.API_VERSION}")


@app.get("/")
async def root():
    """根路径 - 健康检查"""
    return {
        "message": "GlowTrack AI API",
        "version": settings.API_VERSION,
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "version": settings.API_VERSION
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
