<template>
  <div class="home-container">
    <!-- 搜索区域 -->
    <div class="search-hero">
      <div class="hero-content">
        <h1 class="hero-title">校园二手专业书籍在线交易平台</h1>
        <p class="hero-subtitle">专注校内教材流转，让闲置书籍重新发光</p>
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索书名、作者、ISBN..."
            size="large"
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="large" @click="handleSearch">搜索</el-button>
        </div>
        <div class="hot-tags">
          <span class="hot-label">热门搜索：</span>
          <el-tag
            v-for="tag in hotTags"
            :key="tag"
            class="hot-tag"
            @click="searchKeyword = tag; handleSearch()"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 数据统计 -->
    <div class="stats-bar">
      <div class="stat-item">
        <el-icon class="stat-icon"><Reading /></el-icon>
        <div class="stat-info">
          <span class="stat-number">1000+</span>
          <span class="stat-label">在架书籍</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon"><User /></el-icon>
        <div class="stat-info">
          <span class="stat-number">500+</span>
          <span class="stat-label">校园用户</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon"><Goods /></el-icon>
        <div class="stat-info">
          <span class="stat-number">800+</span>
          <span class="stat-label">成功交易</span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <el-icon class="stat-icon"><School /></el-icon>
        <div class="stat-info">
          <span class="stat-number">4</span>
          <span class="stat-label">合作学院</span>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="categories-section">
      <div class="section-header">
        <h2 class="section-title">书籍分类</h2>
        <el-button text type="primary" @click="$router.push('/front/books')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="category-grid">
        <div
          v-for="(cat, index) in categories"
          :key="cat.id"
          class="category-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="goToCategory(cat.id)"
        >
          <div class="category-icon-wrapper" :style="{ background: cat.bgColor }">
            <el-icon class="category-icon" :style="{ color: cat.color }">{{ cat.icon }}</el-icon>
          </div>
          <span class="category-name">{{ cat.name }}</span>
        </div>
      </div>
    </div>

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
        <el-skeleton-item variant="image" style="width: 100%; height: 360px; border-radius: 16px" />
      </template>
      <template #default>
        <el-carousel height="360px" v-if="banners.length" :interval="5000" class="banner-carousel" trigger="click">
          <el-carousel-item v-for="item in banners" :key="item.id">
            <img
              :src="getImg(item.value)"
              style="width:100%;height:100%;object-fit:cover;border-radius:16px"
              loading="lazy"
            />
          </el-carousel-item>
        </el-carousel>
        <div v-else class="banner-placeholder">
          <div class="placeholder-content">
            <el-icon class="placeholder-icon"><Picture /></el-icon>
            <span>平台轮播图</span>
          </div>
        </div>
      </template>
    </el-skeleton>

    <!-- 热门书籍 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <span class="section-emoji">🔥</span>
          <h2 class="section-title">热门推荐</h2>
        </div>
        <el-button text type="primary" @click="$router.push('/front/books')">
          更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <el-skeleton :loading="loading" animated :count="4">
        <template #template>
          <el-row :gutter="16">
            <el-col :span="6" v-for="i in 4" :key="i">
              <el-card class="book-card-skeleton">
                <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
                <div style="padding: 14px 0">
                  <el-skeleton-item variant="text" style="width: 85%" />
                  <el-skeleton-item variant="text" style="width: 50%; margin-top: 10px" />
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
          <el-row :gutter="20" v-else>
            <el-col
              :xs="12" :sm="8" :md="6" :lg="6"
              v-for="(book, index) in hotBooks"
              :key="book.id"
              class="book-col"
              :style="{ animationDelay: `${index * 0.08}s` }"
            >
              <el-card
                shadow="never"
                class="book-card"
                @click="$router.push(`/front/book/${book.id}`)"
              >
                <div class="book-img-wrapper">
                  <img
                    :src="getImg(book.cover)"
                    class="book-img"
                    loading="lazy"
                    @error="handleImgError"
                  />
                  <div class="book-overlay">
                    <div class="book-badges">
                      <span class="badge badge-new" v-if="isNewBook(book.addtime)">新上架</span>
                      <span class="badge badge-sold-out" v-if="book.stock <= 0">已售罄</span>
                    </div>
                    <div class="quick-actions" v-if="book.stock > 0">
                      <div class="quick-cart-btn" @click.stop="addToCart(book)">
                        <el-icon><ShoppingCart /></el-icon>
                        <span>加入购物车</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="book-info">
                  <h3 class="book-name" :title="book.title">{{ book.title }}</h3>
                  <div class="book-meta">
                    <span class="book-author">{{ book.author || '未知作者' }}</span>
                  </div>
                  <div class="book-footer">
                    <div class="book-price-wrapper">
                      <span class="book-price">¥{{ book.price }}</span>
                      <span class="book-original" v-if="book.original_price">¥{{ book.original_price }}</span>
                    </div>
                    <div class="book-tags">
                      <span class="book-tag">{{ book.category_name || '-' }}</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </template>
      </el-skeleton>
    </div>

    <!-- 平台特色 -->
    <div class="features-section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <span class="section-emoji">✨</span>
          <h2 class="section-title">平台特色</h2>
        </div>
      </div>
      <div class="features-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index" :style="{ animationDelay: `${index * 0.15}s` }">
          <div class="feature-icon-wrapper" :style="{ background: feature.bgColor }">
            <el-icon class="feature-icon" :style="{ color: feature.color }">{{ feature.icon }}</el-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="tips-section">
      <div class="tip-item">
        <el-icon class="tip-icon"><Stamp /></el-icon>
        <span>正版保证</span>
      </div>
      <div class="tip-item">
        <el-icon class="tip-icon"><Van /></el-icon>
        <span>校内交易</span>
      </div>
      <div class="tip-item">
        <el-icon class="tip-icon"><CircleCheck /></el-icon>
        <span>价格透明</span>
      </div>
      <div class="tip-item">
        <el-icon class="tip-icon"><Headset /></el-icon>
        <span>售后无忧</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  ArrowRight, BellFilled, ShoppingCart, Search, Reading, User,
  Goods, School, Picture, Stamp, Van, CircleCheck, Headset,
  Laptop, Document, SellTicket, LocationFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import http from '@/utils/http'

