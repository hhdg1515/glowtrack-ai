"""
Claude Vision API 分析模块
使用 Claude 3.5 Sonnet 进行专业医美术前术后分析
"""

import anthropic
import base64
import json
import logging
from typing import Dict, Optional, List
from pathlib import Path
import cv2
import numpy as np

logger = logging.getLogger(__name__)


class ClaudeVisionAnalyzer:
    """基于 Claude Vision API 的医美分析器"""

    def __init__(self, api_key: str):
        """
        初始化 Claude 分析器

        Args:
            api_key: Anthropic API Key
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"

    def image_to_base64(self, image: np.ndarray) -> str:
        """
        将 OpenCV 图像转换为 base64

        Args:
            image: OpenCV BGR 图像

        Returns:
            base64 编码的图像字符串
        """
        # 转换为 JPEG
        _, buffer = cv2.imencode('.jpg', image, [cv2.IMWRITE_JPEG_QUALITY, 95])
        # 转换为 base64
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        return image_base64

    def analyze_comprehensive(
        self,
        before_image: np.ndarray,
        after_image: np.ndarray,
        treatment_type: Optional[str] = None,
        focus_areas: Optional[List[str]] = None
    ) -> Dict:
        """
        综合分析术前术后照片

        Args:
            before_image: 术前图像 (OpenCV BGR 格式)
            after_image: 术后图像 (OpenCV BGR 格式)
            treatment_type: 治疗类型（如 "肉毒素注射", "玻尿酸填充" 等）
            focus_areas: 重点分析区域（如 ["额头", "眼周", "苹果肌"]）

        Returns:
            包含详细分析结果的字典
        """
        try:
            # 转换图像为 base64
            before_base64 = self.image_to_base64(before_image)
            after_base64 = self.image_to_base64(after_image)

            # 构建分析提示词
            analysis_prompt = self._build_analysis_prompt(treatment_type, focus_areas)

            # 调用 Claude API
            message = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": before_base64,
                                },
                            },
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": after_base64,
                                },
                            },
                            {
                                "type": "text",
                                "text": analysis_prompt
                            }
                        ]
                    }
                ],
                temperature=0.3,  # 较低温度以获得更一致的评分
            )

            # 解析 Claude 的响应
            response_text = message.content[0].text

            # 尝试从响应中提取 JSON
            analysis_result = self._parse_claude_response(response_text)

            # 添加元数据
            analysis_result['_meta'] = {
                'model': self.model,
                'treatment_type': treatment_type,
                'focus_areas': focus_areas,
                'tokens_used': message.usage.input_tokens + message.usage.output_tokens,
                'cost_usd': self._calculate_cost(message.usage)
            }

            return analysis_result

        except Exception as e:
            logger.error(f"Claude analysis failed: {str(e)}")
            return {
                "error": str(e),
                "success": False
            }

    def _build_analysis_prompt(
        self,
        treatment_type: Optional[str] = None,
        focus_areas: Optional[List[str]] = None
    ) -> str:
        """构建分析提示词"""

        treatment_context = f"\n治疗类型: {treatment_type}" if treatment_type else ""
        focus_context = f"\n重点关注区域: {', '.join(focus_areas)}" if focus_areas else ""

        prompt = f"""你是一位经验丰富的医美专家顾问。请仔细对比这两张术前术后照片，进行专业的量化分析。

**分析要求:**{treatment_context}{focus_context}

请从以下维度进行详细分析，每个维度给出 0-100 的评分：

