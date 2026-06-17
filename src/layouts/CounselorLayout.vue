<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { computed, onMounted, onUnmounted } from 'vue'
import { useAppointmentStore } from '@/stores'
import { ElNotification, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const appointmentStore = useAppointmentStore()

const activeMenu = computed(() => {
  if (route.path.includes('records') || route.path.includes('record')) return 'records'
  return 'calendar'
})

const navigate = (path: string) => {
  router.push(path)
}

const goUser = () => {
  router.push('/user')
}

let checkTimer: ReturnType<typeof setInterval> | null = null

const checkReminders = () => {
  const upcoming = appointmentStore.getUpcomingAppointments()
  for (const apt of upcoming) {
    if (!appointmentStore.remindedIds.includes(apt.id)) {
      appointmentStore.addRemindedId(apt.id)
      ElNotification({
        title: '咨询提醒',
        message: `您将于 ${apt.startTime} 与访客进行咨询（${apt.consultationMethod}），请提前做好准备。`,
        type: 'warning',
        duration: 0,
        icon: 'Bell',
        customClass: 'reminder-notification'
      })
      ElMessageBox.alert(
        `咨询方式：${apt.consultationMethod}\n预约时间：${apt.date} ${apt.startTime}\n请提前做好准备！`,
        `即将开始：${apt.clientName} 的咨询`,
        {
          confirmButtonText: '我知道了',
          type: 'warning'
        }
      ).catch(() => {})
    }
  }
}

onMounted(() => {
  appointmentStore.initRemindedIds()
  checkReminders()
  checkTimer = setInterval(checkReminders, 60000)
})

onUnmounted(() => {
  if (checkTimer) {
    clearInterval(checkTimer)
    checkTimer = null
  }
})
</script>

<template>
  <div class="counselor-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <el-icon :size="26" color="#fff"><Management /></el-icon>
        <h2>咨询师工作台</h2>
      </div>
      <div class="counselor-info">
        <el-avatar :size="56" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20female%20counselor%20portrait%20warm%20smile%20headshot&image_size=square" />
        <div class="info">
          <div class="name">李心语</div>
          <div class="role">首席咨询师</div>
        </div>
      </div>
      <nav class="menu">
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'calendar' }"
          @click="navigate('/counselor')"
        >
          <el-icon><Calendar /></el-icon>
          <span>预约日历</span>
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'records' }"
          @click="navigate('/counselor/records')"
        >
          <el-icon><Document /></el-icon>
          <span>咨询记录</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <el-button type="info" plain @click="goUser">
          <el-icon><Back /></el-icon>
          返回前台
        </el-button>
      </div>
    </aside>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.counselor-layout {
  min-height: 100vh;
  display: flex;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #6a11cb 0%, #2575fc 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-logo {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.sidebar-logo h2 {
  font-size: 16px;
  font-weight: 600;
}

.counselor-info {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.counselor-info .name {
  font-size: 16px;
  font-weight: 600;
}

.counselor-info .role {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}

.menu {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.sidebar-footer .el-button {
  width: 100%;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 24px;
  min-height: 100vh;
}

:deep(.reminder-notification) {
  background: linear-gradient(135deg, #fff7e6 0%, #fff1f0 100%) !important;
  border: 1px solid #ffd591 !important;
}

@media (max-width: 768px) {
  .counselor-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: relative;
    height: auto;
  }

  .main-content {
    margin-left: 0;
    padding: 16px 12px;
  }

  .menu {
    flex-direction: row;
    padding: 12px;
  }

  .menu-item {
    flex: 1;
    justify-content: center;
  }
}
</style>
