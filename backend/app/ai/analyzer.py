"""
AI分析模块
量化分析皱纹、肤质、轮廓等改善
"""

import cv2
import numpy as np
from typing import Dict, Tuple, Optional
from sklearn.metrics import mean_squared_error
import logging

logger = logging.getLogger(__name__)


class BeforeAfterAnalyzer:
    """术前术后分析器"""

    def __init__(self):
        """初始化分析器"""
        pass

    def analyze_wrinkles(
        self,
        before_image: np.ndarray,
        after_image: np.ndarray
    ) -> Dict:
        """
        分析皱纹改善

        使用边缘检测来估算皱纹的数量和深度

        Args:
            before_image: 术前图像
            after_image: 术后图像

        Returns:
            皱纹分析结果
        """
        try:
            # 转换为灰度图
            before_gray = cv2.cvtColor(before_image, cv2.COLOR_BGR2GRAY)
            after_gray = cv2.cvtColor(after_image, cv2.COLOR_BGR2GRAY)

            # 使用Canny边缘检测
            before_edges = cv2.Canny(before_gray, 50, 150)
            after_edges = cv2.Canny(after_gray, 50, 150)

            # 计算边缘像素数量（代表皱纹）
            before_count = np.sum(before_edges > 0)
            after_count = np.sum(after_edges > 0)

            # 计算减少百分比
            if before_count > 0:
                reduction_pct = ((before_count - after_count) / before_count) * 100
                reduction_pct = max(0, min(100, reduction_pct))  # 限制在0-100
            else:
                reduction_pct = 0

            # 使用更复杂的方法分析不同区域的皱纹
            # 分区域：额头、眼周、嘴周
            h, w = before_gray.shape
            regions = {
                "forehead": (int(h * 0.1), int(h * 0.4)),
                "eyes": (int(h * 0.3), int(h * 0.6)),
                "mouth": (int(h * 0.5), int(h * 0.8))
            }

            regional_analysis = {}
            for region_name, (y1, y2) in regions.items():
                before_region = before_edges[y1:y2, :]
                after_region = after_edges[y1:y2, :]

                before_region_count = np.sum(before_region > 0)
                after_region_count = np.sum(after_region > 0)

                if before_region_count > 0:
                    region_reduction = ((before_region_count - after_region_count) /
                                      before_region_count) * 100
                    region_reduction = max(0, min(100, region_reduction))
                else:
                    region_reduction = 0

                regional_analysis[region_name] = {
                    "count_before": int(before_region_count),
                    "count_after": int(after_region_count),
                    "reduction_pct": round(region_reduction, 1)
                }

            return {
                "overall": {
                    "count_before": int(before_count),
                    "count_after": int(after_count),
                    "reduction_pct": round(reduction_pct, 1)
                },
                "regions": regional_analysis,
                "score": min(10, reduction_pct / 10)  # 0-10分
            }

        except Exception as e:
            logger.error(f"Wrinkle analysis failed: {str(e)}")
            return {"error": str(e)}

    def analyze_skin_tone(
        self,
        before_image: np.ndarray,
        after_image: np.ndarray
    ) -> Dict:
        """
        分析肤色均匀度改善

        Args:
            before_image: 术前图像
            after_image: 术后图像

        Returns:
            肤色分析结果
        """
        try:
            # 转换到LAB色彩空间
            before_lab = cv2.cvtColor(before_image, cv2.COLOR_BGR2LAB)
            after_lab = cv2.cvtColor(after_image, cv2.COLOR_BGR2LAB)

            # 分离通道
            before_l, before_a, before_b = cv2.split(before_lab)
            after_l, after_a, after_b = cv2.split(after_lab)

            # 计算每个通道的标准差（标准差越小，越均匀）
            before_l_std = np.std(before_l)
            after_l_std = np.std(after_l)

            before_a_std = np.std(before_a)
            after_a_std = np.std(after_a)

            before_b_std = np.std(before_b)
            after_b_std = np.std(after_b)

            # 计算均匀度分数（标准差的倒数归一化）
            def std_to_evenness(std):
                # 将标准差转换为0-1的均匀度分数
                return 1.0 / (1.0 + std / 100.0)

            before_evenness = std_to_evenness(before_l_std)
            after_evenness = std_to_evenness(after_l_std)

            # 计算改善百分比
            if before_evenness > 0:
                improvement_pct = ((after_evenness - before_evenness) /
                                  before_evenness) * 100
            else:
                improvement_pct = 0

            # 分析红血丝（a通道）
            before_redness = np.mean(before_a)
            after_redness = np.mean(after_a)
            redness_reduction_pct = 0
            if before_redness > 128:  # a通道 > 128表示偏红
                redness_reduction_pct = ((before_redness - after_redness) /
                                        (before_redness - 128)) * 100

            return {
                "evenness_before": round(before_evenness, 2),
                "evenness_after": round(after_evenness, 2),
                "improvement_pct": round(max(0, improvement_pct), 1),
                "brightness_before": round(float(np.mean(before_l)), 1),
                "brightness_after": round(float(np.mean(after_l)), 1),
                "redness_reduction_pct": round(max(0, redness_reduction_pct), 1),
                "score": min(10, max(0, improvement_pct) / 10)
            }

        except Exception as e:
            logger.error(f"Skin tone analysis failed: {str(e)}")
            return {"error": str(e)}

    def analyze_texture(
        self,
        before_image: np.ndarray,
        after_image: np.ndarray
    ) -> Dict:
        """
        分析皮肤纹理改善

        使用方差和边缘检测来评估皮肤光滑度

        Args:
            before_image: 术前图像
            after_image: 术后图像

        Returns:
            纹理分析结果
        """
        try:
            # 转换为灰度图
            before_gray = cv2.cvtColor(before_image, cv2.COLOR_BGR2GRAY)
            after_gray = cv2.cvtColor(after_image, cv2.COLOR_BGR2GRAY)

            # 使用拉普拉斯算子计算纹理
            before_laplacian = cv2.Laplacian(before_gray, cv2.CV_64F)
            after_laplacian = cv2.Laplacian(after_gray, cv2.CV_64F)

            # 计算方差（方差越大，纹理越粗糙）
            before_variance = np.var(before_laplacian)
            after_variance = np.var(after_laplacian)

            # 计算光滑度分数（方差的倒数）
            def variance_to_smoothness(variance):
                return 1.0 / (1.0 + variance / 1000.0)

            before_smoothness = variance_to_smoothness(before_variance)
            after_smoothness = variance_to_smoothness(after_variance)

            # 计算改善百分比
            if before_smoothness > 0:
                improvement_pct = ((after_smoothness - before_smoothness) /
                                  before_smoothness) * 100
            else:
                improvement_pct = 0

            return {
                "smoothness_before": round(before_smoothness, 2),
                "smoothness_after": round(after_smoothness, 2),
                "improvement_pct": round(max(0, improvement_pct), 1),
                "score": min(10, max(0, improvement_pct) / 10)
            }

        except Exception as e:
            logger.error(f"Texture analysis failed: {str(e)}")
            return {"error": str(e)}

    def analyze_pores(
        self,
        before_image: np.ndarray,
        after_image: np.ndarray
    ) -> Dict:
        """
        分析毛孔大小改善

        Args:
            before_image: 术前图像
            after_image: 术后图像

        Returns:
            毛孔分析结果
        """
        try:
            # 转换为灰度图
            before_gray = cv2.cvtColor(before_image, cv2.COLOR_BGR2GRAY)
            after_gray = cv2.cvtColor(after_image, cv2.COLOR_BGR2GRAY)

            # 使用形态学操作检测毛孔（暗点）
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))

            # 黑帽操作检测暗点
            before_blackhat = cv2.morphologyEx(before_gray, cv2.MORPH_BLACKHAT, kernel)
            after_blackhat = cv2.morphologyEx(after_gray, cv2.MORPH_BLACKHAT, kernel)

            # 阈值化
            _, before_pores = cv2.threshold(before_blackhat, 10, 255, cv2.THRESH_BINARY)
            _, after_pores = cv2.threshold(after_blackhat, 10, 255, cv2.THRESH_BINARY)

            # 计算毛孔面积
            before_pore_area = np.sum(before_pores > 0)
            after_pore_area = np.sum(after_pores > 0)

            # 计算减少百分比
            if before_pore_area > 0:
                reduction_pct = ((before_pore_area - after_pore_area) /
                               before_pore_area) * 100
                reduction_pct = max(0, min(100, reduction_pct))
            else:
                reduction_pct = 0

            return {
                "pore_area_before": int(before_pore_area),
                "pore_area_after": int(after_pore_area),
                "reduction_pct": round(reduction_pct, 1),
                "visibility_score_before": round(before_pore_area / 1000.0, 2),
                "visibility_score_after": round(after_pore_area / 1000.0, 2),
                "score": min(10, reduction_pct / 10)
            }

        except Exception as e:
            logger.error(f"Pore analysis failed: {str(e)}")
            return {"error": str(e)}

    def calculate_overall_score(self, improvements: Dict) -> float:
        """
        计算总体改善分数

        Args:
            improvements: 各项改善指标

        Returns:
            总体分数（0-10）
        """
        try:
            scores = []

            if "wrinkles" in improvements and "score" in improvements["wrinkles"]:
                scores.append(improvements["wrinkles"]["score"])

            if "skin_tone" in improvements and "score" in improvements["skin_tone"]:
                scores.append(improvements["skin_tone"]["score"])

            if "texture" in improvements and "score" in improvements["texture"]:
                scores.append(improvements["texture"]["score"])

            if "pores" in improvements and "score" in improvements["pores"]:
                scores.append(improvements["pores"]["score"])

            if scores:
                overall = sum(scores) / len(scores)
                return round(overall, 1)
            else:
                return 0.0

        except Exception as e:
            logger.error(f"Overall score calculation failed: {str(e)}")
            return 0.0

    def analyze_comparison(
        self,
        before_image: np.ndarray,
        after_image: np.ndarray,
        analysis_types: list = None
    ) -> Dict:
        """
        完整的对比分析

        Args:
            before_image: 术前图像
            after_image: 术后图像
            analysis_types: 要执行的分析类型列表

        Returns:
            完整的分析结果
        """
        if analysis_types is None:
            analysis_types = ["wrinkles", "skin_tone", "texture", "pores"]

        improvements = {}

        try:
            if "wrinkles" in analysis_types:
                improvements["wrinkles"] = self.analyze_wrinkles(before_image, after_image)

            if "skin_tone" in analysis_types:
                improvements["skin_tone"] = self.analyze_skin_tone(before_image, after_image)

            if "texture" in analysis_types:
                improvements["texture"] = self.analyze_texture(before_image, after_image)

            if "pores" in analysis_types:
                improvements["pores"] = self.analyze_pores(before_image, after_image)

            # 计算总体分数
            overall_score = self.calculate_overall_score(improvements)
            improvements["overall_score"] = overall_score

            return improvements

        except Exception as e:
            logger.error(f"Comparison analysis failed: {str(e)}")
            return {"error": str(e)}
