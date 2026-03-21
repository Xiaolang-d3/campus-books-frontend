<template>
  <section class="recommend-banner" v-if="recommendations.length">
    <div class="banner-header">
      <div class="banner-title-wrap">
        <span class="ai-badge">
          <el-icon :size="14"><MagicStick /></el-icon>
          AI 推荐
        </span>
        <h2 class="banner-title">为你精选好书</h2>
      </div>
    </div>

    <el-carousel
      :interval="5000"
      type="card"
      height="340px"
      indicator-position="outside"
      arrow="hover"
      class="recommend-carousel"
      @change="handleChange"
    >
      <el-carousel-item
        v-for="(book, index) in recommendations"
        :key="book.id"
        :class="['recommend-card', { 'is-active': index === activeIndex }]"
      >
        <div class="card-inner" @click="goBookDetail(book.id)">
          <!-- 左侧：书籍封面 -->
          <div class="card-cover">
            <img
              :src="getImg(book.cover)"
              :alt="book.title"
              class="cover-img"
              loading="lazy"
            />
            <div class="cover-overlay">
              <span class="view-detail">查看详情</span>
            </div>
          </div>

          <!-- 右侧：书籍信息 + 推荐理由 -->
          <div class="card-content">
            <div class="card-meta">
              <span class="card-category" v-if="book.category_name">
                {{ book.category_name }}
              </span>
              <span class="card-condition" v-if="book.condition_name">
                {{ book.condition_name }}
              </span>
            </div>

            <h3 class="card-title">{{ book.title }}</h3>

            <p class="card-author">
              <span class="meta-label">作者</span>
              <span class="meta-value">{{ book.author || '未知' }}</span>
            </p>

            <p class="card-publisher" v-if="book.publisher">
              <span class="meta-label">出版社</span>
              <span class="meta-value">{{ book.publisher }}</span>
            </p>

            <div class="card-reason">
              <div class="reason-label">
                <el-icon :size="12"><ChatDotRound /></el-icon>
                <span>推荐理由</span>
              </div>
              <p class="reason-text">{{ book.reason }}</p>
            </div>

            <div class="card-footer">
              <div class="card-price">
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ book.price }}</span>
              </div>
              <span class="card-action">
                去看看
                <el-icon :size="14"><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MagicStick, ChatDotRound, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  recommendations: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const activeIndex = ref(0)

const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/upload/${v.replace(/^upload\//, '')}`) : ''

const goBookDetail = (id) => {
  router.push(`/front/book/${id}`)
}

const handleChange = (index) => {
  activeIndex.value = index
}
</script>

<style scoped>
.recommend-banner {
  padding: 48px 0 24px;
  overflow: hidden;
}

.banner-header {
  margin-bottom: 28px;
  text-align: center;
}

.banner-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
  letter-spacing: 0.05em;
}

.banner-title {
  font-size: 28px;
  font-weight: 600;
  color: #0a0a0a;
  letter-spacing: -0.02em;
  margin: 0;
}

/* 轮播卡片 */
.recommend-card {
  border-radius: 12px;
  transition: transform 0.3s ease;
  overflow: hidden;
}

.recommend-card :deep(.el-carousel__item) {
  border-radius: 12px;
}

.card-inner {
  display: flex;
  gap: 16px;
  padding: 20px;
  height: 100%;
  min-height: 300px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.card-inner:hover {
  border-color: #d0d0d0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-inner:hover .cover-overlay {
  opacity: 1;
}

.card-inner:hover .cover-img {
  transform: scale(1.05);
}

/* 封面 */
.card-cover {
  position: relative;
  width: 148px;
  min-width: 148px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.view-detail {
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* 内容 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 8px;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.card-category,
.card-condition {
  padding: 2px 10px;
  background: #f0f0f0;
  color: #666;
  font-size: 11px;
  border-radius: 4px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0a0a0a;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-author,
.card-publisher {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;
  font-size: 13px;
}

.meta-label {
  color: #a0a0a0;
  flex-shrink: 0;
}

.meta-value {
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 推荐理由 */
.card-reason {
  flex: 1;
  margin-top: 4px;
  padding: 12px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.reason-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #667eea;
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 6px;
}

.reason-text {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 底部价格 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.card-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
  color: #e63a3a;
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #e63a3a;
  letter-spacing: -0.02em;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
  transition: gap 0.2s;
}

.card-inner:hover .card-action {
  gap: 6px;
}

/* 轮播样式 */
.recommend-carousel {
  padding: 6px 0 18px;
}

:deep(.el-carousel__container) {
  height: 340px;
}

:deep(.el-carousel__item--card) {
  width: 56%;
  border-radius: 12px;
  overflow: visible;
}

:deep(.el-carousel__item--card.is-active) {
  z-index: 3;
}

:deep(.el-carousel__item) {
  border-radius: 12px;
}

:deep(.el-carousel__mask) {
  background-color: transparent;
}

:deep(.el-carousel__button) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d0d0d0;
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background: #667eea;
  width: 24px;
  border-radius: 4px;
}

/* 响应式 */
@media (max-width: 992px) {
  :deep(.el-carousel__item--card) {
    width: 64%;
  }

  .card-cover {
    width: 132px;
    min-width: 132px;
  }

  .card-inner {
    gap: 12px;
    padding: 18px;
  }

  .card-title {
    font-size: 16px;
  }

  .reason-text {
    -webkit-line-clamp: 2;
  }
}

@media (max-width: 768px) {
  .recommend-banner {
    padding: 32px 0 16px;
  }

  .banner-title-wrap {
    flex-direction: column;
    gap: 10px;
  }

  .banner-title {
    font-size: 22px;
  }

  .recommend-carousel {
    padding-bottom: 12px;
  }

  .el-carousel {
    height: auto !important;
  }

  :deep(.el-carousel__container) {
    height: 360px !important;
  }

  :deep(.el-carousel__item--card) {
    width: 72%;
  }

  :deep(.el-carousel__item) {
    height: 100% !important;
  }

  .card-inner {
    flex-direction: column;
    padding: 16px;
    min-height: 320px;
  }

  .card-cover {
    width: 100%;
    min-width: 100%;
    height: 156px;
  }

  .card-title {
    font-size: 16px;
    -webkit-line-clamp: 1;
  }

  .card-author,
  .card-publisher {
    font-size: 12px;
  }

  .reason-text {
    -webkit-line-clamp: 2;
  }

  .price-value {
    font-size: 20px;
  }
}
</style>
