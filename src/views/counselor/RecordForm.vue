<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ConsultationRecord } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const appointmentStore = useAppointmentStore()

const appointmentId = route.params.appointmentId as string
const appointment = computed(() => appointmentStore.getAppointmentById(appointmentId))
const existingRecord = computed(() => appointmentStore.getRecordByAppointmentId(appointmentId))

const formData = ref({
  clientStatus: '',
  coreIssue: '',
  interventionPlan: '',
  nextPlan: ''
})

const isEdit = computed(() => !!existingRecord.value)

const canSubmit = computed(() => {
  if (!appointment.value) return false
  if (isEdit.value) return true
  const aptTime = dayjs(`${appointment.value.date} ${appointment.value.startTime}`)
  return dayjs().isAfter(aptTime)
})

const timeUntilStart = computed(() => {
  if (!appointment.value || isEdit.value) return null
  const aptTime = dayjs(`${appointment.value.date} ${appointment.value.startTime}`)
  const diff = aptTime.diff(dayjs(), 'minute')
  if (diff <= 0) return null
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  if (hours > 0) return `${hours}小时${mins}分钟`
  return `${mins}分钟`
})

onMounted(() => {
  if (!appointment.value) {
    ElMessage.error('预约记录不存在')
    router.replace('/counselor/records')
    return
  }
  if (existingRecord.value) {
    formData.value = {
      clientStatus: existingRecord.value.clientStatus,
      coreIssue: existingRecord.value.coreIssue,
      interventionPlan: existingRecord.value.interventionPlan,
      nextPlan: existingRecord.value.nextPlan
    }
  }
})

const rules = {
  clientStatus: [{ required: true, message: '请填写访客状态', trigger: 'blur' }],
  coreIssue: [{ required: true, message: '请填写核心问题', trigger: 'blur' }],
  interventionPlan: [{ required: true, message: '请填写介入方案', trigger: 'blur' }],
  nextPlan: [{ required: true, message: '请填写下次计划', trigger: 'blur' }]
}

const formRef = ref()

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  if (!appointment.value) return

  if (!canSubmit.value) {
    ElMessage.warning('咨询尚未开始，请在咨询开始后再提交记录')
    return
  }

  await ElMessageBox.confirm(
    `确认${isEdit.value ? '更新' : '提交'}咨询记录？提交后可再次编辑。`,
    isEdit.value ? '更新记录' : '提交记录',
    {
      confirmButtonText: '确认提交',
      cancelButtonText: '再检查一下',
      type: 'info'
    }
  )

  const recordData: Omit<ConsultationRecord, 'id' | 'createdAt'> = {
    appointmentId,
    counselorId: appointmentStore.currentCounselorId,
    clientStatus: formData.value.clientStatus.trim(),
    coreIssue: formData.value.coreIssue.trim(),
    interventionPlan: formData.value.interventionPlan.trim(),
    nextPlan: formData.value.nextPlan.trim()
  }

  appointmentStore.createRecord(recordData)

  ElMessage.success(isEdit.value ? '咨询记录已更新' : '咨询记录提交成功')

  setTimeout(() => {
    router.push('/counselor/records')
  }, 1200)
}

const back = () => router.back()
</script>

