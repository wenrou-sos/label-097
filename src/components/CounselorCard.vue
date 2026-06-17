<script setup lang="ts">
import type { Counselor } from '@/types'

defineProps<{
  counselor: Counselor
}>()

const emit = defineEmits<{
  (e: 'book', counselorId: string): void
}>()
</script>

<template>
  <div class="counselor-card card">
    <div class="card-header">
      <el-avatar :size="80" :src="counselor.avatar" class="avatar" />
      <div class="basic-info">
        <h3 class="name">{{ counselor.name }}</h3>
        <div class="experience">
          <el-icon color="#ff6b9d"><Trophy /></el-icon>
          <span>{{ counselor.yearsOfExperience }}年经验</span>
        </div>
        <div class="rating">
          <el-rate
            :model-value="counselor.rating"
            disabled
            show-score
            text-color="#ff6b9d"
            score-template="{value}"
            :colors="['#ff6b9d', '#ff6b9d', '#ff6b9d']"
            size="small"
          />
          <span class="review-count">{{ counselor.reviewCount }}条评价</span>
        </div>
      </div>
    </div>

    <div class="card-section">
      <div class="section-label">
        <el-icon color="#ff6b9d"><Collection /></el-icon>
        <span>擅长领域</span>
      </div>
      <div class="tags">
        <span class="tag tag-pink" v-for="field in counselor.expertiseFields" :key="field">
          {{ field }}
        </span>
      </div>
    </div>

    <div class="card-section">
      <div class="section-label">
        <el-icon color="#4096ff"><Medal /></el-icon>
        <span>资质认证</span>
      </div>
      <div class="tags">
        <span class="tag tag-blue" v-for="cert in counselor.certifications" :key="cert">
          {{ cert }}
        </span>
      </div>
    </div>

    <p class="intro">{{ counselor.introduction }}</p>

    <div class="card-footer">
      <el-button
        type="primary"
        class="book-btn"
        @click="emit('book', counselor.id)"
      >
        <el-icon><Calendar /></el-icon>
        立即预约
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.counselor-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar {
  border: 3px solid #fff0f5;
  flex-shrink: 0;
}

.basic-info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 18px;
  font-weight: 700;
  color: #1f1f1f;
  margin-bottom: 6px;
}

.experience {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-count {
  font-size: 12px;
  color: #999;
}

.card-section {
  margin-bottom: 14px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #444;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

.tag-pink {
  background: #fff0f5;
  color: #ff6b9d;
}

.tag-blue {
  background: #e8f4ff;
  color: #4096ff;
}

.intro {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  flex: 1;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.card-footer {
  margin-top: auto;
}

.book-btn {
  width: 100%;
  background: linear-gradient(135deg, #ff6b9d 0%, #c471f5 100%);
  border: none;
}
</style>
