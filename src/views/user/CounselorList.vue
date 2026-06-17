<script setup lang="ts">
import { useCounselorStore } from '@/stores'
import CounselorCard from '@/components/CounselorCard.vue'
import { useRouter } from 'vue-router'
import type { ExpertiseField } from '@/types'

const counselorStore = useCounselorStore()
const router = useRouter()

const fieldIcons: Record<ExpertiseField, string> = {
  '分手复合': 'Heart',
  '婚姻修复': 'House',
  '出轨创伤': 'FirstAidKit',
  '沟通改善': 'ChatLineSquare',
  '婚前辅导': 'Present'
}

const goAppointment = (counselorId: string) => {
  router.push(`/user/appointment/${counselorId}`)
}
</script>

<template>
  <div class="page-container counselor-list-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">遇见专业咨询师，开启心灵疗愈之旅</h1>
        <p class="hero-subtitle">我们拥有经验丰富的情感咨询师团队，助您走出情感困境，重建幸福人生</p>
      </div>
    </section>

    <section class="filter-section card">
      <div class="filter-header">
        <h2 class="section-title">
          <el-icon color="#ff6b9d" :size="22"><Filter /></el-icon>
          筛选咨询师
        </h2>
        <el-button
          v-if="counselorStore.selectedFields.length > 0 || counselorStore.keyword"
          link
          type="primary"
          @click="counselorStore.clearFilters()"
        >
          <el-icon><RefreshLeft /></el-icon>
          清空筛选
        </el-button>
      </div>

      <div class="filter-row">
        <label class="filter-label">擅长领域：</label>
        <div class="field-options">
          <div
            v-for="field in counselorStore.allFields"
            :key="field"
            class="field-chip"
            :class="{ active: counselorStore.selectedFields.includes(field) }"
            @click="counselorStore.toggleField(field)"
          >
            <el-icon>
              <component :is="fieldIcons[field]" />
            </el-icon>
            <span>{{ field }}</span>
            <el-icon v-if="counselorStore.selectedFields.includes(field)" class="check"><CircleCheckFilled /></el-icon>
          </div>
        </div>
      </div>

      <div class="filter-row">
        <label class="filter-label">搜索：</label>
        <el-input
          v-model="counselorStore.keyword"
          placeholder="输入咨询师姓名或领域关键词..."
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="result-tip">
        <el-icon color="#ff6b9d"><UserFilled /></el-icon>
        共找到 <strong>{{ counselorStore.filteredCounselors.length }}</strong> 位咨询师
      </div>
    </section>

    <section class="list-section">
      <div class="counselor-grid" v-if="counselorStore.filteredCounselors.length > 0">
        <CounselorCard
          v-for="counselor in counselorStore.filteredCounselors"
          :key="counselor.id"
          :counselor="counselor"
          @book="goAppointment"
        />
      </div>
      <el-empty
        v-else
        description="没有找到匹配的咨询师，请调整筛选条件"
        class="empty-state"
      />
    </section>
  </div>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #ff6b9d 0%, #c471f5 50%, #7873f5 100%);
  border-radius: 16px;
  padding: 48px 32px;
  margin-bottom: 24px;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.3;
}

.hero-subtitle {
  font-size: 16px;
  opacity: 0.92;
  line-height: 1.6;
}

.filter-section {
  padding: 24px;
  margin-bottom: 24px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 14px;
  color: #555;
  font-weight: 500;
  padding-top: 8px;
}

.field-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.field-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 24px;
  background: #f5f7fa;
  color: #555;
  font-size: 13px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.25s ease;
}

.field-chip:hover {
  background: #fff0f5;
  color: #ff6b9d;
}

.field-chip.active {
  background: linear-gradient(135deg, #ff6b9d20 0%, #c471f520 100%);
  color: #ff6b9d;
  border-color: #ff6b9d;
  font-weight: 500;
}

.field-chip.active .check {
  color: #ff6b9d;
}

.search-input {
  max-width: 420px;
  flex: 1;
}

.result-tip {
  padding: 12px 16px;
  background: #fff7fa;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.result-tip strong {
  color: #ff6b9d;
  font-size: 15px;
  margin: 0 4px;
}

.counselor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.empty-state {
  padding: 80px 0;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 32px 20px;
    margin-bottom: 16px;
  }

  .hero-title {
    font-size: 22px;
  }

  .hero-subtitle {
    font-size: 14px;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-label {
    width: auto;
    padding-top: 0;
  }

  .counselor-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
