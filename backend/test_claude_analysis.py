"""
Claude Vision API 测试脚本
快速测试医美分析功能
"""

import os
import sys
from pathlib import Path

# 添加 app 到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from app.ai.claude_analyzer import ClaudeVisionAnalyzer, analyze_before_after
import cv2


def test_analysis():
    """测试 Claude 分析功能"""

    print("=" * 60)
    print("GlowTrack AI - Claude Vision 分析测试")
    print("=" * 60)

    # 检查 API Key
    api_key = os.getenv("CLAUDE_API_KEY")
    if not api_key:
        print("❌ 错误: 未找到 CLAUDE_API_KEY 环境变量")
        print("\n请设置环境变量:")
        print("  export CLAUDE_API_KEY=sk-ant-api03-xxx  # Mac/Linux")
        print("  set CLAUDE_API_KEY=sk-ant-api03-xxx     # Windows")
        return

    print(f"✅ API Key: {api_key[:20]}...")

    # 检查测试图片
    test_dir = Path(__file__).parent / "test_images"
    if not test_dir.exists():
        print(f"\n⚠️  提示: 创建 {test_dir} 目录并放入测试图片")
        print("     - test_images/before.jpg")
        print("     - test_images/after.jpg")
        print("\n或者指定自定义图片路径:")
        before_path = input("术前图片路径 (按回车跳过): ").strip()
        after_path = input("术后图片路径 (按回车跳过): ").strip()

        if not before_path or not after_path:
            print("\n使用模拟模式测试 API 连接...")
            test_api_connection(api_key)
            return
    else:
        before_path = str(test_dir / "before.jpg")
        after_path = str(test_dir / "after.jpg")

    # 加载图片
    print(f"\n📸 加载图片...")
    print(f"   术前: {before_path}")
    print(f"   术后: {after_path}")

    before_img = cv2.imread(before_path)
    after_img = cv2.imread(after_path)

    if before_img is None:
        print(f"❌ 无法加载术前图片: {before_path}")
        return
    if after_img is None:
        print(f"❌ 无法加载术后图片: {after_path}")
        return

    print(f"   术前尺寸: {before_img.shape}")
    print(f"   术后尺寸: {after_img.shape}")

    # 执行分析
    print("\n🤖 开始 Claude AI 分析...")
    print("   (这可能需要 5-10 秒)")

    try:
        analyzer = ClaudeVisionAnalyzer(api_key=api_key)

        result = analyzer.analyze_comprehensive(
            before_image=before_img,
            after_image=after_img,
            treatment_type="肉毒素注射",
            focus_areas=["额头", "眼周", "苹果肌"]
        )

        # 显示结果
        print_results(result)

    except Exception as e:
        print(f"\n❌ 分析失败: {str(e)}")
        import traceback
        traceback.print_exc()


def test_api_connection(api_key: str):
    """测试 API 连接"""
    print("\n🔌 测试 Claude API 连接...")

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        # 简单的测试调用
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=100,
            messages=[
                {
                    "role": "user",
                    "content": "Hello! 请用中文回复：GlowTrack AI 测试成功"
                }
            ]
        )

        response = message.content[0].text
        print(f"\n✅ API 连接成功!")
        print(f"   Claude 回复: {response}")
        print(f"   使用 tokens: {message.usage.input_tokens + message.usage.output_tokens}")

    except Exception as e:
        print(f"\n❌ API 连接失败: {str(e)}")


def print_results(result: dict):
    """打印分析结果"""

    if not result.get('success'):
        print(f"\n❌ 分析失败: {result.get('error')}")
        if 'raw_response' in result:
            print(f"\n原始响应:\n{result['raw_response']}")
        return

    print("\n" + "=" * 60)
    print("📊 分析结果")
    print("=" * 60)

    # 综合评估
    overall = result.get('overall_assessment', {})
    print(f"\n🎯 综合评估:")
    print(f"   整体改善度: {overall.get('overall_improvement', 0)}%")
    print(f"   自然度评分: {overall.get('naturalness', 0)}/100")
    print(f"   年轻化效果: {overall.get('rejuvenation_effect', 0)}/100")

    if 'summary' in overall:
        print(f"\n   总结: {overall['summary']}")

    # 皱纹分析
    wrinkles = result.get('wrinkle_analysis', {})
    if wrinkles:
        print(f"\n📈 皱纹分析:")
        for key, data in wrinkles.items():
            if isinstance(data, dict):
                name = {
                    'forehead_lines': '额头纹',
                    'glabellar_lines': '眉间纹',
                    'crows_feet': '鱼尾纹',
                    'nasolabial_folds': '法令纹'
                }.get(key, key)
                print(f"   {name}:")
                print(f"      术前: {data.get('before_score', 0)} → 术后: {data.get('after_score', 0)}")
                print(f"      改善: {data.get('improvement_pct', 0)}%")

    # 面部轮廓
    contour = result.get('facial_contour', {})
    if contour:
        print(f"\n💎 面部轮廓:")
        apple = contour.get('apple_muscle_fullness', {})
        if apple:
            print(f"   苹果肌饱满度:")
            print(f"      术前: {apple.get('before_score', 0)} → 术后: {apple.get('after_score', 0)}")
            print(f"      改善: {apple.get('improvement_pct', 0)}%")

        jawline = contour.get('jawline_definition', {})
        if jawline:
            print(f"   下颌线清晰度:")
            print(f"      术前: {jawline.get('before_score', 0)} → 术后: {jawline.get('after_score', 0)}")
            print(f"      改善: {jawline.get('improvement_pct', 0)}%")

    # 成本信息
    meta = result.get('_meta', {})
    if meta:
        print(f"\n💰 API 使用信息:")
        print(f"   模型: {meta.get('model', 'N/A')}")
        print(f"   Tokens 使用: {meta.get('tokens_used', 0)}")
        print(f"   成本: ${meta.get('cost_usd', 0):.4f}")

    # 建议
    recommendations = overall.get('recommendations', [])
    if recommendations:
        print(f"\n💡 专业建议:")
        for i, rec in enumerate(recommendations, 1):
            print(f"   {i}. {rec}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    test_analysis()
