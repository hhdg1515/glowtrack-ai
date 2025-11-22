"""
AI分析相关API - 使用 Claude Vision API
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
import logging
import cv2
import numpy as np
from io import BytesIO
import time

from app.ai.claude_analyzer import ClaudeVisionAnalyzer
from app.ai.report_controller import ReportController
from app.core.config import settings
from datetime import datetime, timedelta

router = APIRouter()
logger = logging.getLogger(__name__)


class AnalysisRequest(BaseModel):
    """分析请求"""
    treatment_id: str
    before_photo_id: str
    after_photo_id: str
    analysis_types: List[str] = ["wrinkles", "skin_tone", "texture", "pores"]


class AnalysisResponse(BaseModel):
    """分析响应"""
    analysis_id: str
    treatment_id: str
    improvements: dict
    confidence_score: float
    processing_time_ms: int
    comparison_image_url: Optional[str]


@router.post("/compare", response_model=AnalysisResponse)
async def analyze_before_after(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    分析术前术后对比 - 使用 Claude Vision API

    执行AI分析，比较术前术后照片的差异
    """
    try:
        logger.info(f"Starting Claude analysis for treatment: {request.treatment_id}")
        start_time = time.time()

        # TODO: 实际环境中从数据库或存储服务获取照片
        # before_image = load_image_from_db(request.before_photo_id)
        # after_image = load_image_from_db(request.after_photo_id)

        # 示例：这里需要实际的图像数据
        # 为了演示，返回提示需要上传图片的错误
        raise HTTPException(
            status_code=400,
            detail="Please use /analyze-upload endpoint to upload images directly"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze-upload")
async def analyze_upload(
    before_image: UploadFile = File(...),
    after_image: UploadFile = File(...),
    treatment_type: Optional[str] = None,
    treatment_date: Optional[str] = None,  # ISO格式日期
    patient_id: Optional[str] = None
):
    """
    直接上传照片进行 Claude 分析（智能报告控制）

    这是一个便捷接口，直接上传术前术后照片并获得分析结果
    包含智能报告可见性控制和风险检测
    """
    try:
        logger.info(f"Starting Claude analysis with uploaded images")
        start_time = time.time()

        # 读取上传的图片
        before_contents = await before_image.read()
        after_contents = await after_image.read()

        # 转换为 OpenCV 格式
        before_np = np.frombuffer(before_contents, np.uint8)
        after_np = np.frombuffer(after_contents, np.uint8)

        before_img = cv2.imdecode(before_np, cv2.IMREAD_COLOR)
        after_img = cv2.imdecode(after_np, cv2.IMREAD_COLOR)

        if before_img is None or after_img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        # 初始化 Claude 分析器
        analyzer = ClaudeVisionAnalyzer(api_key=settings.CLAUDE_API_KEY)

        # 执行 AI 分析
        analysis_result = analyzer.analyze_comprehensive(
            before_image=before_img,
            after_image=after_img,
            treatment_type=treatment_type or "未指定",
            focus_areas=None
        )

        processing_time = int((time.time() - start_time) * 1000)
        analysis_result['processing_time_ms'] = processing_time

        logger.info(f"Analysis completed in {processing_time}ms")
        logger.info(f"API cost: ${analysis_result.get('_meta', {}).get('cost_usd', 0)}")

        # 智能报告控制
        controller = ReportController()

        # 解析治疗日期
        if treatment_date:
            treatment_dt = datetime.fromisoformat(treatment_date)
        else:
            # 默认：假设治疗在 4 周前
            treatment_dt = datetime.now() - timedelta(days=28)

        photo_dt = datetime.now()

        # 评估报告并控制可见性
        controlled_report = controller.evaluate_report(
            analysis_result=analysis_result,
            treatment_date=treatment_dt,
            photo_date=photo_dt,
            treatment_type=treatment_type or "未指定"
        )

        # 记录风险和提醒
        if controlled_report['doctor_alerts']:
            logger.warning(f"Doctor alerts generated: {len(controlled_report['doctor_alerts'])} alerts")
            for alert in controlled_report['doctor_alerts']:
                logger.warning(f"  - [{alert['level']}] {alert['message']}")

        if controlled_report['risks']:
            logger.warning(f"Risks detected: {len(controlled_report['risks'])} risks")

        return {
            "success": True,
            "processing_time_ms": processing_time,

            # 患者可见部分（可能为 None）
            "patient_report": controlled_report['patient_report'],

            # 医生专属完整数据
            "doctor_view": {
                "full_analysis": controlled_report['raw_analysis'],
                "effect_level": controlled_report['effect_level'],
                "visibility_status": controlled_report['visibility'],
                "risks": controlled_report['risks'],
                "alerts": controlled_report['doctor_alerts'],
                "suggested_actions": controlled_report['actions'],
                "timing_status": controlled_report['timing_status']
            },

            # 元数据
            "metadata": {
                "days_after_treatment": controlled_report['days_after_treatment'],
                "api_cost": analysis_result.get('_meta', {}).get('cost_usd', 0),
                "model": analysis_result.get('_meta', {}).get('model', 'unknown')
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/results/{analysis_id}")
async def get_analysis_results(analysis_id: str):
    """获取分析结果"""
    # TODO: 从数据库获取分析结果
    return {
        "analysis_id": analysis_id,
        "status": "completed",
        "results": {}
    }


@router.post("/batch")
async def batch_analyze(treatment_ids: List[str]):
    """批量分析多个治疗"""
    # TODO: 实现批量分析
    return {
        "message": "Batch analysis started",
        "treatment_ids": treatment_ids
    }