const router = useRouter()
const loading = ref(true)
const banners = ref([])
const hotBooks = ref([])
const latestNews = ref([])
const searchKeyword = ref('')
const baseUrl = import.meta.env.VITE_API_URL || ''

const hotTags = ['数据结构', 'Python', '经济学', '数据库', '操作系统']

const categories = ref([
  { id: 1, name: '计算机', icon: Laptop, color: '#409eff', bgColor: 'linear-gradient(135deg, #e6f2ff 0%, #b3d9ff 100%)' },
  { id: 2, name: '文学', icon: Document, color: '#67c23a', bgColor: 'linear-gradient(135deg, #e6f7e6 0%, #b3e6b3 100%)' },
  { id: 5, name: '经济', icon: SellTicket, color: '#e6a23c', bgColor: 'linear-gradient(135deg, #fff7e6 0%, #ffe6b3 100%)' },
  { id: 3, name: '历史', icon: Document, color: '#909399', bgColor: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' },
  { id: 4, name: '哲学', icon: Document, color: '#f56c6c', bgColor: 'linear-gradient(135deg, #ffe6e6 0%, #ffb3b3 100%)' },
  { id: 6, name: '教育', icon: Document, color: '#9c27b0', bgColor: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' },
  { id: 7, name: '艺术', icon: Document, color: '#ff5722', bgColor: 'linear-gradient(135deg, #fff3e0 0%, #ffccbc 100%)' },
  { id: 8, name: '科学', icon: Document, color: '#00bcd4', bgColor: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)' },
])

const features = [
  { title: '校内直连', desc: '卖家买家同校，交易更便捷', icon: LocationFilled, color: '#409eff', bgColor: 'linear-gradient(135deg, #e6f2ff 0%, #b3d9ff 100%)' },
  { title: '专业书籍', desc: '覆盖各专业教材与参考书', icon: Document, color: '#67c23a', bgColor: 'linear-gradient(135deg, #e6f7e6 0%, #b3e6b3 100%)' },
  { title: '实惠价格', desc: '二手书籍，价格更优惠', icon: SellTicket, color: '#e6a23c', bgColor: 'linear-gradient(135deg, #fff7e6 0%, #ffe6b3 100%)' },
  { title: '安全交易', desc: '平台保障，交易更放心', icon: CircleCheck, color: '#f56c6c', bgColor: 'linear-gradient(135deg, #ffe6e6 0%, #ffb3b3 100%)' },
]

const normalizeImagePath = (value) => {
  if (!value) return ''
  const firstValue = String(value).split(',').map(item => item.trim()).find(Boolean)
  if (!firstValue) return ''
  if (/^https?:\/\//i.test(firstValue) || firstValue.startsWith('data:image')) {
    return firstValue
  }
  const normalized = firstValue.replace(/\\/g, '/').replace(/^\/+/, '').replace(/^static\//, '').replace(/^api\/file\/download\//, '')
  if (normalized.startsWith('upload/')) {
    return `${baseUrl}/api/file/download/${normalized}`
  }
  return `${baseUrl}/api/file/download/upload/${normalized}`
}

const getImg = (value) => normalizeImagePath(value)

const marqueeSpeed = computed(() => {
  const textLength = latestNews.value.reduce((sum, news) => sum + news.title.length, 0)
  return Math.max(20, textLength / 5)
})

const isNewBook = (addtime) => {
  if (!addtime) return false
  const addDate = new Date(addtime)
  const now = new Date()
  const diffDays = (now - addDate) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

const goToNews = (id) => router.push(`/front/news/${id}`)

const goToCategory = (id) => {
  router.push({ path: '/front/books', query: { category: id } })
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    router.push('/front/books')
  } else {
    router.push({ path: '/front/books', query: { keyword: searchKeyword.value.trim() } })
  }
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
    await http.post('/cart/add', {
      book_id: book.id,
      book_title: book.title,
      book_cover: book.cover,
      quantity: 1,
      price: book.price,
      userid: Number(localStorage.getItem('userid'))
    })
    ElMessage.success('已加入购物车')
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '加入购物车失败')
  }
}

const loadCategories = async () => {
  try {
    const res = await http.get('/bookCategory/list')
    if (res.data?.code === 0) {
      const catMap = {
        '计算机': { color: '#409eff', bgColor: 'linear-gradient(135deg, #e6f2ff 0%, #b3d9ff 100%)' },
        '文学': { color: '#67c23a', bgColor: 'linear-gradient(135deg, #e6f7e6 0%, #b3e6b3 100%)' },
        '历史': { color: '#909399', bgColor: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' },
        '哲学': { color: '#f56c6c', bgColor: 'linear-gradient(135deg, #ffe6e6 0%, #ffb3b3 100%)' },
        '经济': { color: '#e6a23c', bgColor: 'linear-gradient(135deg, #fff7e6 0%, #ffe6b3 100%)' },
        '教育': { color: '#9c27b0', bgColor: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' },
        '艺术': { color: '#ff5722', bgColor: 'linear-gradient(135deg, #fff3e0 0%, #ffccbc 100%)' },
        '科学': { color: '#00bcd4', bgColor: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)' },
      }
      categories.value = (res.data.data || []).map(cat => ({
        ...cat,
        icon: Document,
        ...(catMap[cat.name] || { color: '#909399', bgColor: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' })
      }))
    }
  } catch {}
}

onMounted(async () => {
  loading.value = true
  try {
    const [configRes, bookRes, newsRes] = await Promise.all([
      http.get('/config/list', { params: { page: 1, limit: 10 } }),
      http.get('/book/list', { params: { page: 1, limit: 8, sort: 'addtime', order: 'desc' } }),
      http.get('/news/list', { params: { page: 1, limit: 5, sort: 'addtime', order: 'desc' } }),
      loadCategories(),
    ])
    banners.value = configRes.data?.data?.list || []
    hotBooks.value = bookRes.data?.data?.list || []
    latestNews.value = newsRes.data?.data?.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 200px);
  padding-bottom: 40px;
}

/* ========== 搜索区域 ========== */
.search-hero {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f64f59 100%);
  padding: 60px 24px;
  margin-bottom: 0;
  overflow: hidden;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: fadeInUp 0.8s ease-out;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px;
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

.search-bar {
  display: flex;
  gap: 12px;
  max-width: 560px;
  margin: 0 auto 20px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.search-input {
  flex: 1;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  padding: 8px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.search-bar .el-button {
  border-radius: 24px;
  padding: 0 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.hot-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.hot-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.hot-tag {
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  backdrop-filter: blur(8px);
}

.hot-tag:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.hero-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: #fff;
  top: -100px;
  right: -50px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: #fff;
  bottom: -80px;
  left: 10%;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: #fff;
  top: 50%;
  left: 5%;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== 统计栏 ========== */
.stats-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 48px;
  padding: 28px 24px;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 40px;
  border-radius: 0 0 16px 16px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  top: -20px;
  z-index: 3;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  font-size: 32px;
  color: #667eea;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 26px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e5e5;
}

/* ========== 分类导航 ========== */
.categories-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-emoji {
  font-size: 28px;
}

.section-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 12px;
  background: #fff;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  animation: fadeInUp 0.6s ease-out both;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.category-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.category-card:hover .category-icon-wrapper {
  transform: scale(1.1);
}

.category-icon {
  font-size: 28px;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

/* ========== 公告栏 ========== */
.notice-section {
  max-width: 1200px;
  margin: 0 auto 24px;
  padding: 0 24px;
  animation: fadeInUp 0.6s ease-out;
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
}

@keyframes ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-12deg); }
  20%, 40% { transform: rotate(12deg); }
}

.marquee-content {
  flex: 1;
  overflow: hidden;
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
  transition: all 0.3s;
}

.marquee-item:hover {
  color: #fa8c16;
}

/* ========== 轮播图 ========== */
.banner-carousel {
  max-width: 1200px;
  margin: 0 auto 48px;
  padding: 0 24px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.banner-placeholder {
  max-width: 1200px;
  margin: 0 auto 48px;
  padding: 0 24px;
}

.placeholder-content {
  height: 360px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #909399;
}

.placeholder-icon {
  font-size: 64px;
}

.banner-carousel :deep(.el-carousel__item) {
  border-radius: 16px;
}

/* ========== 书籍区域 ========== */
.section {
  max-width: 1200px;
  margin: 0 auto 48px;
  padding: 0 24px;
  animation: fadeInUp 0.6s ease-out;
}

.book-col {
  animation: fadeInUp 0.6s ease-out both;
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
  border: 2px solid #f5f5f5;
  background: #fff;
}

.book-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.book-card :deep(.el-card__body) {
  padding: 0;
}

.book-img-wrapper {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  aspect-ratio: 4/3;
}

.book-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-card:hover .book-img {
  transform: scale(1.1);
}

.book-overlay {
  position: absolute;
  inset: 0;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.badge-new {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
}

.badge-sold-out {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
}

.quick-actions {
  display: flex;
  justify-content: center;
  padding: 14px;
  pointer-events: auto;
}

.quick-cart-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.book-card:hover .quick-cart-btn {
  opacity: 1;
  transform: translateY(0);
}

.quick-cart-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.book-info {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-name {
  font-weight: 700;
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
  transition: color 0.3s;
}

.book-card:hover .book-name {
  color: #667eea;
}

.book-meta {
  margin-top: 4px;
}

.book-author {
  font-size: 13px;
  color: #8c8c8c;
}

.book-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
  margin-top: 8px;
}

.book-price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.book-price {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #f64f59 0%, #ff7875 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.book-original {
  font-size: 13px;
  color: #c0c0c0;
  text-decoration: line-through;
}

.book-tags {
  display: flex;
  gap: 6px;
}

.book-tag {
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
}

/* ========== 特色区域 ========== */
.features-section {
  max-width: 1200px;
  margin: 0 auto 40px;
  padding: 0 24px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.feature-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  border: 2px solid #f5f5f5;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out both;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.feature-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.feature-icon {
  font-size: 32px;
}

.feature-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.feature-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
  line-height: 1.6;
}

/* ========== 底部提示 ========== */
.tips-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  justify-content: center;
  gap: 48px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border-radius: 16px;
  border: 2px solid #e8ecff;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #667eea;
  font-weight: 600;
  font-size: 15px;
}

.tip-icon {
  font-size: 22px;
}

/* ========== 响应式 ========== */
@media (max-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .search-hero {
    padding: 40px 16px;
  }

  .hero-title {
    font-size: 26px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-bar .el-button {
    width: 100%;
  }

  .stats-bar {
    flex-wrap: wrap;
    gap: 24px;
    padding: 20px;
  }

  .stat-divider {
    display: none;
  }

  .category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .category-card {
    padding: 14px 8px;
  }

  .category-icon-wrapper {
    width: 44px;
    height: 44px;
  }

  .category-icon {
    font-size: 22px;
  }

  .category-name {
    font-size: 12px;
  }

  .banner-carousel,
  .banner-placeholder {
    padding: 0 16px;
  }

  .placeholder-content {
    height: 200px;
  }

  .section-title {
    font-size: 22px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .tips-section {
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
  }

  .tip-item {
    flex: 1;
    min-width: 140px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 22px;
  }

  .stats-bar {
    gap: 16px;
  }

  .stat-icon {
    font-size: 24px;
  }

  .stat-number {
    font-size: 20px;
  }

  .category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .tips-section {
    gap: 16px;
  }

  .tip-item {
    font-size: 13px;
  }
}
</style>
