/**
 * 报告列表屏幕
 */

import React from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'

export default function ReportsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>报告管理</Text>
      <Text style={styles.subtitle}>功能开发中...</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
})
