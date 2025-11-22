"""
智能报告可见性控制系统
根据治疗效果自动控制报告的可见性和分享权限
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class EffectLevel(Enum):
    """效果等级"""
    EXCELLENT = "excellent"      # 优秀 (50%+)
    GOOD = "good"                # 良好 (30-50%)
    FAIR = "fair"                # 一般 (10-30%)
    POOR = "poor"                # 不佳 (0-10%)
    NEGATIVE = "negative"        # 负面 (<0%)


class ReportVisibility(Enum):
    """报告可见性"""
    PUBLIC_SHAREABLE = "public_shareable"      # 患者可见可分享
    PATIENT_ONLY = "patient_only"              # 患者可见不可分享
    DOCTOR_REVIEW = "doctor_review"            # 需医生审核
    DOCTOR_ONLY = "doctor_only"                # 仅医生可见
    HIDDEN = "hidden"                          # 完全隐藏


class ReportController:
    """报告控制器 - 智能管理报告可见性"""

    def __init__(self):
        """初始化控制器"""
        # 效果阈值配置
        self.thresholds = {
            "excellent": 50,   # 优秀效果
            "good": 30,        # 良好效果
            "fair": 10,        # 一般效果
            "poor": 0,         # 不佳
        }

        # 时间窗口配置
        self.timing = {
            "too_early_days": 14,      # 太早（效果未完全显现）
            "optimal_min_days": 21,    # 最佳评估期开始
            "optimal_max_days": 90,    # 最佳评估期结束
            "too_late_days": 180,      # 太晚（效果可能消退）
        }

    def evaluate_report(
        self,
        analysis_result: Dict,
        treatment_date: datetime,
        photo_date: datetime,
        treatment_type: str
    ) -> Dict:
        """
        评估报告并决定可见性

        Args:
            analysis_result: Claude AI 分析结果
            treatment_date: 治疗日期
            photo_date: 拍照日期
            treatment_type: 治疗类型

        Returns:
            包含可见性控制和处理建议的字典
        """
        days_after = (photo_date - treatment_date).days

        # 1. 检查时间窗口
        timing_check = self._check_timing(days_after, treatment_type)

        # 2. 评估效果等级
        effect_level = self._evaluate_effect(analysis_result)

        # 3. 检测风险
        risks = self._detect_risks(analysis_result)

        # 4. 决定可见性
        visibility = self._determine_visibility(
            effect_level,
            timing_check,
            risks
        )

        # 5. 生成患者友好报告
        patient_report = self._generate_patient_report(
            analysis_result,
            effect_level,
            visibility
        )

        # 6. 生成医生提醒
        doctor_alerts = self._generate_doctor_alerts(
            analysis_result,
            effect_level,
            risks,
            timing_check
        )

        return {
            "effect_level": effect_level.value,
            "visibility": visibility.value,
            "days_after_treatment": days_after,
            "timing_status": timing_check,
            "risks": risks,
            "patient_report": patient_report,
            "doctor_alerts": doctor_alerts,
            "raw_analysis": analysis_result,  # 医生完整版
            "actions": self._suggest_actions(effect_level, risks)
        }

    def _check_timing(self, days_after: int, treatment_type: str) -> Dict:
        """检查时间窗口"""

        if days_after < self.timing["too_early_days"]:
            return {
                "status": "too_early",
                "message": f"{treatment_type}通常需要 2-4 周完全起效",
                "recommendation": "建议 3-4 周后再次拍照以获得更准确的评估",
                "reliability": "low"
            }

        elif days_after > self.timing["too_late_days"]:
            return {
                "status": "too_late",
                "message": "距离治疗时间较长，效果可能已部分消退",
                "recommendation": "本次评估仅供参考",
                "reliability": "medium"
            }

        elif self.timing["optimal_min_days"] <= days_after <= self.timing["optimal_max_days"]:
            return {
                "status": "optimal",
                "message": "当前为最佳评估时期",
                "recommendation": None,
                "reliability": "high"
            }

        else:
            return {
                "status": "acceptable",
                "message": "评估时间可接受",
                "recommendation": None,
                "reliability": "medium"
            }

    def _evaluate_effect(self, analysis_result: Dict) -> EffectLevel:
        """评估效果等级"""

        if not analysis_result.get('success'):
            return EffectLevel.POOR

        overall = analysis_result.get('overall_assessment', {})
        improvement = overall.get('overall_improvement', 0)

        if improvement < 0:
            return EffectLevel.NEGATIVE
        elif improvement < self.thresholds["poor"]:
            return EffectLevel.POOR
        elif improvement < self.thresholds["fair"]:
            return EffectLevel.FAIR
        elif improvement < self.thresholds["good"]:
            return EffectLevel.GOOD
        else:
            return EffectLevel.EXCELLENT

    def _detect_risks(self, analysis_result: Dict) -> List[Dict]:
        """检测风险因素"""

        risks = []

        if not analysis_result.get('success'):
            risks.append({
                "type": "analysis_failed",
                "severity": "high",
                "message": "AI 分析失败",
                "action": "manual_review"
            })
            return risks

        # 检查面部对称性
        contour = analysis_result.get('facial_contour', {})
        symmetry = contour.get('facial_symmetry', {})

        if symmetry.get('improvement_pct', 0) < -10:
            risks.append({
                "type": "asymmetry_increased",
                "severity": "high",
                "message": "面部对称性下降超过 10%",
                "action": "urgent_doctor_review",
                "data": symmetry
            })

        # 检查不自然度
        overall = analysis_result.get('overall_assessment', {})
        naturalness = overall.get('naturalness', 100)

        if naturalness < 70:
            risks.append({
                "type": "unnatural_appearance",
                "severity": "medium",
                "message": f"自然度评分较低 ({naturalness}/100)",
                "action": "doctor_review",
                "data": {"naturalness": naturalness}
            })

        # 检查负面改善项
        negative_items = self._find_negative_improvements(analysis_result)
        if negative_items:
            risks.append({
                "type": "negative_improvements",
                "severity": "medium",
                "message": f"发现 {len(negative_items)} 项负面变化",
                "action": "doctor_review",
                "data": negative_items
            })

        return risks

    def _find_negative_improvements(self, analysis_result: Dict) -> List[Dict]:
        """查找负面改善项"""

        negative_items = []

        # 检查所有分析维度
        for category in ['wrinkle_analysis', 'skin_quality', 'facial_contour', 'volume_fullness']:
            category_data = analysis_result.get(category, {})

            for metric_name, metric_data in category_data.items():
                if isinstance(metric_data, dict):
                    improvement = metric_data.get('improvement_pct', 0)

                    if improvement < -5:  # 负面改善超过 5%
                        negative_items.append({
                            "category": category,
                            "metric": metric_name,
                            "improvement": improvement,
                            "before": metric_data.get('before_score'),
                            "after": metric_data.get('after_score')
                        })

        return negative_items

    def _determine_visibility(
        self,
        effect_level: EffectLevel,
        timing_check: Dict,
        risks: List[Dict]
    ) -> ReportVisibility:
        """决定报告可见性"""

        # 高风险情况：仅医生可见
        high_risk = any(r['severity'] == 'high' for r in risks)
        if high_risk:
            return ReportVisibility.DOCTOR_ONLY

        # 负面效果：仅医生可见
        if effect_level == EffectLevel.NEGATIVE:
            return ReportVisibility.DOCTOR_ONLY

        # 时间太早：医生审核
        if timing_check['status'] == 'too_early':
            return ReportVisibility.DOCTOR_REVIEW

        # 效果不佳：医生审核
        if effect_level == EffectLevel.POOR:
            return ReportVisibility.DOCTOR_REVIEW

        # 一般效果 + 有中等风险：患者可见但不可分享
        if effect_level == EffectLevel.FAIR or risks:
            return ReportVisibility.PATIENT_ONLY

        # 良好效果：患者可见可分享（但不自动推荐）
        if effect_level == EffectLevel.GOOD:
            return ReportVisibility.PATIENT_ONLY

        # 优秀效果：公开可分享
        if effect_level == EffectLevel.EXCELLENT:
            return ReportVisibility.PUBLIC_SHAREABLE

        # 默认：医生审核
        return ReportVisibility.DOCTOR_REVIEW

    def _generate_patient_report(
        self,
        analysis_result: Dict,
        effect_level: EffectLevel,
        visibility: ReportVisibility
    ) -> Optional[Dict]:
        """生成患者友好版报告"""

        # 如果仅医生可见，不生成患者报告
        if visibility in [ReportVisibility.DOCTOR_ONLY, ReportVisibility.HIDDEN]:
            return None

        # 如果需要医生审核，返回待审核消息
        if visibility == ReportVisibility.DOCTOR_REVIEW:
            return {
                "status": "pending_review",
                "message": "您的复查照片已收到，医生将很快为您进行专业评估",
                "can_view": False
            }

        # 生成患者可见的报告
        overall = analysis_result.get('overall_assessment', {})

        # 找出改善最明显的项目
        best_improvements = self._find_best_improvements(analysis_result)

        # 根据效果等级定制标题和消息
        if effect_level == EffectLevel.EXCELLENT:
            headline = f"🎉 太棒了！您的治疗效果非常显著"
            badge = "⭐ 优秀效果"
            encouragement = "您的改善效果超过了大多数患者，非常值得分享！"

        elif effect_level == EffectLevel.GOOD:
            headline = f"✨ 很好！您的治疗效果明显"
            badge = "✓ 良好效果"
            encouragement = "持续保持良好的护理习惯，效果会更好！"

        else:  # FAIR
            headline = f"💪 您的治疗正在持续改善中"
            badge = "⏳ 持续改善"
            encouragement = "效果仍在显现，建议 2 周后再次拍照观察"

        return {
            "status": "available",
            "can_view": True,
            "can_share": visibility == ReportVisibility.PUBLIC_SHAREABLE,
            "headline": headline,
            "badge": badge,
            "encouragement": encouragement,
            "overall_improvement": overall.get('overall_improvement', 0),
            "highlights": [item['description'] for item in best_improvements[:3]],
            "best_improvements": best_improvements,
            "summary": overall.get('summary', ''),
            "next_steps": self._generate_next_steps(effect_level)
        }

    def _find_best_improvements(self, analysis_result: Dict) -> List[Dict]:
        """找出改善最明显的项目"""

        improvements = []

        # 遍历所有分析维度
        for category in ['wrinkle_analysis', 'skin_quality', 'facial_contour', 'volume_fullness']:
            category_data = analysis_result.get(category, {})

            for metric_name, metric_data in category_data.items():
                if isinstance(metric_data, dict) and 'improvement_pct' in metric_data:
                    improvements.append({
                        "category": category,
                        "metric": metric_name,
                        "improvement": metric_data.get('improvement_pct', 0),
                        "description": metric_data.get('description', ''),
                        "before_score": metric_data.get('before_score', 0),
                        "after_score": metric_data.get('after_score', 0)
                    })

        # 按改善程度排序（只保留正面改善）
        improvements = [i for i in improvements if i['improvement'] > 0]
        improvements.sort(key=lambda x: x['improvement'], reverse=True)

        return improvements

    def _generate_next_steps(self, effect_level: EffectLevel) -> List[str]:
        """生成下一步建议"""

        if effect_level == EffectLevel.EXCELLENT:
            return [
                "继续保持良好的护理习惯",
                "6-8 个月后可考虑维持性治疗",
                "欢迎分享您的美丽蜕变"
            ]

        elif effect_level == EffectLevel.GOOD:
            return [
                "效果良好，继续保持",
                "注意防晒以维持效果",
                "4-6 个月后复查"
            ]

        else:  # FAIR
            return [
                "效果仍在持续显现中",
                "建议 2-3 周后再次拍照",
                "如有疑问请咨询您的医生"
            ]

    def _generate_doctor_alerts(
        self,
        analysis_result: Dict,
        effect_level: EffectLevel,
        risks: List[Dict],
        timing_check: Dict
    ) -> List[Dict]:
        """生成医生提醒"""

        alerts = []

        # 高风险提醒
        for risk in risks:
            if risk['severity'] == 'high':
                alerts.append({
                    "level": "urgent",
                    "type": risk['type'],
                    "message": risk['message'],
                    "action": risk['action'],
                    "priority": 1
                })

        # 效果不佳提醒
        if effect_level in [EffectLevel.POOR, EffectLevel.NEGATIVE]:
            alerts.append({
                "level": "high",
                "type": "poor_outcome",
                "message": f"治疗效果{effect_level.value}，需要医生介入",
                "action": "contact_patient",
                "priority": 2,
                "suggestions": [
                    "评估是否需要补打",
                    "检查是否有不良反应",
                    "考虑调整治疗方案"
                ]
            })

        # 时间窗口提醒
        if timing_check['status'] == 'too_early':
            alerts.append({
                "level": "info",
                "type": "timing_early",
                "message": "拍照时间较早，效果可能未完全显现",
                "action": "schedule_followup",
                "priority": 3
            })

        return sorted(alerts, key=lambda x: x['priority'])

    def _suggest_actions(
        self,
        effect_level: EffectLevel,
        risks: List[Dict]
    ) -> List[str]:
        """建议处理措施"""

        actions = []

        if risks:
            if any(r['severity'] == 'high' for r in risks):
                actions.append("urgent_doctor_contact")  # 紧急联系患者
                actions.append("schedule_consultation")  # 安排面诊

        if effect_level == EffectLevel.NEGATIVE:
            actions.append("offer_free_correction")  # 提供免费修正
            actions.append("document_case")  # 记录病例

        elif effect_level == EffectLevel.POOR:
            actions.append("offer_free_touch_up")  # 提供免费补打
            actions.append("schedule_followup")  # 安排复查

        elif effect_level == EffectLevel.FAIR:
            actions.append("schedule_followup_2weeks")  # 2周后复查
            actions.append("send_care_instructions")  # 发送护理指导

        elif effect_level == EffectLevel.EXCELLENT:
            actions.append("request_testimonial")  # 请求分享好评
            actions.append("offer_referral_discount")  # 提供推荐优惠

        return actions