<template>
  <div class="record-form-page">
    <div class="breadcrumb-bar card">
      <div class="nav">
        <el-button link @click="back">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <span class="sep">/</span>
        <span class="current">咨询记录 - {{ isEdit ? '编辑' : '新建' }}</span>
      </div>
      <el-tag :type="isEdit ? 'info' : 'warning'" effect="light">
        {{ isEdit ? '编辑模式' : '新建模式' }}
      </el-tag>
    </div>

    <div class="layout">
      <aside class="side-card card">
        <h3 class="side-title">
          <el-icon color="#6a11cb"><InfoFilled /></el-icon>
          本次咨询信息
        </h3>
        <div v-if="appointment" class="info-list">
          <div class="info-item">
            <div class="label">访客姓名</div>
            <div class="value">{{ appointment.clientName }}</div>
          </div>
          <div class="info-item">
            <div class="label">联系方式</div>
            <div class="value">{{ appointment.clientPhone }}</div>
          </div>
          <div class="info-item">
            <div class="label">咨询时间</div>
            <div class="value">
              {{ appointment.date }}
              <br />
              {{ appointment.startTime }} - {{ appointment.endTime }}
            </div>
          </div>
          <div class="info-item">
            <div class="label">咨询方式</div>
            <div class="value">
              <el-tag type="warning" effect="light">{{ appointment.consultationMethod }}</el-tag>
            </div>
          </div>
          <div class="info-item problem-item">
            <div class="label">问题简述</div>
            <div class="value">{{ appointment.problemDescription }}</div>
          </div>
        </div>
      </aside>

      <section class="form-card card">
        <h2 class="form-title">
          <el-icon color="#ff6b9d"><EditPen /></el-icon>
          填写咨询记录
        </h2>
        <p class="form-tip">请在咨询结束后及时填写以下内容，以便为访客提供持续、高质量的咨询服务</p>

        <el-alert
          v-if="!canSubmit && !isEdit"
          :title="'咨询尚未开始，距开始还有 ' + timeUntilStart"
          description="咨询记录只能在咨询开始后填写和提交，请耐心等待。"
          type="warning"
          show-icon
          :closable="false"
          class="time-alert"
        />

        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-position="top"
          class="form"
        >
          <el-form-item label="访客状态" prop="clientStatus">
            <template #label>
              <span class="field-label">
                <el-icon color="#4096ff"><User /></el-icon>
                访客状态 <span class="required">*</span>
              </span>
            </template>
            <el-input
              v-model="formData.clientStatus"
              type="textarea"
              :rows="3"
              placeholder="请描述本次咨询开始时访客的情绪状态、精神状态、身体反应等（例如：情绪较为低落，眼眶微红，语速较慢，初次咨询略显紧张...）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="核心问题" prop="coreIssue">
            <template #label>
              <span class="field-label">
                <el-icon color="#ff6b9d"><Warning /></el-icon>
                核心问题 <span class="required">*</span>
              </span>
            </template>
            <el-input
              v-model="formData.coreIssue"
              type="textarea"
              :rows="4"
              placeholder="请梳理、总结本次咨询的核心议题与深层诉求（例如：创伤后信任危机、反复出现的情绪闪回、对伴侣言行过度敏感、自我价值感受挫...）"
              maxlength="800"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="介入方案" prop="interventionPlan">
            <template #label>
              <span class="field-label">
                <el-icon color="#52c41a"><Tools /></el-icon>
                介入方案 <span class="required">*</span>
              </span>
            </template>
            <el-input
              v-model="formData.interventionPlan"
              type="textarea"
              :rows="5"
              placeholder="请详细记录本次咨询采用的具体咨询技术与干预过程：\n1. 情绪稳定化训练（正念呼吸调节）\n2. 创伤叙事处理，引导倾诉并重新赋予意义\n3. 认知重构，挑战核心不合理信念\n4. 夫妻沟通训练..."
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="下次计划" prop="nextPlan">
            <template #label>
              <span class="field-label">
                <el-icon color="#faad14"><Calendar /></el-icon>
                下次计划 <span class="required">*</span>
              </span>
            </template>
            <el-input
              v-model="formData.nextPlan"
              type="textarea"
              :rows="4"
              placeholder="请记录对访客的家庭作业建议及下次咨询安排：\n1. 每日正念练习10分钟，记录情绪日记\n2. 下周进行夫妻联合咨询，建立透明化互动规则\n3. 推荐阅读书目..."
              maxlength="800"
              show-word-limit
            />
          </el-form-item>

          <div class="form-actions">
            <el-button size="large" @click="back">取消</el-button>
            <el-button
              size="large"
              type="primary"
              class="submit-btn"
              :disabled="!canSubmit"
              @click="handleSubmit"
            >
              <el-icon><Check /></el-icon>
              {{ isEdit ? '更新记录' : '提交记录' }}
            </el-button>
          </div>
        </el-form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.record-form-page {
  max-width: 1200px;
}

.breadcrumb-bar {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.nav {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.nav .sep {
  margin: 0 6px;
  color: #ccc;
}

.nav .current {
  color: #6a11cb;
  font-weight: 500;
}

.layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  align-items: start;
}

.side-card {
  padding: 24px;
  position: sticky;
  top: 24px;
}

.side-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: #999;
}

.info-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  line-height: 1.6;
}

.problem-item .value {
  font-weight: 400;
  font-size: 13px;
  color: #555;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 8px;
  line-height: 1.7;
}

.form-card {
  padding: 28px 32px;
}

.form-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.form-tip {
  font-size: 13px;
  color: #888;
  margin-bottom: 28px;
  padding-left: 30px;
}

.time-alert {
  margin-bottom: 20px;
}

.form {
  max-width: 780px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.required {
  color: #f56c6c;
  margin-left: 2px;
}

:deep(.el-form-item__label) {
  padding-bottom: 8px !important;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  min-width: 160px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .side-card {
    position: static;
  }

  .form-card {
    padding: 20px;
  }
}
</style>
