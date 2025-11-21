"""
治疗记录API
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class TreatmentCreate(BaseModel):
    """创建治疗记录"""
    patient_id: str
    provider_id: str
    treatment_date: date
    treatment_type: str
    treatment_area: str
    product_name: Optional[str] = None
    product_amount: Optional[str] = None
    cost: Optional[float] = None
    notes: Optional[str] = None


class TreatmentResponse(BaseModel):
    """治疗记录响应"""
    treatment_id: str
    patient_id: str
    provider_id: str
    treatment_date: date
    treatment_type: str
    treatment_area: str
    product_name: Optional[str]
    product_amount: Optional[str]
    cost: Optional[float]
    notes: Optional[str]
    photos_count: int = 0


@router.post("/", response_model=TreatmentResponse)
async def create_treatment(treatment: TreatmentCreate):
    """创建新的治疗记录"""
    try:
        logger.info(f"Creating treatment for patient: {treatment.patient_id}")

        # TODO: 保存到数据库

        return TreatmentResponse(
            treatment_id="treatment-123",
            patient_id=treatment.patient_id,
            provider_id=treatment.provider_id,
            treatment_date=treatment.treatment_date,
            treatment_type=treatment.treatment_type,
            treatment_area=treatment.treatment_area,
            product_name=treatment.product_name,
            product_amount=treatment.product_amount,
            cost=treatment.cost,
            notes=treatment.notes,
            photos_count=0
        )

    except Exception as e:
        logger.error(f"Failed to create treatment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{treatment_id}", response_model=TreatmentResponse)
async def get_treatment(treatment_id: str):
    """获取治疗记录详情"""
    # TODO: 从数据库获取
    return TreatmentResponse(
        treatment_id=treatment_id,
        patient_id="patient-123",
        provider_id="provider-123",
        treatment_date=date.today(),
        treatment_type="Botox",
        treatment_area="Forehead",
        photos_count=2
    )


@router.get("/patient/{patient_id}")
async def get_patient_treatments(patient_id: str):
    """获取患者的所有治疗记录"""
    # TODO: 从数据库获取
    return {
        "patient_id": patient_id,
        "treatments": []
    }


@router.put("/{treatment_id}")
async def update_treatment(treatment_id: str, treatment: TreatmentCreate):
    """更新治疗记录"""
    # TODO: 更新数据库
    return {
        "message": "Treatment updated",
        "treatment_id": treatment_id
    }


@router.delete("/{treatment_id}")
async def delete_treatment(treatment_id: str):
    """删除治疗记录"""
    # TODO: 从数据库删除
    return {
        "message": "Treatment deleted",
        "treatment_id": treatment_id
    }
