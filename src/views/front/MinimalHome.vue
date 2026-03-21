<template>
  <div class="minimal-home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">校园二手书交易平台</div>
        <h1 class="hero-title">校园书市</h1>
        <p class="hero-subtitle">让知识在校园流动，让书籍找到新主人</p>
        <div class="hero-search">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索书籍、作者、ISBN..."
            @keyup.enter="handleSearch"
            class="search-input"
          />
          <button @click="handleSearch" class="search-btn">
            <span>搜索</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2L10 8L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="hero-tags">
          <button 
            v-for="tag in quickTags" 
            :key="tag" 
            class="tag-btn"
            @click="quickSearch(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stat-item" v-for="(stat, index) in stats" :key="index">
        <div class="stat-number">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section" v-if="categories.length">
      <div class="section-header">
        <h2 class="section-title">热门分类</h2>
      </div>
      <div class="categories-grid">
        <div 
          v-for="category in categories.slice(0, 6)" 
          :key="category"
          class="category-card"
          @click="searchByCategory(category)"
        >
          <div class="category-icon">{{ getCategoryIcon(category) }}</div>
          <div class="category-name">{{ category }}</div>
        </div>
      </div>
    </section>

    <!-- Books Section -->
    <section class="books-section">
      <div class="section-header">
        <h2 class="section-title">最新上架</h2>
        <router-link to="/front/books" class="view-all">
          查看全部
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </router-link>
      </div>

      <div v-if="loading" class="books-grid">
        <div v-for="i in 8" :key="i" class="book-skeleton">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-text"></div>
            <div class="skeleton-text short"></div>
            <div class="skeleton-text shorter"></div>
          </div>
        </div>
      </div>

      <div v-else-if="books.length" class="books-grid">
        <div 
          v-for="book in books" 
          :key="book.id" 
          class="book-card"
          @click="$router.push(`/front/book/${book.id}`)"
        >
          <div class="book-image">
            <img :src="getImg(book.shujifengmian)" :alt="book.shujimingcheng" loading="lazy" />
            <div v-if="!book.kucun" class="sold-badge">售罄</div>
            <div v-else-if="book.kucun <= 3" class="limited-badge">仅剩{{ book.kucun }}件</div>
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.shujimingcheng }}</h3>
            <p class="book-author">{{ book.shujizuozhe }}</p>
            <div class="book-footer">
              <span class="book-price">¥{{ book.price }}</span>
              <span class="book-condition">{{ book.xinjiuchengdu }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else description="暂无书籍" />
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.title">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/utils/http'

const router = useRouter()
const loading = ref(true)
const books = ref([])
const total = ref(0)
const categories = ref([])
const searchQuery = ref('')

const quickTags = ['计算机', '文学', '经济', '数学', '物理']

const stats = computed(() => [
  { value: total.value, label: '在售书籍' },
  { value: categories.value.length, label: '书籍分类' },
  { value: '4', label: '学院覆盖' }
])

const features = [
  { icon: '🎯', title: '精准匹配', desc: '根据专业课程智能推荐' },
  { icon: '💰', title: '价格实惠', desc: '比新书便宜50%以上' },
  { icon: '🔒', title: '交易安全', desc: '平台担保，放心购买' },
  { icon: '⚡', title: '快速交易', desc: '校内交易，当面验货' }
]

const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const getCategoryIcon = (category) => {
  const icons = {
    '计算机': '💻',
    '文学': '📚',
    '经济': '💼',
    '数学': '🔢',
    '物理': '⚛️',
    '化学': '🧪',
    '历史': '📜',
    '艺术': '🎨'
  }
  return icons[category] || '📖'
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/front/books', query: { keyword: searchQuery.value } })
  }
}

const quickSearch = (tag) => {
  router.push({ path: '/front/books', query: { keyword: tag } })
}

const searchByCategory = (category) => {
  router.push({ path: '/front/books', query: { shujifenlei: category } })
}

