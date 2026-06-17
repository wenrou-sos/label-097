<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores'
import type { Appointment } from '@/types'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const appointmentStore = useAppointmentStore()

const currentMonth = ref(dayjs())
const selectedDate = ref<Dayjs>(dayjs())

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const calendarDays = computed(() => {
  const startOfMonth = currentMonth.value.startOf('month')
  const endOfMonth = currentMonth.value.endOf('month')
  const startOfWeek = startOfMonth.startOf('week')
  const days: { date: Dayjs; inMonth: boolean; appointments: Appointment[] }[] = []
  let cursor = startOfWeek.clone()
  const finalEnd = endOfMonth.endOf('week')
  while (cursor.isBefore(finalEnd) || cursor.isSame(finalEnd, 'day')) {
    const dateStr = cursor.format('YYYY-MM-DD')
    const apts = appointmentStore.appointmentsForCounselor.filter(a => a.date === dateStr)
    days.push({
      date: cursor.clone(),
      inMonth: cursor.isSame(currentMonth.value, 'month'),
      appointments: apts
    })
    cursor = cursor.add(1, 'day')
  }
  return days
})

const selectedAppointments = computed(() => {
  const dateStr = selectedDate.value.format('YYYY-MM-DD')
  return appointmentStore.appointmentsForCounselor
    .filter(a => a.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const monthStats = computed(() => {
  const start = currentMonth.value.startOf('month')
  const end = currentMonth.value.endOf('month')
  const monthApts = appointmentStore.appointmentsForCounselor.filter(a => {
    const d = dayjs(a.date)
    return d.isAfter(start.subtract(1, 'day')) && d.isBefore(end.add(1, 'day'))
  })
  return {
    total: monthApts.length,
    completed: monthApts.filter(a => a.status === 'completed').length,
    confirmed: monthApts.filter(a => a.status === 'confirmed').length
  }
})

const todayAppointments = computed(() => {
  const todayStr = dayjs().format('YYYY-MM-DD')
  return appointmentStore.appointmentsForCounselor
    .filter(a => a.date === todayStr && a.status === 'confirmed')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const prevMonth = () => { currentMonth.value = currentMonth.value.subtract(1, 'month') }
const nextMonth = () => { currentMonth.value = currentMonth.value.add(1, 'month') }
const goToday = () => {
  currentMonth.value = dayjs()
  selectedDate.value = dayjs()
}

const selectDate = (item: { date: Dayjs; inMonth: boolean }) => {
  if (!item.inMonth) return
  selectedDate.value = item.date
}

const getStatusLabel = (status: string) => {
  const map: Record<string, { label: string; type: 'primary' | 'success' | 'warning' | 'info' }> = {
    pending: { label: '待确认', type: 'warning' },
    confirmed: { label: '已确认', type: 'primary' },
    completed: { label: '已完成', type: 'success' },
    cancelled: { label: '已取消', type: 'info' }
  }
  return map[status] || { label: status, type: 'info' }
}

const goRecordForm = (apt: Appointment) => {
  router.push(`/counselor/record/${apt.id}`)
}

const handleReminder = (apt: Appointment) => {
  ElMessageBox.alert(
    `访客：${apt.clientName}\n电话：${apt.clientPhone}\n方式：${apt.consultationMethod}\n问题：${apt.problemDescription.slice(0, 80)}...`,
    `${apt.startTime} - ${apt.endTime} 咨询详情`,
    { confirmButtonText: '知道了', type: 'info' }
  ).catch(() => {})
}
</script>

<template>
  <div class="counselor-calendar-page">
    <div class="stats-row">
      <div class="stat-card card">
        <div class="stat-icon blue"><el-icon :size="24"><Calendar /></el-icon></div>
        <div class="stat-text">
          <div class="stat-num">{{ monthStats.total }}</div>
          <div class="stat-label">本月预约</div>
        </div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon green"><el-icon :size="24"><CircleCheckFilled /></el-icon></div>
        <div class="stat-text">
          <div class="stat-num">{{ monthStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon pink"><el-icon :size="24"><Clock /></el-icon></div>
        <div class="stat-text">
          <div class="stat-num">{{ monthStats.confirmed }}</div>
          <div class="stat-label">待咨询</div>
        </div>
      </div>
    </div>

    <div class="today-card card" v-if="todayAppointments.length > 0">
      <div class="today-header">
        <h3 class="today-title">
          <el-icon color="#ff6b9d"><Bell /></el-icon>
          今日预约提醒
        </h3>
        <el-tag type="danger" effect="light" size="small">咨询前15分钟自动弹窗</el-tag>
      </div>
      <div class="today-list">
        <div
          v-for="apt in todayAppointments"
          :key="apt.id"
          class="today-item"
          @click="handleReminder(apt)"
        >
          <div class="time-block">
            <div class="time">{{ apt.startTime }}</div>
            <div class="end">{{ apt.endTime }}</div>
          </div>
          <div class="client-block">
            <div class="client-name">
              {{ apt.clientName }}
              <el-tag size="small" :type="getStatusLabel(apt.status).type" effect="light">
                {{ getStatusLabel(apt.status).label }}
              </el-tag>
            </div>
            <div class="client-meta">
              <el-icon><Phone /></el-icon>{{ apt.clientPhone }}
              <span class="divider"></span>
              <el-icon><ChatDotRound /></el-icon>{{ apt.consultationMethod }}
            </div>
          </div>
          <el-button
            v-if="apt.status === 'confirmed'"
            type="primary"
            size="small"
            @click.stop="goRecordForm(apt)"
          >
            填写记录
          </el-button>
        </div>
      </div>
    </div>

    <div class="content-row">
      <section class="calendar-section card">
        <div class="calendar-header">
          <div class="nav-row">
            <el-button size="small" plain @click="prevMonth">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <span class="month-label">{{ currentMonth.format('YYYY年MM月') }}</span>
            <el-button size="small" plain @click="nextMonth">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button size="small" type="primary" plain @click="goToday">今天</el-button>
          </div>
        </div>

        <div class="weekdays">
          <div class="weekday" v-for="w in weekDays" :key="w">{{ w }}</div>
        </div>

        <div class="calendar-grid">
          <div
            v-for="(item, idx) in calendarDays"
            :key="idx"
            class="cell"
            :class="{
              'not-in-month': !item.inMonth,
              'selected': selectedDate.isSame(item.date, 'day'),
              'today': dayjs().isSame(item.date, 'day'),
              'has-apt': item.appointments.length > 0
            }"
            @click="selectDate(item)"
          >
            <div class="day-num">{{ item.date.date() }}</div>
            <div v-if="item.inMonth && item.appointments.length > 0" class="apt-dots">
              <span
                v-for="(_, i) in Math.min(item.appointments.length, 3)"
                :key="i"
                class="apt-dot"
                :class="'status-' + item.appointments[i]?.status"
              ></span>
            </div>
            <div v-if="item.inMonth && item.appointments.length > 3" class="apt-count">
              +{{ item.appointments.length - 3 }}
            </div>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item"><span class="apt-dot status-confirmed"></span>已确认</div>
          <div class="legend-item"><span class="apt-dot status-completed"></span>已完成</div>
          <div class="legend-item"><span class="apt-dot status-pending"></span>待确认</div>
        </div>
      </section>

      <section class="detail-section card">
        <div class="detail-header">
          <h3>{{ selectedDate.format('YYYY年MM月DD日 dddd') }}</h3>
          <el-tag v-if="selectedDate.isSame(dayjs(), 'day')" type="danger" size="small">今天</el-tag>
        </div>

        <div v-if="selectedAppointments.length > 0" class="apt-list">
          <div
            v-for="apt in selectedAppointments"
            :key="apt.id"
            class="apt-card"
            :class="'apt-' + apt.status"
          >
            <div class="apt-time">
              <div class="start">{{ apt.startTime }}</div>
              <div class="dash">—</div>
              <div class="end">{{ apt.endTime }}</div>
            </div>
            <div class="apt-main">
              <div class="apt-top">
                <div class="client">
                  <el-avatar :size="36" style="background: linear-gradient(135deg, #ff6b9d, #c471f5)">
                    {{ apt.clientName.charAt(0) }}
                  </el-avatar>
                  <div>
                    <div class="client-name">{{ apt.clientName }}</div>
                    <div class="client-phone">
                      <el-icon :size="11"><Phone /></el-icon>
                      {{ apt.clientPhone }}
                    </div>
                  </div>
                </div>
                <el-tag :type="getStatusLabel(apt.status).type" effect="light">
                  {{ getStatusLabel(apt.status).label }}
                </el-tag>
              </div>
              <div class="apt-meta">
                <el-tag size="small" type="warning" effect="plain">
                  <el-icon :size="10"><ChatDotRound /></el-icon>
                  {{ apt.consultationMethod }}
                </el-tag>
                <span class="desc">{{ apt.problemDescription.slice(0, 40) }}...</span>
              </div>
              <div class="apt-actions">
                <el-button size="small" type="primary" plain @click="handleReminder(apt)">
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
                <el-button
                  v-if="apt.status === 'confirmed'"
                  size="small"
                  type="primary"
                  @click="goRecordForm(apt)"
                >
                  <el-icon><EditPen /></el-icon>
                  填写记录
                </el-button>
                <el-tag
                  v-if="apt.status === 'completed'"
                  type="success"
                  effect="light"
                  size="small"
                >
                  <el-icon :size="11"><Document /></el-icon>
                  已填写记录
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="当日暂无预约安排" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.counselor-calendar-page {
  max-width: 1200px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-icon.pink { background: linear-gradient(135deg, #ff6b9d 0%, #c471f5 100%); }

.stat-num {
  font-size: 26px;
  font-weight: 700;
  color: #1f1f1f;
}

.stat-label {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}

.today-card {
  padding: 20px 24px;
  margin-bottom: 20px;
  border: 2px solid #ffd6e7;
  background: linear-gradient(135deg, #fff5f8 0%, #fff 50%);
}

.today-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.today-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.today-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.today-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #ffe4ec;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.today-item:hover {
  background: #fff0f5;
  border-color: #ff6b9d;
}

.time-block {
  text-align: center;
  min-width: 80px;
  padding: 8px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c471f5 100%);
  border-radius: 10px;
  color: #fff;
}

.time-block .time { font-size: 16px; font-weight: 700; }
.time-block .end { font-size: 12px; opacity: 0.85; }

.client-block { flex: 1; }
.client-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.client-meta {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}
.client-meta .divider {
  width: 1px;
  height: 10px;
  background: #ddd;
  margin: 0 8px;
  display: inline-block;
}

.content-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.calendar-section {
  padding: 24px;
}

.calendar-header {
  margin-bottom: 20px;
}

.nav-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-label {
  font-size: 18px;
  font-weight: 700;
  min-width: 130px;
  text-align: center;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 6px;
}

.weekday {
  text-align: center;
  font-size: 13px;
  color: #999;
  padding: 8px 0;
  font-weight: 500;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.cell {
  aspect-ratio: 1;
  min-height: 72px;
  border-radius: 10px;
  background: #fafafa;
  padding: 8px;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.cell:hover:not(.not-in-month) {
  background: #f0f7ff;
  border-color: #bae0ff;
}

.cell.not-in-month { background: transparent; cursor: default; opacity: 0.3; }
.cell.today .day-num { color: #ff6b9d; font-weight: 700; }
.cell.selected {
  background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
  color: #fff;
}
.cell.selected .day-num { color: #fff; }

.day-num { font-size: 14px; }

.apt-dots {
  display: flex;
  gap: 4px;
  margin-top: auto;
  padding-top: 4px;
}

.cell.selected .apt-dot {
  background: rgba(255,255,255,0.8);
}

.apt-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.apt-dot.status-confirmed { background: #4096ff; }
.apt-dot.status-completed { background: #52c41a; }
.apt-dot.status-pending { background: #faad14; }

.apt-count {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  background: rgba(0,0,0,0.06);
  border-radius: 8px;
  padding: 1px 6px;
}

.legend {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.detail-section {
  padding: 24px;
  max-height: 720px;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.apt-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.apt-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: #fafbfc;
  border-left: 4px solid #4096ff;
}

.apt-card.apt-completed {
  border-left-color: #52c41a;
  background: #f6ffed;
}

.apt-time {
  min-width: 70px;
  text-align: center;
  padding-top: 4px;
}

.apt-time .start {
  font-size: 17px;
  font-weight: 700;
  color: #1f1f1f;
}
.apt-time .dash { color: #bbb; font-size: 12px; margin: 2px 0; }
.apt-time .end { font-size: 13px; color: #888; }

.apt-main { flex: 1; min-width: 0; }

.apt-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.client {
  display: flex;
  gap: 10px;
  align-items: center;
}

.client-name { font-size: 14px; font-weight: 600; }
.client-phone { font-size: 12px; color: #888; margin-top: 2px; display: flex; align-items: center; gap: 4px; }

.apt-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.desc { font-size: 12px; color: #999; overflow: hidden; }

.apt-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .content-row {
    grid-template-columns: 1fr;
  }
  .stats-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .today-item {
    flex-wrap: wrap;
  }
  .apt-card {
    flex-direction: column;
  }
  .apt-time {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .apt-time .dash { display: none; }
}
</style>
