<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores'
import dayjs from 'dayjs'

const router = useRouter()
const appointmentStore = useAppointmentStore()

const activeTab = ref<'all' | 'completed' | 'pending'>('all')

const statusLabel = (s: string) => ({
  pending: '待填写',
  confirmed: '待填写',
  completed: '已填写',
  cancelled: '已取消'
} as Record<string, string>)[s] || s

const list = computed(() => {
  const apts = [...appointmentStore.appointmentsForCounselor]
    .sort((a, b) => dayjs(`${b.date} ${b.startTime}`).valueOf() - dayjs(`${a.date} ${a.startTime}`).valueOf())

  if (activeTab.value === 'completed') {
    return apts.filter(a => a.status === 'completed')
  }
  if (activeTab.value === 'pending') {
    return apts.filter(a => a.status === 'confirmed' || a.status === 'pending')
  }
  return apts
})

const goRecordForm = (aptId: string) => {
  router.push(`/counselor/record/${aptId}`)
}

const hasRecord = (aptId: string) => {
  return !!appointmentStore.getRecordByAppointmentId(aptId)
}
</script>

<template>
  <div class="records-page">
    <div class="page-header card">
      <h2 class="page-title">
        <el-icon color="#2575fc"><Document /></el-icon>
        咨询记录管理
      </h2>
      <p class="page-desc">管理您的所有咨询预约及记录，可查看、编辑、新增咨询档案</p>
    </div>

    <div class="tabs-card card">
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="全部预约" name="all">
          <span class="count">{{ appointmentStore.appointmentsForCounselor.length }}</span>
        </el-tab-pane>
        <el-tab-pane label="待填写记录" name="pending">
          <span class="count">{{ appointmentStore.appointmentsForCounselor.filter(a => a.status === 'confirmed').length }}</span>
        </el-tab-pane>
        <el-tab-pane label="已完成记录" name="completed">
          <span class="count">{{ appointmentStore.appointmentsForCounselor.filter(a => a.status === 'completed').length }}</span>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="list-card card" v-if="list.length > 0">
      <div class="table-head">
        <div class="th">访客/时间</div>
        <div class="th">咨询方式</div>
        <div class="th">状态</div>
        <div class="th">操作</div>
      </div>
      <div
        v-for="apt in list"
        :key="apt.id"
        class="row"
      >
        <div class="td main-td">
          <div class="client-block">
            <el-avatar :size="40" style="background: linear-gradient(135deg, #6a11cb, #2575fc)">
              {{ apt.clientName.charAt(0) }}
            </el-avatar>
            <div class="client-info">
              <div class="name">
                <router-link :to="`/counselor/visitor/${apt.clientPhone}`" class="name-link">
                  {{ apt.clientName }}
                </router-link>
                <el-tag size="small" type="info" effect="plain">{{ apt.clientPhone }}</el-tag>
              </div>
              <div class="time">
                <el-icon :size="12"><Calendar /></el-icon>
                {{ apt.date }} {{ apt.startTime }}-{{ apt.endTime }}
              </div>
            </div>
          </div>
          <div class="problem">{{ apt.problemDescription.slice(0, 60) }}...</div>
        </div>
        <div class="td">
          <el-tag type="warning" effect="light">
            <el-icon :size="12"><ChatDotRound /></el-icon>
            {{ apt.consultationMethod }}
          </el-tag>
        </div>
        <div class="td">
          <el-tag
            v-if="apt.status === 'completed'"
            type="success" effect="light">
            {{ statusLabel(apt.status) }}
          </el-tag>
          <el-tag
            v-else-if="apt.status === 'cancelled'"
            type="info" effect="light">
            {{ statusLabel(apt.status) }}
          </el-tag>
          <el-tag
            v-else
            type="warning" effect="dark">
            {{ statusLabel(apt.status) }}
          </el-tag>
        </div>
        <div class="td actions">
          <el-button
            size="small"
            type="primary"
            @click="goRecordForm(apt.id)"
          >
            <el-icon :size="13">{{ hasRecord(apt.id) ? 'View' : 'EditPen' }}</el-icon>
            {{ hasRecord(apt.id) ? '查看/编辑' : '填写记录' }}
          </el-button>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无相关咨询记录" class="empty" />
  </div>
</template>

<style scoped>
.records-page {
  max-width: 1100px;
}

.page-header {
  padding: 24px 28px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-left: 4px solid #6a11cb;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.page-desc {
  color: #777;
  font-size: 13px;
}

.tabs-card {
  padding: 8px 24px 0;
  margin-bottom: 16px;
}

.main-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  padding: 0 20px;
}

.count {
  display: inline-block;
  min-width: 22px;
  padding: 0 7px;
  height: 20px;
  line-height: 20px;
  margin-left: 4px;
  background: #f0f2f5;
  border-radius: 10px;
  font-size: 11px;
  color: #666;
  text-align: center;
}

:deep(.el-tabs__item.is-active .count) {
  background: #2575fc20;
  color: #2575fc;
}

.list-card {
  padding: 0;
  overflow: hidden;
}

.table-head,
.row {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1.1fr;
  align-items: center;
  gap: 12px;
}

.table-head {
  padding: 14px 24px;
  background: #fafbfc;
  border-bottom: 1px solid #f0f0f0;
}

.th {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.row {
  padding: 18px 24px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.row:hover {
  background: #fafbff;
}

.row:last-child {
  border-bottom: none;
}

.main-td {
  flex-direction: column;
  align-items: flex-start;
}

.client-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.client-info .name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 4px;
}

.name-link {
  color: #2575fc;
  text-decoration: none;
  transition: color 0.2s;
}

.name-link:hover {
  color: #6a11cb;
  text-decoration: underline;
}

.client-info .time {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}

.problem {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  padding: 8px 12px;
  background: #f9f9fb;
  border-radius: 8px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.empty {
  padding: 80px 0;
}

@media (max-width: 820px) {
  .table-head {
    display: none;
  }

  .row {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 10px;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
