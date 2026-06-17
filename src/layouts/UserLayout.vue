<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const activeTab = computed(() => {
  if (route.path.startsWith('/user/appointment')) return 'appointment'
  return 'home'
})

const switchTab = (tab: string) => {
  if (tab === 'home') router.push('/user')
}

const goCounselor = () => {
  router.push('/counselor')
}
</script>

<template>
  <div class="user-layout">
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <el-icon :size="28" color="#ff6b9d"><ChatDotRound /></el-icon>
          <h1>心灵港湾</h1>
        </div>
        <nav class="nav">
          <div
            class="nav-item"
            :class="{ active: activeTab === 'home' }"
            @click="switchTab('home')"
          >
            <el-icon><User /></el-icon>
            <span>咨询师列表</span>
          </div>
        </nav>
        <div class="header-right">
          <el-button type="primary" plain @click="goCounselor">
            <el-icon><Avatar /></el-icon>
            咨询师入口
          </el-button>
        </div>
      </div>
    </header>
    <main class="main">
      <RouterView />
    </main>
    <footer class="footer">
      <p>© 2026 心灵港湾情感咨询中心 · 专业 · 私密 · 贴心</p>
    </footer>
  </div>
</template>

<style scoped>
.user-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo h1 {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b9d 0%, #c471f5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: #fff0f5;
  color: #ff6b9d;
}

.nav-item.active {
  background: linear-gradient(135deg, #ff6b9d20 0%, #c471f520 100%);
  color: #ff6b9d;
  font-weight: 500;
}

.main {
  flex: 1;
}

.footer {
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 13px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .header-inner {
    padding: 0 16px;
  }

  .nav {
    display: none;
  }

  .logo h1 {
    font-size: 16px;
  }
}
</style>
