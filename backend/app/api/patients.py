"""
患者管理API
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import date
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class PatientCreate(BaseModel):
    """创建患者"""
    clinic_id: str
    patient_id: Optional[str] = None  # 诊所内部ID
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    skin_type: Optional[str] = None
    allergies: Optional[str] = None


class PatientResponse(BaseModel):
    """患者响应"""
    id: str
    clinic_id: str
    patient_id: Optional[str]
    first_name: str
    last_name: str
    date_of_birth: Optional[date]
    email: Optional[str]
    phone: Optional[str]
    skin_type: Optional[str]
    total_treatments: int = 0


@router.post("/", response_model=PatientResponse)
async def create_patient(patient: PatientCreate):
    """创建新患者"""
    try:
        logger.info(f"Creating patient: {patient.first_name} {patient.last_name}")

        # TODO: 保存到数据库

        return PatientResponse(
            id="patient-123",
            clinic_id=patient.clinic_id,
            patient_id=patient.patient_id,
            first_name=patient.first_name,
            last_name=patient.last_name,
            date_of_birth=patient.date_of_birth,
            email=patient.email,
            phone=patient.phone,
            skin_type=patient.skin_type,
            total_treatments=0
        )

    except Exception as e:
        logger.error(f"Failed to create patient: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str):
    """获取患者详情"""
    # TODO: 从数据库获取
    return PatientResponse(
        id=patient_id,
        clinic_id="clinic-123",
        patient_id="P-001",
        first_name="Jane",
        last_name="Doe",
        email="jane@example.com",
        total_treatments=3
    )


@router.get("/clinic/{clinic_id}")
async def get_clinic_patients(clinic_id: str, skip: int = 0, limit: int = 100):
    """获取诊所的所有患者"""
    # TODO: 从数据库获取
    return {
        "clinic_id": clinic_id,
        "patients": [],
        "total": 0
    }


@router.put("/{patient_id}")
async def update_patient(patient_id: str, patient: PatientCreate):
    """更新患者信息"""
    # TODO: 更新数据库
    return {
        "message": "Patient updated",
        "patient_id": patient_id
    }


@router.delete("/{patient_id}")
async def delete_patient(patient_id: str):
    """删除患者"""
    # TODO: 从数据库删除（软删除）
    return {
        "message": "Patient deleted",
        "patient_id": patient_id
    }
