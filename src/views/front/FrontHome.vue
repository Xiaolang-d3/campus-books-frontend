<template>
  <div>
    <!-- 轮播图 -->
    <el-carousel height="360px" v-if="banners.length">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img :src="getImg(item.value)" style="width:100%;height:100%;object-fit:cover" />
      </el-carousel-item>
    </el-carousel>

    <!-- 热门书籍 -->
    <div class="section">
      <div class="section-title">热门书籍 <el-button text type="primary" @click="$router.push('/front/books')">更多 &gt;</el-button></div>
      <el-row :gutter="16">
        <el-col :span="6" v-for="book in hotBooks" :key="book.id">
          <el-card shadow="hover" class="book-card" @click="$router.push(`/front/book/${book.id}`)">
            <img :src="getImg(book.shujifengmian)" class="book-img" />
            <div class="book-info">
              <div class="book-name">{{ book.shujimingcheng }}</div>
              <div class="book-price">¥{{ book.price }}</div>
              <div class="book-meta">{{ book.shujifenlei }} · {{ book.xinjiuchengdu }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 公告信息 -->
    <div class="section" v-if="newsList.length">
      <div class="section-title">公告信息 <el-button text type="primary" @click="$router.push('/front/news')">更多 &gt;</el-button></div>
      <el-card v-for="n in newsList" :key="n.id" class="news-item" @click="$router.push(`/front/news/${n.id}`)">
        <div style="display:flex;gap:16px;align-items:center">
          <img :src="getImg(n.picture)" style="width:120px;height:80px;object-fit:cover;border-radius:4px" />
          <div>
            <div style="font-size:16px;font-weight:bold">{{ n.title }}</div>
            <div style="color:#999;margin-top:8px">{{ n.introduction }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/utils/http'

const banners = ref([])
const hotBooks = ref([])
const newsList = ref([])
const baseUrl = import.meta.env.VITE_API_URL || ''
const getImg = (v) => v ? (v.startsWith('http') ? v : `${baseUrl}/api/file/download/${v}`) : ''

onMounted(async () => {
  try {
    const [configRes, bookRes, newsRes] = await Promise.all([
      http.get('/config/list', { params: { page: 1, limit: 10 } }),
      http.get('/ershoushuji/list', { params: { page: 1, limit: 8, sort: 'addtime', order: 'desc' } }),
      http.get('/news/list', { params: { page: 1, limit: 5 } })
    ])
    banners.value = configRes.data?.data?.list || []
    hotBooks.value = bookRes.data?.data?.list || []
    newsList.value = newsRes.data?.data?.list || []
  } catch (e) { /* ignore */ }
})
</script>

<style scoped>
.section { margin-top: 24px; }
.section-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
.book-card { cursor: pointer; margin-bottom: 16px; }
.book-card:hover { transform: translateY(-2px); transition: .2s; }
.book-img { width: 100%; height: 180px; object-fit: cover; border-radius: 4px; }
.book-info { padding: 8px 0; }
.book-name { font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.book-price { color: #f56c6c; font-size: 16px; font-weight: bold; margin-top: 4px; }
.book-meta { color: #999; font-size: 12px; margin-top: 4px; }
.news-item { margin-bottom: 12px; cursor: pointer; }
.news-item:hover { box-shadow: 0 2px 12px rgba(0,0,0,.1); }
</style>
