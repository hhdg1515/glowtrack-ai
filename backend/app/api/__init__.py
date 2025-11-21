"""
API路由
"""

from fastapi import APIRouter

from app.api import analysis, photos, treatments, patients, clinics, reports

router = APIRouter()

# 注册子路由
router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
router.include_router(photos.router, prefix="/photos", tags=["Photos"])
router.include_router(treatments.router, prefix="/treatments", tags=["Treatments"])
router.include_router(patients.router, prefix="/patients", tags=["Patients"])
router.include_router(clinics.router, prefix="/clinics", tags=["Clinics"])
router.include_router(reports.router, prefix="/reports", tags=["Reports"])
