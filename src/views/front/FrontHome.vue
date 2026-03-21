<template>
  <div class="home-container">
    <!-- 公告栏 -->
    <div class="notice-section" v-if="latestNews.length">
      <div class="notice-marquee">
        <el-icon class="notice-icon"><BellFilled /></el-icon>
        <div class="marquee-content">
          <div class="marquee-text" :style="{ animationDuration: `${marqueeSpeed}s` }">
            <span v-for="(news, idx) in latestNews" :key="news.id" class="marquee-item" @click="goToNews(news.id)">
              {{ news.title }}
            </span>
          </div>
        </div>
        <el-button text type="primary" size="small" @click="$router.push('/front/news')">
          更多公告
        </el-button>
      </div>
    </div>

    <!-- 轮播图 -->
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-skeleton-item variant="image" style="width: 100%; height: 400px; border-radius: 12px" />
      </template>
      <template #default>
        <el-carousel height="400px" v-if="banners.length" :interval="5000" class="banner-carousel">
          <el-carousel-item v-for="item in banners" :key="item.id">
            <img
              :src="getImg(item.value)"
              style="width:100%;height:100%;object-fit:cover"
              loading="lazy"
            />
          </el-carousel-item>
        </el-carousel>
      </template>
    </el-skeleton>

    <!-- 热门书籍 -->
    <div class="section">
      <div class="section-title">
        <span>🔥 热门书籍</span>
        <el-button text type="primary" @click="$router.push('/front/books')">
          更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <el-skeleton :loading="loading" animated :count="4">
        <template #template>
          <el-row :gutter="16">
            <el-col :span="6" v-for="i in 4" :key="i">
              <el-card class="book-card-skeleton">
                <el-skeleton-item variant="image" style="width: 100%; height: 180px" />
                <div style="padding: 12px 0">
                  <el-skeleton-item variant="text" style="width: 80%" />
                  <el-skeleton-item variant="text" style="width: 40%; margin-top: 8px" />
                </div>
              </el-card>
            </el-col>
          </el-row>
        </template>

        <template #default>
          <el-empty v-if="!hotBooks.length" description="暂无书籍数据">
            <template #description>
              <p style="color: #909399; margin-bottom: 16px">还没有书籍上架</p>
              <el-button type="primary" @click="$router.push('/front/books')">去书籍市场看看</el-button>
            </template>
          </el-empty>
          <el-row :gutter="16" v-else>
            <el-col :xs="12" :sm="8" :md="6" v-for="book in hotBooks" :key="book.id">
              <el-card
                shadow="never"
                class="book-card"
                @click="$router.push(`/front/book/${book.id}`)"
              >
                <div class="book-img-wrapper">
                  <img
                    :src="getImg(book.shujifengmian)"
                    class="book-img"
                    loading="lazy"
                    @error="handleImgError"
                  />
                  <div class="book-overlay">
                    <div class="book-badges">
                      <span class="badge badge-sold-out" v-if="book.kucun <= 0">已售罄</span>
                      <span class="badge badge-hot" v-else-if="book.clicknum > 100">热销</span>
                    </div>
                    <!-- 快速加入购物车按钮 -->
                    <div class="quick-cart-btn" v-if="book.kucun > 0" @click.stop="addToCart(book)">
                      <el-icon><ShoppingCart /></el-icon>
                      <span>加入购物车</span>
                    </div>
                  </div>
                </div>
                <div class="book-info">
                  <div class="book-header">
                    <h3 class="book-name" :title="book.shujimingcheng">{{ book.shujimingcheng }}</h3>
                    <div class="book-price">¥{{ book.price }}</div>
                  </div>
                  <div class="book-footer">
                    <span class="book-tag">{{ book.shujifenlei }}</span>
                    <span class="book-divider">|</span>
                    <span class="book-condition">{{ book.xinjiuchengdu }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ArrowRight, BellFilled, ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import http from '@/utils/http'

const router = useRouter()
const loading = ref(true)
const banners = ref([])
const hotBooks = ref([])
const latestNews = ref([])
const baseUrl = import.meta.env.VITE_API_URL || ''
const getImg = (v) => v ? (v.startsWith('http') ? v : `${baseUrl}/api/file/download/${v}`) : ''

const marqueeSpeed = computed(() => {
  const textLength = latestNews.value.reduce((sum, news) => sum + news.title.length, 0)
  return Math.max(20, textLength / 5)
})

const goToNews = (id) => {
  router.push(`/front/news/${id}`)
}

const handleImgError = (e) => {
  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5Yqg6L295aSx6LSlPC90ZXh0Pjwvc3ZnPg=='
}

const addToCart = async (book) => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    await http.post('/cart/save', {
      tablename: 'ershoushuji',
      goodid: book.id,
      goodname: book.shujimingcheng,
      picture: book.shujifengmian,
      buynumber: 1,
      price: book.price,
      userid: Number(localStorage.getItem('userid'))
    })
    ElMessage.success('已加入购物车')
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '加入购物车失败')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const [configRes, bookRes, newsRes] = await Promise.all([
      http.get('/config/list', { params: { page: 1, limit: 10 } }),
      http.get('/ershoushuji/list', { params: { page: 1, limit: 8, sort: 'addtime', order: 'desc' } }),
      http.get('/news/list', { params: { page: 1, limit: 5, sort: 'addtime', order: 'desc' } })
    ])
    banners.value = configRes.data?.data?.list || []
    hotBooks.value = bookRes.data?.data?.list || []
    latestNews.value = newsRes.data?.data?.list || []
  } catch (e) {
    ElMessage.error('加载数据失败，请刷新重试')
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 统一间距：8px 倍数 */
.home-container {
  min-height: calc(100vh - 200px);
}

/* 轮播图样式优化 */
.banner-carousel {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  margin-bottom: 32px;
}

.banner-carousel :deep(.el-carousel__item) {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
}

/* 公告栏样式 */
.notice-section {
  margin-bottom: 24px;
  animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.notice-marquee {
  background: linear-gradient(135deg, #fff9e6 0%, #fff4d6 100%);
  border: 2px solid #ffe7ba;
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(255, 193, 7, 0.15);
}

.notice-icon {
  color: #faad14;
  font-size: 24px;
  animation: ring 2.5s ease-in-out infinite;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(250, 173, 20, 0.3));
}

@keyframes ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-12deg); }
  20%, 40% { transform: rotate(12deg); }
}

