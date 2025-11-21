/**
 * AR拍照屏幕
 * TODO: 实现AR辅助拍照功能
 */

import React from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'

export default function CameraScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AR辅助拍照</Text>
        <Text style={styles.subtitle}>
          功能开发中...
        </Text>
        <Text style={styles.description}>
          将实现：{'\n'}
          • AR面部轮廓对齐{'\n'}
          • 实时角度、距离、光线检测{'\n'}
          • 自动拍摄最佳照片{'\n'}
          • 照片质量评估
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'center',
  },
})
