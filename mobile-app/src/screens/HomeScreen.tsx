/**
 * 首页屏幕
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native'
import { Camera, Users, TrendingUp, FileText } from 'lucide-react-native'

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>GlowTrack AI</Text>
          <Text style={styles.subtitle}>医美术前术后AI对比系统</Text>
        </View>

        {/* 快速操作 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速操作</Text>

          <TouchableOpacity
            style={[styles.card, styles.primaryCard]}
            onPress={() => navigation.navigate('Camera')}
          >
            <Camera color="#fff" size={32} />
            <Text style={styles.cardTitlePrimary}>AR辅助拍照</Text>
            <Text style={styles.cardSubtitlePrimary}>
              拍摄标准化术前术后照片
            </Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.card, styles.smallCard]}
              onPress={() => navigation.navigate('Patients')}
            >
              <Users color="#0ea5e9" size={24} />
              <Text style={styles.cardTitle}>患者管理</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.smallCard]}
              onPress={() => navigation.navigate('Reports')}
            >
              <FileText color="#0ea5e9" size={24} />
              <Text style={styles.cardTitle}>查看报告</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 统计数据 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日统计</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>新增照片</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>新增分析</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>生成报告</Text>
            </View>
          </View>
        </View>

        {/* 最近活动 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近活动</Text>

          {recentActivities.map((activity, index) => (
            <View key={index} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <activity.icon color="#0ea5e9" size={20} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const recentActivities = [
  {
    icon: Camera,
    title: '为患者 Jane Doe 拍摄术后照片',
    time: '10分钟前',
  },
  {
    icon: TrendingUp,
    title: '完成 Botox 治疗分析',
    time: '1小时前',
  },
  {
    icon: FileText,
    title: '生成患者报告',
    time: '2小时前',
  },
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryCard: {
    backgroundColor: '#0ea5e9',
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitlePrimary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  cardSubtitlePrimary: {
    fontSize: 14,
    color: '#e0f2fe',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  smallCard: {
    flex: 1,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#111827',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
})