onMounted(async () => {
  loading.value = true
  try {
    const [booksRes, categoriesRes] = await Promise.all([
      http.get('/ershoushuji/list', { params: { page: 1, limit: 8, sort: 'addtime', order: 'desc' } }),
      http.get('/option/shujifenlei/shujifenlei')
    ])
    books.value = booksRes.data?.data?.list || []
    total.value = booksRes.data?.data?.total || 0
    categories.value = categoriesRes.data?.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.minimal-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* Hero Section */
.hero {
  padding: 80px 0 60px;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  font-size: 12px;
  color: #737373;
  letter-spacing: 0.05em;
  margin-bottom: 24px;
  text-transform: uppercase;
}

.hero-title {
  font-size: 72px;
  font-weight: 600;
  letter-spacing: -0.04em;
  margin: 0 0 16px;
  color: #0a0a0a;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 18px;
  color: #737373;
  margin: 0 0 48px;
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-search {
  max-width: 600px;
  margin: 0 auto 24px;
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  height: 56px;
  padding: 0 24px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.2s;
  background: #fafafa;
}

.search-input:focus {
  outline: none;
  border-color: #0a0a0a;
  background: #fff;
}

.search-input::placeholder {
  color: #a3a3a3;
}

.search-btn {
  height: 56px;
  padding: 0 32px;
  background: #0a0a0a;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-btn:hover {
  background: #2a2a2a;
}

.search-btn:active {
  transform: scale(0.98);
}

.hero-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.tag-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  font-size: 14px;
  color: #737373;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: #0a0a0a;
  color: #0a0a0a;
  background: #fafafa;
}

/* Stats Section */
.stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px;
  padding: 60px 0;
  border-top: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 56px;
  font-weight: 600;
  color: #0a0a0a;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 13px;
  color: #737373;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Categories Section */
.categories-section {
  padding: 80px 0 40px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.category-card {
  padding: 32px 24px;
  background: #fafafa;
  border: 1px solid transparent;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover {
  background: #fff;
  border-color: #e5e5e5;
  transform: translateY(-2px);
}

.category-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #0a0a0a;
}

/* Books Section */
.books-section {
  padding: 40px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  color: #0a0a0a;
  letter-spacing: -0.02em;
  margin: 0;
}

.view-all {
  color: #737373;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-all:hover {
  color: #0a0a0a;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

/* Book Card */
.book-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-card:active {
  transform: translateY(-2px);
}

.book-image {
  position: relative;
  aspect-ratio: 3/4;
  background: #fafafa;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid #e5e5e5;
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.book-card:hover .book-image img {
  transform: scale(1.05);
}

.sold-badge,
.limited-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  border-radius: 2px;
  letter-spacing: 0.05em;
  backdrop-filter: blur(10px);
}

.limited-badge {
  background: rgba(220, 38, 38, 0.9);
}

.book-info {
  padding: 0 4px;
}

.book-title {
  font-size: 15px;
  font-weight: 500;
  color: #0a0a0a;
  margin: 0 0 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.book-author {
  font-size: 13px;
  color: #737373;
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-price {
  font-size: 20px;
  font-weight: 600;
  color: #0a0a0a;
  letter-spacing: -0.01em;
}

.book-condition {
  font-size: 12px;
  color: #a3a3a3;
}

/* Features Section */
.features-section {
  padding: 80px 0 0;
  border-top: 1px solid #e5e5e5;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #0a0a0a;
  margin: 0 0 8px;
}

.feature-desc {
  font-size: 14px;
  color: #737373;
  margin: 0;
  line-height: 1.6;
}

/* Skeleton */
.book-skeleton {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-image {
  aspect-ratio: 3/4;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-content {
  padding: 0 4px;
}

.skeleton-text {
  height: 14px;
  background: #f5f5f5;
  border-radius: 2px;
  margin-bottom: 8px;
}

.skeleton-text.short {
  width: 60%;
}

.skeleton-text.shorter {
  width: 40%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Responsive */
@media (max-width: 768px) {
  .minimal-home {
    padding: 0 16px 60px;
  }

  .hero {
    padding: 60px 0 40px;
  }

  .hero-title {
    font-size: 48px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-search {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
    justify-content: center;
  }

  .stats {
    gap: 40px;
    flex-wrap: wrap;
  }

  .stat-number {
    font-size: 40px;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }

  .category-card {
    padding: 24px 16px;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .section-title {
    font-size: 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
