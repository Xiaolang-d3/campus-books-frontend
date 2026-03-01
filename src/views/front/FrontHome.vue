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
      userid: JSON.parse(localStorage.getItem('userInfo') || '{}').id
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 公告栏样式 */
.notice-section {
  margin-bottom: 16px;
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.notice-marquee {
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-icon {
  color: #faad14;
  font-size: 20px;
  animation: ring 2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-10deg); }
  20%, 40% { transform: rotate(10deg); }
}

.marquee-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 24px;
  mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
}

.marquee-text {
  display: flex;
  white-space: nowrap;
  animation: marquee linear infinite;
  gap: 80px;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-item {
  color: #000;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.marquee-item:hover {
  color: #409eff;
  transform: scale(1.05);
}

.section {
  margin-top: 32px;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
  color: #1a1a1a;
}

.book-card-skeleton {
  margin-bottom: 16px;
}

.book-card {
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  background: #fff;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: #e0e0e0;
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
  transition: transform 0.4s ease;
}

.book-card:hover .book-img {
  transform: scale(1.08);
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
  padding: 12px;
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  pointer-events: auto;
}

.badge-sold-out {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
}

.badge-hot {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

/* 快速加入购物车按钮 */
.quick-cart-btn {
  margin: 12px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  pointer-events: auto;
}

.book-card:hover .quick-cart-btn {
  opacity: 1;
  transform: translateY(0);
}

.quick-cart-btn:hover {
  background: #409eff;
  transform: translateY(0) scale(1.02);
}

.book-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.book-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-name {
  font-weight: 600;
  font-size: 15px;
  line-height: 22px;
  color: #1a1a1a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 44px;
}

.book-price {
  font-size: 22px;
  font-weight: 700;
  color: #ff4d4f;
  line-height: 1;
}

.book-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}

.book-tag {
  font-size: 12px;
  color: #595959;
  font-weight: 500;
}

.book-divider {
  color: #d9d9d9;
  font-size: 12px;
}

.book-condition {
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 400;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-carousel {
    border-radius: 8px;
  }

  .notice-marquee {
    padding: 8px;
  }

  .notice-icon {
    font-size: 18px;
  }

  .marquee-item {
    font-size: 12px;
  }

  .section {
    margin-top: 24px;
  }

  .section-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .book-img-wrapper {
    aspect-ratio: 3/4;
  }

  .quick-cart-btn {
    font-size: 12px;
    padding: 8px 12px;
  }

  .book-info {
    padding: 12px;
    gap: 8px;
  }

  .book-name {
    font-size: 14px;
    line-height: 20px;
    min-height: 40px;
  }

  .book-price {
    font-size: 20px;
  }

  .book-tag {
    font-size: 11px;
  }

  .book-condition {
    font-size: 11px;
  }
}
</style>
