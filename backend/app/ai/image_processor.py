"""
图像处理模块
使用OpenCV和MediaPipe进行人脸检测、对齐和标准化
"""

import cv2
import numpy as np
from PIL import Image
import mediapipe as mp
from typing import Tuple, List, Optional, Dict
import logging

logger = logging.getLogger(__name__)


class ImageProcessor:
    """图像处理器"""

    def __init__(self):
        """初始化MediaPipe Face Mesh"""
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )

    def detect_face_landmarks(self, image: np.ndarray) -> Optional[Dict]:
        """
        检测人脸关键点

        Args:
            image: BGR格式的图像

        Returns:
            包含关键点的字典，如果未检测到人脸则返回None
        """
        try:
            # 转换为RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # 检测人脸
            results = self.face_mesh.process(rgb_image)

            if not results.multi_face_landmarks:
                logger.warning("No face detected in image")
                return None

            # 获取第一个人脸的关键点
            face_landmarks = results.multi_face_landmarks[0]

            # 转换为像素坐标
            h, w = image.shape[:2]
            landmarks_list = []
            for landmark in face_landmarks.landmark:
                x = int(landmark.x * w)
                y = int(landmark.y * h)
                landmarks_list.append((x, y))

            # 获取关键点（眼睛、鼻子、嘴巴）
            # MediaPipe Face Mesh有468个关键点
            left_eye = landmarks_list[33]   # 左眼
            right_eye = landmarks_list[263]  # 右眼
            nose = landmarks_list[1]         # 鼻尖
            mouth_left = landmarks_list[61]  # 嘴角左
            mouth_right = landmarks_list[291] # 嘴角右

            return {
                "all_landmarks": landmarks_list,
                "key_points": {
                    "left_eye": left_eye,
                    "right_eye": right_eye,
                    "nose": nose,
                    "mouth_left": mouth_left,
                    "mouth_right": mouth_right
                }
            }

        except Exception as e:
            logger.error(f"Face detection failed: {str(e)}")
            return None

    def align_face(
        self,
        image: np.ndarray,
        landmarks: Dict,
        desired_size: Tuple[int, int] = (1000, 1000)
    ) -> np.ndarray:
        """
        对齐人脸

        基于眼睛位置旋转和缩放图像，使人脸保持标准姿态

        Args:
            image: 输入图像
            landmarks: 人脸关键点
            desired_size: 目标尺寸

        Returns:
            对齐后的图像
        """
        try:
            key_points = landmarks["key_points"]
            left_eye = np.array(key_points["left_eye"])
            right_eye = np.array(key_points["right_eye"])

            # 计算两眼之间的角度
            dY = right_eye[1] - left_eye[1]
            dX = right_eye[0] - left_eye[0]
            angle = np.degrees(np.arctan2(dY, dX))

            # 计算两眼的中心点
            eyes_center = ((left_eye[0] + right_eye[0]) // 2,
                          (left_eye[1] + right_eye[1]) // 2)

            # 获取旋转矩阵
            M = cv2.getRotationMatrix2D(eyes_center, angle, 1.0)

            # 旋转图像
            h, w = image.shape[:2]
            aligned = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC)

            # 计算缩放比例（使两眼距离标准化）
            eye_distance = np.linalg.norm(right_eye - left_eye)
            desired_eye_distance = desired_size[0] * 0.35  # 眼睛距离约为图像宽度的35%
            scale = desired_eye_distance / eye_distance

            # 缩放图像
            scaled = cv2.resize(aligned, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

            # 裁剪到目标尺寸
            h, w = scaled.shape[:2]
            center_x, center_y = w // 2, h // 2
            half_size = desired_size[0] // 2

            y1 = max(0, center_y - half_size)
            y2 = min(h, center_y + half_size)
            x1 = max(0, center_x - half_size)
            x2 = min(w, center_x + half_size)

            cropped = scaled[y1:y2, x1:x2]

            # 如果裁剪后尺寸不够，填充
            if cropped.shape[0] < desired_size[0] or cropped.shape[1] < desired_size[1]:
                padded = np.zeros((desired_size[0], desired_size[1], 3), dtype=np.uint8)
                y_offset = (desired_size[0] - cropped.shape[0]) // 2
                x_offset = (desired_size[1] - cropped.shape[1]) // 2
                padded[y_offset:y_offset+cropped.shape[0],
                       x_offset:x_offset+cropped.shape[1]] = cropped
                cropped = padded

            # 确保最终尺寸正确
            final = cv2.resize(cropped, desired_size, interpolation=cv2.INTER_CUBIC)

            return final

        except Exception as e:
            logger.error(f"Face alignment failed: {str(e)}")
            return cv2.resize(image, desired_size)

    def standardize_lighting(self, image: np.ndarray) -> np.ndarray:
        """
        标准化光照

        使用CLAHE（对比度限制自适应直方图均衡化）

        Args:
            image: 输入图像

        Returns:
            光照标准化后的图像
        """
        try:
            # 转换到LAB色彩空间
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)

            # 对L通道应用CLAHE
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l_equalized = clahe.apply(l)

            # 合并通道
            lab_equalized = cv2.merge([l_equalized, a, b])

            # 转换回BGR
            result = cv2.cvtColor(lab_equalized, cv2.COLOR_LAB2BGR)

            return result

        except Exception as e:
            logger.error(f"Lighting standardization failed: {str(e)}")
            return image

    def remove_background(
        self,
        image: np.ndarray,
        blur: bool = True,
        blur_strength: int = 25
    ) -> np.ndarray:
        """
        背景处理

        可选择模糊背景或替换为纯色

        Args:
            image: 输入图像
            blur: 是否模糊背景
            blur_strength: 模糊强度

        Returns:
            处理后的图像
        """
        try:
            if blur:
                # 简单的模糊处理（实际应用中可以使用更高级的分割）
                blurred = cv2.GaussianBlur(image, (blur_strength, blur_strength), 0)
                return blurred
            else:
                return image

        except Exception as e:
            logger.error(f"Background processing failed: {str(e)}")
            return image

    def process_single_image(
        self,
        image_path: str,
        output_size: Tuple[int, int] = (1000, 1000)
    ) -> Tuple[np.ndarray, Dict]:
        """
        处理单张图像的完整流程

        Args:
            image_path: 图像路径
            output_size: 输出尺寸

        Returns:
            (处理后的图像, 元数据)
        """
        try:
            # 读取图像
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Failed to load image: {image_path}")

            # 1. 检测人脸关键点
            landmarks = self.detect_face_landmarks(image)
            if landmarks is None:
                raise ValueError("No face detected")

            # 2. 对齐人脸
            aligned = self.align_face(image, landmarks, output_size)

            # 3. 标准化光照
            standardized = self.standardize_lighting(aligned)

            # 4. 背景处理（可选）
            # final = self.remove_background(standardized, blur=False)

            metadata = {
                "face_detected": True,
                "landmarks_count": len(landmarks["all_landmarks"]),
                "processed_size": output_size
            }

            return standardized, metadata

        except Exception as e:
            logger.error(f"Image processing failed: {str(e)}")
            raise

    def align_image_pair(
        self,
        before_image: np.ndarray,
        after_image: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        对齐一对术前术后图像

        确保两张图像中的人脸完美对齐

        Args:
            before_image: 术前图像
            after_image: 术后图像

        Returns:
            (对齐后的术前图像, 对齐后的术后图像)
        """
        try:
            # 检测两张图像的关键点
            landmarks_before = self.detect_face_landmarks(before_image)
            landmarks_after = self.detect_face_landmarks(after_image)

            if landmarks_before is None or landmarks_after is None:
                raise ValueError("Failed to detect face in one or both images")

            # 对齐两张图像
            aligned_before = self.align_face(before_image, landmarks_before)
            aligned_after = self.align_face(after_image, landmarks_after)

            # 标准化光照
            std_before = self.standardize_lighting(aligned_before)
            std_after = self.standardize_lighting(aligned_after)

            return std_before, std_after

        except Exception as e:
            logger.error(f"Image pair alignment failed: {str(e)}")
            raise

    def create_side_by_side(
        self,
        before_image: np.ndarray,
        after_image: np.ndarray,
        labels: bool = True
    ) -> np.ndarray:
        """
        创建并排对比图

        Args:
            before_image: 术前图像
            after_image: 术后图像
            labels: 是否添加标签

        Returns:
            并排对比图
        """
        try:
            h, w = before_image.shape[:2]

            # 创建画布
            canvas = np.zeros((h, w * 2, 3), dtype=np.uint8)
            canvas[:, :w] = before_image
            canvas[:, w:] = after_image

            if labels:
                # 添加"Before"和"After"标签
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 1.5
                font_thickness = 3
                font_color = (255, 255, 255)

                cv2.putText(canvas, "Before", (50, 50), font, font_scale,
                           font_color, font_thickness, cv2.LINE_AA)
                cv2.putText(canvas, "After", (w + 50, 50), font, font_scale,
                           font_color, font_thickness, cv2.LINE_AA)

            return canvas

        except Exception as e:
            logger.error(f"Side-by-side creation failed: {str(e)}")
            raise
