<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs, { Dayjs } from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCounselorStore, useAppointmentStore } from '@/stores'
import type { TimeSlot, ConsultationMethod } from '@/types'

const route = useRoute()
const router = useRouter()
const counselorStore = useCounselorStore()
const appointmentStore = useAppointmentStore()

const counselorId = route.params.counselorId as string
const counselor = computed(() => counselorStore.getCounselorById(counselorId))

const currentMonth = ref(dayjs())
const selectedDate = ref<Dayjs | null>(null)
const selectedSlot = ref<TimeSlot | null>(null)
const showForm = ref(false)

const formData = ref({
  clientName: '',
  clientPhone: '',
  consultationMethod: '视频咨询' as ConsultationMethod,
  problemDescription: ''
})

const consultationMethods: ConsultationMethod[] = ['线下面询', '视频咨询', '语音咨询']

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDays = computed(() => {
  const startOfMonth = currentMonth.value.startOf('month')
  const endOfMonth = currentMonth.value.endOf('month')
  const startOfWeek = startOfMonth.startOf('week')
  const days: { date: Dayjs; inMonth: boolean }[] = []
  let day = startOfWeek
  while (day.isBefore(endOfMonth.endOf('week')) || day.isSame(endOfMonth.endOf('week'))) {
    days.push({ date: day, inMonth: day.isSame(currentMonth.value, 'month') })
    day = day.add(1, 'day')
  }
  // Fix: using simpler loop
  days.length = 0
  let cursor = startOfWeek.clone()
  const finalEnd = endOfMonth.endOf('week')
  while (cursor.isBefore(finalEnd) || cursor.isSame(finalEnd, 'day')) {
    days.push({ date: cursor.clone(), inMonth: cursor.isSame(currentMonth.value, 'month') })
    cursor = cursor.add(1, 'day')
  }
  return days
})

const slots = computed(() => {
  if (!selectedDate.value) return []
  return appointmentStore.getTimeSlotsByCounselorAndDate(
    counselorId,
    selectedDate.value.format('YYYY-MM-DD')
  )
})

const availableCount = computed(() => slots.value.filter(s => s.status === 'available').length)

const isPast = (d: Dayjs) => d.isBefore(dayjs(), 'day')

const selectDate = (d: Dayjs) => {
  if (!d.isSame(currentMonth.value, 'month')) return
  if (isPast(d)) return
  selectedDate.value = d
  selectedSlot.value = null
  showForm.value = false
}

const selectSlot = (slot: TimeSlot) => {
  if (slot.status !== 'available') return
  selectedSlot.value = slot
  showForm.value = true
}

const prevMonth = () => { currentMonth.value = currentMonth.value.subtract(1, 'month') }
const nextMonth = () => { currentMonth.value = currentMonth.value.add(1, 'month') }

const backToList = () => { router.back() }

const descriptionMinLength = 100

const problemDescriptionLength = computed(() => formData.value.problemDescription.length)

const submitAppointment = () => {
  if (!formData.value.clientName.trim()) {
    ElMessage.warning('请输入您的姓名')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(formData.value.clientPhone)) {
    ElMessage.warning('请输入正确的手机号码')
    return
  }
  if (problemDescriptionLength.value < descriptionMinLength) {
    ElMessage.warning(`问题简述不少于${descriptionMinLength}字，当前${problemDescriptionLength.value}字`)
    return
  }
  if (!selectedSlot.value) return

  ElMessageBox.confirm(
    `确认预约 ${counselor.value?.name} 咨询师\n时间：${selectedDate.value?.format('YYYY年MM月DD日')} ${selectedSlot.value.startTime}-${selectedSlot.value.endTime}\n方式：${formData.value.consultationMethod}`,
    '确认预约信息',
    {
      confirmButtonText: '确认预约',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    appointmentStore.bookSlot(selectedSlot.value!.id, {
      counselorId,
      counselorName: counselor.value!.name,
      clientName: formData.value.clientName,
      clientPhone: formData.value.clientPhone,
      date: selectedDate.value!.format('YYYY-MM-DD'),
      startTime: selectedSlot.value!.startTime,
      endTime: selectedSlot.value!.endTime,
      consultationMethod: formData.value.consultationMethod,
      problemDescription: formData.value.problemDescription
    })
    ElMessage.success('预约成功！我们将尽快与您联系确认详情。')
    setTimeout(() => {
      router.push('/user')
    }, 1500)
  }).catch(() => {})
}

watch(currentMonth, () => {
  selectedDate.value = null
  selectedSlot.value = null
  showForm.value = false
})

// Initialize with today if possible
if (!counselor.value) {
  ElMessage.error('咨询师不存在')
  router.replace('/user')
}
</script>

