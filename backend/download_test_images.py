"""
下载测试用的医美术前术后照片
从公开的医美案例图片库下载示例
"""

import os
from pathlib import Path


def create_test_directory():
    """创建测试目录"""
    test_dir = Path(__file__).parent / "test_images"
    test_dir.mkdir(exist_ok=True)
    return test_dir


def show_instructions():
    """显示获取测试图片的说明"""

    print("=" * 60)
    print("🖼️  获取测试图片指南")
    print("=" * 60)

    test_dir = create_test_directory()

    print(f"\n📁 测试图片目录已创建: {test_dir}")

    print("\n" + "=" * 60)
    print("方法 1: 从网上下载医美案例照片 (推荐)")
    print("=" * 60)

    print("""
🔍 搜索关键词:
   - Google: "botox before after"
   - 百度: "肉毒素 术前术后对比"
   - 新氧/更美 App 的案例照片

📥 下载步骤:
1. 找到一组术前术后对比照片
2. 保存术前照片为: before.jpg
3. 保存术后照片为: after.jpg
4. 放到这个目录: {test_dir}

✅ 最终应该有:
   {test_dir}/before.jpg
   {test_dir}/after.jpg
    """)

    print("\n" + "=" * 60)
    print("方法 2: 使用示例网址 (快速测试)")
    print("=" * 60)

    print("""
如果只是想测试 API 功能，可以使用这些公开的示例:

🌐 Unsplash (免费人像照片):
   https://unsplash.com/s/photos/portrait

📸 建议:
1. 下载 2 张不同的人脸照片
2. 重命名为 before.jpg 和 after.jpg
3. 虽然不是真的术前术后，但可以测试 Claude 的分析能力
    """)

    print("\n" + "=" * 60)
    print("方法 3: 使用模拟数据 (开发测试)")
    print("=" * 60)

    print("""
如果你只想测试代码逻辑，不关心分析结果:

可以用任意 2 张照片，Claude 会尽力分析它们的差异。
    """)

    print("\n" + "=" * 60)
    print("💡 提示")
    print("=" * 60)

    print("""
真实使用场景:

医美诊所的工作流程：

1. 患者来诊所 → 术前拍照
   ├── 医生用 iPad/手机 App
   ├── AR 辅助确保角度一致
   └── 保存到云端数据库

2. 进行治疗（肉毒素/玻尿酸/激光等）

3. 4-6周后复查 → 术后拍照
   ├── 同样的设备和角度
   └── AR 对齐确保可对比

4. 点击"生成分析" → 调用 Claude API
   ├── 自动对比术前术后
   ├── 量化改善数据
   └── 生成专业报告

5. 报告分享
   ├── 医生查看详细数据
   ├── 患者获得精美版本
   └── 可分享到社交媒体
    """)

    print("\n" + "=" * 60)
    print(f"📂 准备好测试图片后，运行:")
    print("   python test_claude_analysis.py")
    print("=" * 60)


def check_existing_images():
    """检查是否已有测试图片"""
    test_dir = Path(__file__).parent / "test_images"

    if not test_dir.exists():
        return False

    before = test_dir / "before.jpg"
    after = test_dir / "after.jpg"

    if before.exists() and after.exists():
        print("\n✅ 找到测试图片!")
        print(f"   术前: {before}")
        print(f"   术后: {after}")
        print(f"\n   术前大小: {before.stat().st_size / 1024:.1f} KB")
        print(f"   术后大小: {after.stat().st_size / 1024:.1f} KB")
        return True
    else:
        print("\n⚠️  测试图片未找到")
        if before.exists():
            print(f"   ✅ 找到 before.jpg")
        else:
            print(f"   ❌ 缺少 before.jpg")

        if after.exists():
            print(f"   ✅ 找到 after.jpg")
        else:
            print(f"   ❌ 缺少 after.jpg")
        return False


if __name__ == "__main__":
    show_instructions()

    # 检查是否已有图片
    if not check_existing_images():
        print("\n💡 按照上面的说明获取测试图片后，就可以开始测试了！")