.marquee-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 28px;
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
}

.marquee-text {
  display: flex;
  white-space: nowrap;
  animation: marquee linear infinite;
  gap: 100px;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-item {
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
}

.marquee-item:hover {
  color: #fa8c16;
  transform: scale(1.08);
}

.section {
  margin-top: 48px;
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 3px solid #f0f0f0;
  color: #1a1a1a;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, #409eff 0%, #667eea 100%);
  border-radius: 2px;
}

.book-card-skeleton {
  margin-bottom: 20px;
  border-radius: 16px;
}

.book-card {
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #f0f0f0;
  background: #fff;
  position: relative;
}

.book-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, #409eff, #667eea);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s;
}

.book-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: transparent;
}

.book-card:hover::before {
  opacity: 1;
}

.book-card :deep(.el-card__body) {
  padding: 0;
}

.book-img-wrapper {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  aspect-ratio: 3/4;
}

.book-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-card:hover .book-img {
  transform: scale(1.15);
}

.book-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.book-badges {
  padding: 14px;
  display: flex;
  gap: 8px;
}

.badge {
  padding: 6px 14px;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 700;
  backdrop-filter: blur(12px);
  pointer-events: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.badge-sold-out {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
}

.badge-hot {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: #fff;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 快速加入购物车按钮 */
.quick-cart-btn {
  margin: 14px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(16px);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.book-card:hover .quick-cart-btn {
  opacity: 1;
  transform: translateY(0);
}

.quick-cart-btn:hover {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  transform: translateY(0) scale(1.05);
  box-shadow: 0 12px 32px rgba(64, 158, 255, 0.4);
}

.book-info {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.book-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.book-name {
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #1a1a1a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 48px;
  transition: color 0.3s;
}

.book-card:hover .book-name {
  color: #409eff;
}

.book-price {
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.book-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 2px solid #f5f5f5;
}

.book-tag {
  font-size: 13px;
  color: #595959;
  font-weight: 600;
  padding: 4px 10px;
  background: #f5f5f5;
  border-radius: 6px;
}

.book-divider {
  color: #d9d9d9;
  font-size: 12px;
}

.book-condition {
  color: #8c8c8c;
  font-size: 13px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-carousel {
    border-radius: 12px;
    margin-bottom: 24px;
  }

  .notice-marquee {
    padding: 10px 16px;
  }

  .notice-icon {
    font-size: 20px;
  }

  .marquee-item {
    font-size: 13px;
  }

  .section {
    margin-top: 32px;
  }

  .section-title {
    font-size: 22px;
    margin-bottom: 20px;
  }

  .book-img-wrapper {
    aspect-ratio: 3/4;
  }

  .quick-cart-btn {
    font-size: 13px;
    padding: 10px 16px;
  }

  .book-info {
    padding: 14px;
    gap: 10px;
  }

  .book-name {
    font-size: 15px;
    line-height: 22px;
    min-height: 44px;
  }

  .book-price {
    font-size: 22px;
  }

  .book-tag {
    font-size: 12px;
  }

  .book-condition {
    font-size: 12px;
  }
}
</style>
