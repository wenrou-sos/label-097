<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores'
import dayjs from 'dayjs'
import type { Appointment } from '@/types'

const route = useRoute()
const router = useRouter()
const appointmentStore = useAppointmentStore()

const phone = computed(() => route.params.phone as string)
const profile = computed(() => appointmentStore.getVisitorProfileByPhone(phone.value))

const expandedRecordIds = ref<Set<string>>(new Set())

const getAptByRecordId = (recordId: string): Appointment | undefined => {
  return profile.value?.appointments.find(a => a.recordId === recordId)
}

const sortedRecords = computed(() => {
  if (!profile.value) return []
  return [...profile.value.records].sort((a, b) => {
    const aptA = getAptByRecordId(a.id)
    const aptB = getAptByRecordId(b.id)
    const timeA = aptA ? dayjs(`${aptA.date} ${aptA.startTime}`).valueOf() : 0
    const timeB = aptB ? dayjs(`${aptB.date} ${aptB.startTime}`).valueOf() : 0
    return timeB - timeA
  })
})

const toggleExpand = (recordId: string) => {
  if (expandedRecordIds.value.has(recordId)) {
    expandedRecordIds.value.delete(recordId)
  } else {
    expandedRecordIds.value.add(recordId)
  }
}

const isExpanded = (recordId: string) => expandedRecordIds.value.has(recordId)

const goBack = () => {
  router.back()
}

const goRecordForm = (aptId: string) => {
  router.push(`/counselor/record/${aptId}`)
}

const formatDate = (apt?: Appointment) => {
  if (!apt) return ''
  return `${apt.date} ${apt.startTime}-${apt.endTime}`
}
</script>

<template>
  <div class="visitor-profile-page" v-if="profile">
    <button class="back-btn" @click="goBack">
      <el-icon><ArrowLeft /></el-icon>
      返回
    </button>

    <section class="info-card card">
      <div class="info-header">
        <el-avatar :size="64" class="visitor-avatar">
          {{ profile.name.charAt(0) }}
        </el-avatar>
        <div class="visitor-basic">
          <h2 class="visitor-name">{{ profile.name }}</h2>
          <p class="visitor-phone">
            <el-icon :size="13"><Phone /></el-icon>
            {{ profile.phone }}
          </p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon first-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">首次咨询</div>
            <div class="stat-value">{{ profile.firstConsultTime }}</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon count-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">咨询总次数</div>
            <div class="stat-value">{{ profile.totalConsultCount }} 次</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon total-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">累计预约</div>
            <div class="stat-value">{{ profile.appointments.length }} 次</div>
          </div>
        </div>
      </div>
    </section>

    <section class="records-card card">
      <div class="records-header">
        <h3 class="records-title">
          <el-icon color="#6a11cb"><Document /></el-icon>
          咨询历史记录
        </h3>
        <span class="records-count">共 {{ sortedRecords.length }} 条记录</span>
      </div>

      <div class="record-list" v-if="sortedRecords.length > 0">
        <div
          v-for="record in sortedRecords"
          :key="record.id"
          class="record-item"
        >
          <div class="record-summary" @click="toggleExpand(record.id)">
            <div class="record-time">
              <el-icon color="#6a11cb"><Calendar /></el-icon>
              <span>{{ formatDate(getAptByRecordId(record.id)) }}</span>
            </div>
            <div class="record-method">
              <el-tag size="small" type="warning" effect="light">
                {{ getAptByRecordId(record.id)?.consultationMethod }}
              </el-tag>
            </div>
            <div class="record-issue">
              <span class="issue-label">核心问题：</span>
              <span class="issue-text">{{ record.coreIssue }}</span>
            </div>
            <div class="expand-icon">
              <el-icon :class="{ rotated: isExpanded(record.id) }">
                <ArrowDown />
              </el-icon>
            </div>
          </div>
          <transition name="expand">
            <div class="record-detail" v-show="isExpanded(record.id)">
              <div class="detail-row">
                <div class="detail-label">
                  <el-icon color="#52c41a"><User /></el-icon>
                  访客状态
                </div>
                <div class="detail-content">{{ record.clientStatus }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">
                  <el-icon color="#fa8c16"><Warning /></el-icon>
                  核心问题
                </div>
                <div class="detail-content">{{ record.coreIssue }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">
                  <el-icon color="#1890ff"><MagicStick /></el-icon>
                  介入方案
                </div>
                <div class="detail-content">{{ record.interventionPlan }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">
                  <el-icon color="#722ed1"><Promotion /></el-icon>
                  下次计划
                </div>
                <div class="detail-content">{{ record.nextPlan }}</div>
              </div>
              <div class="detail-actions">
                <el-button size="small" type="primary" @click.stop="goRecordForm(getAptByRecordId(record.id)?.id || '')">
                  <el-icon><EditPen /></el-icon>
                  编辑记录
                </el-button>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <el-empty v-else description="该访客暂无咨询记录" class="empty" />
    </section>
  </div>

  <el-empty v-else description="未找到该访客档案" class="empty-page" />
</template>

<style scoped>
.visitor-profile-page {
  max-width: 900px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f7fa;
  color: #2575fc;
  border-color: #2575fc40;
}

.info-card {
  padding: 28px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.visitor-avatar {
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  font-size: 24px;
  font-weight: 600;
}

.visitor-name {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #1f1f1f;
}

.visitor-phone {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #888;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.first-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.count-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.total-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.records-card {
  padding: 24px 28px;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.records-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 600;
  margin: 0;
}

.records-count {
  font-size: 13px;
  color: #999;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.record-item:hover {
  border-color: #6a11cb40;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.06);
}

.record-summary {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fafbfc;
  cursor: pointer;
  transition: background 0.2s;
}

.record-summary:hover {
  background: #f5f7fa;
}

.record-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.record-issue {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  overflow: hidden;
}

.issue-label {
  color: #999;
  flex-shrink: 0;
}

.issue-text {
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-icon {
  color: #bbb;
  transition: transform 0.25s;
  display: flex;
}

.expand-icon.rotated {
  transform: rotate(180deg);
  color: #6a11cb;
}

.record-detail {
  padding: 0 20px;
  background: #fff;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
}

.detail-row {
  padding: 14px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.detail-row:last-of-type {
  border-bottom: none;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}

.detail-content {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  padding-left: 20px;
}

.detail-actions {
  padding: 14px 0 18px;
  display: flex;
  justify-content: flex-end;
}

.empty,
.empty-page {
  padding: 60px 0;
}

@media (max-width: 720px) {
  .info-card {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .record-summary {
    grid-template-columns: 1fr auto;
    gap: 8px;
  }

  .record-time {
    grid-column: 1 / -1;
  }

  .record-issue {
    grid-column: 1 / -1;
    order: 3;
  }

  .records-card {
    padding: 20px;
  }
}
</style>