## 1. 皱纹分析 (Wrinkle Analysis)
- **额头纹** (Forehead Lines): 横向皱纹的深度和数量
- **眉间纹** (Glabellar Lines): 眉间竖纹的深度
- **鱼尾纹** (Crow's Feet): 眼角皱纹的严重程度
- **鼻唇沟** (Nasolabial Folds): 法令纹的深度

## 2. 肤质分析 (Skin Quality)
- **肤色均匀度** (Skin Tone Evenness): 整体肤色的均匀程度
- **毛孔大小** (Pore Size): 可见毛孔的大小
- **皮肤光泽** (Skin Radiance): 皮肤的光泽度和健康感
- **色斑/色素沉着** (Pigmentation): 色斑、雀斑、暗沉

## 3. 面部轮廓 (Facial Contour)
- **苹果肌饱满度** (Apple Muscle Fullness): 面颊高点的饱满和立体感
- **下颌线清晰度** (Jawline Definition): 下颌轮廓的清晰度和紧致度
- **面部对称性** (Facial Symmetry): 左右面部的对称程度
- **面部紧致度** (Facial Firmness): 整体皮肤的紧致程度

## 4. 体积与饱满度 (Volume & Fullness)
- **太阳穴饱满度** (Temple Fullness): 太阳穴区域的饱满度
- **嘴唇饱满度** (Lip Fullness): 嘴唇的丰满度
- **泪沟凹陷** (Tear Trough): 眼下泪沟的严重程度

## 5. 综合评估 (Overall Assessment)
- **整体改善度** (Overall Improvement): 综合改善程度 (0-100%)
- **自然度** (Naturalness): 治疗效果的自然程度
- **年轻化效果** (Rejuvenation Effect): 整体年轻化的效果

**请严格按照以下 JSON 格式返回分析结果:**

```json
{{
  "wrinkle_analysis": {{
    "forehead_lines": {{
      "before_score": 45,
      "after_score": 78,
      "improvement_pct": 73,
      "description": "额头横纹明显减少，深度降低约70%"
    }},
    "glabellar_lines": {{
      "before_score": 40,
      "after_score": 75,
      "improvement_pct": 88,
      "description": "眉间纵纹几乎完全消失"
    }},
    "crows_feet": {{
      "before_score": 50,
      "after_score": 80,
      "improvement_pct": 60,
      "description": "鱼尾纹深度显著减轻"
    }},
    "nasolabial_folds": {{
      "before_score": 55,
      "after_score": 72,
      "improvement_pct": 31,
      "description": "法令纹有所改善但仍可见"
    }}
  }},
  "skin_quality": {{
    "tone_evenness": {{
      "before_score": 62,
      "after_score": 78,
      "improvement_pct": 26,
      "description": "肤色更加均匀，红血丝减少"
    }},
    "pore_size": {{
      "before_score": 58,
      "after_score": 72,
      "improvement_pct": 24,
      "description": "毛孔细腻度提升"
    }},
    "radiance": {{
      "before_score": 60,
      "after_score": 82,
      "improvement_pct": 37,
      "description": "皮肤光泽度明显提升，更加水润"
    }},
    "pigmentation": {{
      "before_score": 65,
      "after_score": 75,
      "improvement_pct": 15,
      "description": "色斑略有淡化"
    }}
  }},
  "facial_contour": {{
    "apple_muscle_fullness": {{
      "before_score": 65,
      "after_score": 88,
      "improvement_pct": 35,
      "description": "苹果肌明显饱满，面部立体感增强"
    }},
    "jawline_definition": {{
      "before_score": 58,
      "after_score": 79,
      "improvement_pct": 36,
      "description": "下颌线更加清晰，面部轮廓更紧致"
    }},
    "facial_symmetry": {{
      "before_score": 92,
      "after_score": 95,
      "improvement_pct": 3,
      "description": "面部对称性略有提升"
    }},
    "facial_firmness": {{
      "before_score": 60,
      "after_score": 78,
      "improvement_pct": 30,
      "description": "整体皮肤紧致度显著提升"
    }}
  }},
  "volume_fullness": {{
    "temple_fullness": {{
      "before_score": 55,
      "after_score": 70,
      "improvement_pct": 27,
      "description": "太阳穴区域饱满度改善"
    }},
    "lip_fullness": {{
      "before_score": 70,
      "after_score": 72,
      "improvement_pct": 3,
      "description": "嘴唇饱满度基本保持"
    }},
    "tear_trough": {{
      "before_score": 50,
      "after_score": 75,
      "improvement_pct": 50,
      "description": "泪沟凹陷明显改善"
    }}
  }},
  "overall_assessment": {{
    "overall_improvement": 68,
    "naturalness": 92,
    "rejuvenation_effect": 75,
    "summary": "整体效果显著，皱纹减少明显，面部轮廓更加立体饱满，皮肤质感大幅提升。治疗效果自然，未出现过度僵硬或不自然的情况。",
    "recommendations": [
      "建议3-4个月后进行维持性治疗",
      "可考虑增加眼周精细化护理",
      "保持良好的防晒习惯以维持效果"
    ]
  }}
}}
```

**重要提示:**
1. 评分标准：0分最差，100分最完美
2. improvement_pct = ((after_score - before_score) / (100 - before_score)) * 100
3. 请基于专业医美标准进行客观评估
4. description 应简洁专业，突出关键改善点
5. 必须返回有效的 JSON 格式，不要包含其他文字

请开始分析："""

        return prompt

    def _parse_claude_response(self, response_text: str) -> Dict:
        """
        解析 Claude 的响应文本

        Args:
            response_text: Claude 返回的文本

        Returns:
            解析后的字典
        """
        try:
            # 尝试提取 JSON (处理可能的 markdown 代码块)
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            elif "{" in response_text:
                json_start = response_text.find("{")
                json_end = response_text.rfind("}") + 1
                json_text = response_text[json_start:json_end]
            else:
                json_text = response_text

            # 解析 JSON
            result = json.loads(json_text)
            result['success'] = True
            result['raw_response'] = response_text

            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response as JSON: {str(e)}")
            return {
                "success": False,
                "error": "JSON parsing failed",
                "raw_response": response_text
            }

    def _calculate_cost(self, usage) -> float:
        """
        计算 API 调用成本

        Claude 3.5 Sonnet 定价:
        - Input: $3 / 1M tokens
        - Output: $15 / 1M tokens
        """
        input_cost = (usage.input_tokens / 1_000_000) * 3.0
        output_cost = (usage.output_tokens / 1_000_000) * 15.0
        return round(input_cost + output_cost, 4)

    def analyze_single_image(
        self,
        image: np.ndarray,
        analysis_type: str = "skin_assessment"
    ) -> Dict:
        """
        分析单张照片（用于术前评估）

        Args:
            image: 输入图像
            analysis_type: 分析类型 (skin_assessment, facial_features, etc.)

        Returns:
            分析结果
        """
        try:
            image_base64 = self.image_to_base64(image)

            prompt = f"""请对这张面部照片进行专业医美评估。

分析维度：
1. 当前皮肤状态（皱纹、毛孔、色斑）
2. 面部轮廓特征（苹果肌、下颌线、对称性）
3. 建议的治疗方案

请返回 JSON 格式的评估结果。"""

            message = self.client.messages.create(
                model=self.model,
                max_tokens=2048,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": image_base64,
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            )

            response_text = message.content[0].text
            result = self._parse_claude_response(response_text)

            result['_meta'] = {
                'analysis_type': analysis_type,
                'tokens_used': message.usage.input_tokens + message.usage.output_tokens,
                'cost_usd': self._calculate_cost(message.usage)
            }

            return result

        except Exception as e:
            logger.error(f"Single image analysis failed: {str(e)}")
            return {
                "error": str(e),
                "success": False
            }


# 便捷函数
def analyze_before_after(
    before_image_path: str,
    after_image_path: str,
    api_key: str,
    treatment_type: Optional[str] = None
) -> Dict:
    """
    分析术前术后照片的便捷函数

    Args:
        before_image_path: 术前图像路径
        after_image_path: 术后图像路径
        api_key: Claude API Key
        treatment_type: 治疗类型

    Returns:
        分析结果
    """
    # 加载图像
    before_img = cv2.imread(before_image_path)
    after_img = cv2.imread(after_image_path)

    if before_img is None or after_img is None:
        raise ValueError("Failed to load images")

    # 创建分析器并分析
    analyzer = ClaudeVisionAnalyzer(api_key=api_key)
    result = analyzer.analyze_comprehensive(
        before_image=before_img,
        after_image=after_img,
        treatment_type=treatment_type
    )

    return result