<template>
  <div class="page-container appointment-page">
    <div class="breadcrumb">
      <el-button link @click="backToList">
        <el-icon><ArrowLeft /></el-icon>
        返回咨询师列表
      </el-button>
    </div>

    <div v-if="counselor" class="layout">
      <section class="counselor-info-panel card">
        <div class="counselor-banner">
          <el-avatar :size="96" :src="counselor.avatar" />
          <div class="counselor-text">
            <h2 class="name">{{ counselor.name }}</h2>
            <div class="experience"><el-icon color="#ff6b9d"><Trophy /></el-icon>{{ counselor.yearsOfExperience }}年经验</div>
            <el-rate :model-value="counselor.rating" disabled size="small" show-score score-template="{value}" text-color="#ff6b9d" :colors="['#ff6b9d']" />
          </div>
        </div>
        <div class="divider"></div>
        <div class="fields-block">
          <div class="block-label">擅长领域</div>
          <div class="tags">
            <span class="tag tag-pink" v-for="f in counselor.expertiseFields" :key="f">{{ f }}</span>
          </div>
        </div>
        <div class="fields-block">
          <div class="block-label">资质认证</div>
          <div class="tags">
            <span class="tag tag-blue" v-for="c in counselor.certifications" :key="c">{{ c }}</span>
          </div>
        </div>
        <p class="intro">{{ counselor.introduction }}</p>
      </section>

      <section class="calendar card">
        <div class="calendar-header">
          <div class="calendar-title">
            <h3>选择预约日期</h3>
            <div class="nav">
              <el-button circle size="small" @click="prevMonth"><el-icon><ArrowLeft /></el-icon></el-button>
              <span class="month-label">{{ currentMonth.format('YYYY年MM月') }}</span>
              <el-button circle size="small" @click="nextMonth"><el-icon><ArrowRight /></el-icon></el-button>
            </div>
          </div>
          <div class="legend">
            <div class="legend-item"><span class="dot dot-available"></span>可约</div>
            <div class="legend-item"><span class="dot dot-booked"></span>已约</div>
            <div class="legend-item"><span class="dot dot-rest"></span>休息</div>
          </div>
        </div>

        <div class="calendar-grid">
          <div class="weekday" v-for="w in weekDays" :key="w">{{ w }}</div>
          <div
            v-for="(item, idx) in calendarDays"
            :key="idx"
            class="cell"
            :class="{
              'not-in-month': !item.inMonth,
              'past': isPast(item.date),
              'selected': selectedDate?.isSame(item.date, 'day'),
              'today': dayjs().isSame(item.date, 'day')
            }"
            @click="selectDate(item.date)"
          >
            <div class="day-num">{{ item.date.date() }}</div>
            <div v-if="item.inMonth && !isPast(item.date)" class="day-status">
              <span class="status-dot" :class="'status-' + (appointmentStore.getTimeSlotsByCounselorAndDate(counselorId, item.date.format('YYYY-MM-DD')).some(s=>s.status==='available')?'available':'none')"></span>
            </div>
          </div>
        </div>

        <div v-if="selectedDate" class="slots-section">
          <div class="slots-header">
            <h4>{{ selectedDate.format('MM月DD日 dddd') }}</h4>
            <span class="available-count" :class="{ low: availableCount < 3 }">剩余可约时段：{{ availableCount }}个</span>
          </div>
          <div class="slots-grid">
            <div
              v-for="slot in slots"
              :key="slot.id"
              class="slot"
              :class="'slot-' + slot.status"
              @click="selectSlot(slot)"
            >
              <div class="slot-time">{{ slot.startTime }}-{{ slot.endTime }}</div>
              <div class="slot-label">
                {{ slot.status === 'available' ? '可预约' : slot.status === 'booked' ? '已被预约' : '休息'}}
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="请选择日期选择可预约日期" class="empty-slot" />
      </section>
    </div>

    <el-dialog
      v-model="showForm"
      title="填写预约信息"
      width="640px"
      :close-on-click-modal="false"
      destroy-on-close
      class="appointment-dialog"
    >
      <div class="summary">
        <div class="summary-row">
          <span class="label">咨询师：</span>
          <span class="value">{{ counselor?.name || '' }}</span>
        </div>
        <div class="summary-row">
          <span class="label">时间：</span>
          <span class="value" v-if="selectedDate && selectedSlot">{{ selectedDate.format('YYYY年MM月DD日') }} {{ selectedSlot.startTime }}-{{ selectedSlot.endTime }}</span>
        </div>
      </div>

      <el-form label-width="100px" class="form">
        <el-form-item label="您的姓名">
          <el-input v-model="formData.clientName" placeholder="请输入您的真实姓名" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="formData.clientPhone" placeholder="请输入11位手机号码" maxlength="11" />
        </el-form-item>
        <el-form-item label="咨询方式">
          <el-radio-group v-model="formData.consultationMethod">
            <el-radio v-for="m in consultationMethods" :key="m" :value="m">{{ m }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="问题简述">
          <div class="textarea-wrap">
            <el-input
              v-model="formData.problemDescription"
              type="textarea"
              :rows="6"
              :placeholder="'请详细描述您的问题和需求（不少于' + descriptionMinLength + '字）'"
              maxlength="1000"
              show-word-limit
            />
            <div class="tip">
              <el-tag
                :type="problemDescriptionLength >= descriptionMinLength ? 'success' : 'warning'"
                size="small"
                effect="light"
              >
                {{ problemDescriptionLength }}/{{ descriptionMinLength }} 字
              </el-tag>
              <span v-if="problemDescriptionLength < descriptionMinLength" class="tip-text">
                还需 {{ descriptionMinLength - problemDescriptionLength }} 字
              </span>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" class="submit-btn" @click="submitAppointment">
          <el-icon><Check /></el-icon>
          确认预约
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.appointment-page { padding-bottom: 48px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  margin-bottom: 24px;
  align-items: start;
}

.counselor-info-panel {
  padding: 24px;
  position: sticky;
  top: 88px;
}

.counselor-banner {
  display: flex;
  gap: 16px;
  align-items: center;
}

.counselor-text .name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.counselor-text .experience {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 16px 0;
}

.fields-block {
  margin-bottom: 14px;
}

.block-label {
  font-size: 13px;
  font-weight: 500;
  color: #444;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-pink { background: #fff0f5; color: #ff6b9d;
}

.tag-blue {
  background: #e8f4ff;
  color: #4096ff;
}

.intro {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.calendar {
  padding: 24px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: 20px;
}

.calendar-title h3 {
  font-size: 17px;
  font-weight: 600;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-label {
  font-size: 16px;
  font-weight: 600;
  min-width: 120px;
  text-align: center;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot-available { background: #52c41a;
}

.dot-booked {
  background: #bfbfbf;
}

.dot-rest {
  background: #ff4d4f;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 24px;
}

.weekday {
  text-align: center;
  font-weight: 500;
  font-size: 13px;
  color: #666;
  padding: 8px 0;
  color: #999;
}

.cell {
  aspect-ratio: 1;
  min-height: 60px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fafafa;
  transition: all 0.2s ease;
  position: relative;
  padding: 6px;
  border: 2px solid transparent;
}

.cell:hover:not(.past):not(.not-in-month) {
  background: #fff0f5;
  border-color: #ffd6e7;
}

.cell.not-in-month {
  background: transparent;
  cursor: default;
  opacity: 0.35;
}

.cell.past {
  cursor: not-allowed;
  opacity: 0.4;
  text-decoration: line-through;
}

.cell.selected {
  background: linear-gradient(135deg, #ff6b9d 0%, #c471f5 100%);
  color: #fff;
  font-weight: 600;
}

.cell.today:not(.selected) .day-num {
  color: #ff6b9d;
  font-weight: 700;
}

.day-num {
  font-size: 15px;
}

.day-status {
  margin-top: 2px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-available {
  background: #fff;
}

.cell.selected .status-dot.status-available {
  background: #fff;
}

.status-none {
  background: #ff4d4f;
}

.slots-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.slots-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.slots-header h4 {
  font-size: 15px;
  font-weight: 600;
}

.available-count {
  font-size: 12px;
  padding: 4px 12px;
  background: #e8f7ee;
  color: #52c41a;
  border-radius: 12px;
}

.available-count.low {
  background: #fff7e6;
  color: #fa8c16;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.slot {
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.slot-available {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #389e0d;
}

.slot-available:hover {
  background: #d9f7be;
  border-color: #52c41a;
  transform: translateY(-1px);
}

.slot-booked {
  background: #f5f5f5;
  color: #bfbfbf;
  cursor: not-allowed;
}

.slot-rest {
  background: #fff1f0;
  color: #ff7875;
  cursor: not-allowed;
}

.slot-time {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.slot-label {
  font-size: 11px;
}

.empty-slot {
  padding: 40px 0;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
}

.summary {
  background: #fafbff;
  border-radius: 10px;
  padding: 14px 20px;
  margin-bottom: 20px;
  border-left: 4px solid #ff6b9d;
}

.summary-row {
  font-size: 14px;
  padding: 4px 0;
}

.summary-row .label {
  color: #888;
  margin-right: 8px;
}

.summary-row .value {
  color: #333;
  font-weight: 500;
}

.textarea-wrap {
  width: 100%;
}

.tip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.tip-text {
  font-size: 12px;
  color: #999;
}

.submit-btn {
  background: linear-gradient(135deg, #ff6b9d 0%, #c471f5 100%);
  border: none;
  padding: 10px 32px;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .counselor-info-panel {
    position: static;
  }
}

@media (max-width: 600px) {
  .cell {
    min-height: 48px;
  }
}
</style>
