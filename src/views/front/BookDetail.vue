<template>
  <div class="book-detail-container">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-card>
          <el-row :gutter="24">
            <el-col :span="10">
              <el-skeleton-item variant="image" style="width: 100%; height: 500px" />
            </el-col>
            <el-col :span="14">
              <el-skeleton-item variant="h1" style="width: 60%" />
              <el-skeleton-item variant="text" style="width: 30%; margin-top: 20px" />
              <el-skeleton :rows="5" style="margin-top: 20px" />
            </el-col>
          </el-row>
        </el-card>
      </template>

      <template #default>
        <el-card v-if="book" class="detail-card">
          <el-row :gutter="32">
            <el-col :xs="24" :md="10">
              <div class="book-image-wrapper">
                <img :src="getImg(book.shujifengmian)" class="book-image" />
                <div class="image-overlay" v-if="!book.kucun || book.kucun <= 0">
                  <el-icon><Lock /></el-icon>
                  <span>已售罄</span>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :md="14">
              <div class="book-header">
                <h1 class="book-title">{{ book.shujimingcheng }}</h1>
                <div class="book-stats">
                  <el-tag type="info" size="small">
                    <el-icon><View /></el-icon> {{ book.clicknum || 0 }} 次浏览
                  </el-tag>
                </div>
              </div>

              <div class="price-section">
                <div class="price">¥{{ book.price }}</div>
                <div class="stock-info" :class="stockClass">
                  <el-icon v-if="book.kucun > 10"><CircleCheck /></el-icon>
                  <el-icon v-else-if="book.kucun > 0"><Warning /></el-icon>
                  <el-icon v-else><CircleClose /></el-icon>
                  <span v-if="book.kucun > 10">库存充足</span>
                  <span v-else-if="book.kucun > 0">仅剩 {{ book.kucun }} 件</span>
                  <span v-else>已售罄</span>
                </div>
              </div>

              <div v-if="resolveHierarchyPath(book)" class="hierarchy-path">
                {{ resolveHierarchyPath(book) }}
              </div>

              <el-descriptions :column="2" border class="book-descriptions">
                <el-descriptions-item label="书籍编号">
                  <el-tag size="small">{{ book.shujibianhao }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="ISBN">{{ book.isbn || '-' }}</el-descriptions-item>
                <el-descriptions-item label="作者">{{ book.shujizuozhe }}</el-descriptions-item>
                <el-descriptions-item label="课程编号">{{ book.kechengbianhao || '-' }}</el-descriptions-item>
                <el-descriptions-item label="分类">
                  <el-tag type="success" size="small">{{ book.shujifenlei }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="学院">{{ book.xueyuan || '-' }}</el-descriptions-item>
                <el-descriptions-item label="专业">{{ book.zhuanye || '-' }}</el-descriptions-item>
                <el-descriptions-item label="课程">{{ book.kecheng || '-' }}</el-descriptions-item>
                <el-descriptions-item label="版本">{{ book.banben || '-' }}</el-descriptions-item>
                <el-descriptions-item label="教材版本">{{ book.jiaocaibanben || '-' }}</el-descriptions-item>
                <el-descriptions-item label="适用专业">{{ book.shiyongzhuanye || '-' }}</el-descriptions-item>
                <el-descriptions-item label="适用课程">{{ book.shiyongkecheng || '-' }}</el-descriptions-item>
                <el-descriptions-item label="新旧程度">
                  <el-tag type="warning" size="small">{{ book.xinjiuchengdu }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="出版社">{{ book.chubanshe }}</el-descriptions-item>
                <el-descriptions-item label="上架日期">{{ formatDate(book.shangjiariqi) }}</el-descriptions-item>
                <el-descriptions-item label="商家">
                  <el-tag type="primary" size="small">{{ book.shangjiaxingming }}</el-tag>
                </el-descriptions-item>
              </el-descriptions>

              <div class="action-section">
                <div class="quantity-selector">
                  <span class="label">数量：</span>
                  <el-input-number
                    v-model="buyNum"
                    :min="1"
                    :max="book.kucun || 99"
                    :disabled="!book.kucun || book.kucun <= 0"
                  />
                </div>
                <div class="action-buttons">
                  <el-button
                    type="warning"
                    size="large"
                    @click="addToCart"
                    :disabled="!book.kucun || book.kucun <= 0"
                    :loading="cartLoading"
                  >
                    <el-icon><ShoppingCart /></el-icon> 加入购物车
                  </el-button>
                  <el-button
                    type="danger"
                    size="large"
                    @click="buyNow"
                    :disabled="!book.kucun || book.kucun <= 0"
                    :loading="buyLoading"
                  >
                    <el-icon><ShoppingBag /></el-icon> 立即购买
                  </el-button>
                  <el-button
                    :type="isFav ? 'warning' : 'default'"
                    size="large"
                    @click="toggleFav"
                    :loading="favLoading"
                  >
                    <el-icon><Star /></el-icon> {{ isFav ? '已收藏' : '收藏' }}
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </template>
    </el-skeleton>

    <el-card class="intro-card" v-if="book && !loading">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>书籍简介</span>
        </div>
      </template>
      <div class="book-intro">{{ book.shujijianjie || '暂无简介' }}</div>
    </el-card>
    <!-- 评论区 -->
    <el-card class="comment-card" v-if="!loading">
      <template #header>
        <div class="card-header">
          <el-icon><ChatDotRound /></el-icon>
          <span>用户评论 ({{ comments.length }})</span>
        </div>
      </template>

      <el-empty v-if="comments.length === 0" description="暂无评论，快来抢沙发吧~" />
      <div v-else class="comment-list">
        <div v-for="c in comments" :key="c.id" class="comment-item">
          <div class="comment-avatar">
            <el-avatar :size="40">{{ (c.nickname || '匿名')[0] }}</el-avatar>
          </div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-user">{{ c.nickname || '匿名用户' }}</span>
              <span class="comment-time">{{ formatDate(c.addtime) }}</span>
            </div>
            <div class="comment-content">{{ c.content }}</div>
            <div v-if="c.reply" class="comment-reply">
              <el-icon><ChatLineRound /></el-icon>
              <span>商家回复：{{ c.reply }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-divider v-if="isLogin" />
      <div v-if="isLogin" class="comment-input-section">
        <el-input
          v-model="commentText"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
          maxlength="200"
          show-word-limit
        />
        <el-button
          type="primary"
          @click="submitComment"
          :loading="commentLoading"
          style="margin-top: 12px"
        >
          <el-icon><Promotion /></el-icon> 发表评论
        </el-button>
      </div>
      <el-alert
        v-else
        type="info"
        :closable="false"
        style="margin-top: 12px"
      >
        <template #default>
          <span>请先 <el-link type="primary" @click="$router.push('/login')">登录</el-link> 后再发表评论</span>
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ShoppingCart, ShoppingBag, Star, Document, ChatDotRound, ChatLineRound,
  Promotion, View, CircleCheck, Warning, CircleClose, Lock
} from '@element-plus/icons-vue'
import http from '@/utils/http'
import { resolveHierarchyPath } from '@/utils/bookHierarchy'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const cartLoading = ref(false)
const buyLoading = ref(false)
const favLoading = ref(false)
const commentLoading = ref(false)
const book = ref(null)
const buyNum = ref(1)
const isFav = ref(false)
const comments = ref([])
const commentText = ref('')
const isLogin = !!localStorage.getItem('token')
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const stockClass = computed(() => {
  if (!book.value) return ''
  if (book.value.kucun > 10) return 'stock-good'
  if (book.value.kucun > 0) return 'stock-low'
  return 'stock-out'
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const loadBook = async () => {
  loading.value = true
  try {
    const res = await http.get(`/ershoushuji/detail/${route.params.id}`)
    book.value = res.data?.data
  } catch (e) {
    ElMessage.error('加载书籍信息失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  try {
    const res = await http.get('/discussershoushuji/list', {
      params: { page: 1, limit: 100, refid: route.params.id }
    })
    comments.value = res.data?.data?.list || []
  } catch (e) {
    console.error(e)
  }
}

const checkFav = async () => {
  if (!isLogin) return
  try {
    const uid = localStorage.getItem('userid')
    const res = await http.get('/storeup/list', {
      params: { page: 1, limit: 1, userid: uid, refid: route.params.id, tablename: 'ershoushuji' }
    })
    isFav.value = (res.data?.data?.total || 0) > 0
  } catch (e) {
    console.error(e)
  }
}

const addToCart = async () => {
  if (!isLogin) {
    ElMessage.warning('请先登录')
    return router.push('/login')
  }
  if (!book.value.kucun || book.value.kucun <= 0) {
    return ElMessage.warning('商品已售罄')
  }
  if (buyNum.value > book.value.kucun) {
    return ElMessage.warning(`库存不足，仅剩 ${book.value.kucun} 件`)
  }

  cartLoading.value = true
  try {
    await http.post('/cart/add', {
      tablename: 'ershoushuji',
      goodid: book.value.id,
      goodname: book.value.shujimingcheng,
      picture: book.value.shujifengmian,
      buynumber: buyNum.value,
      price: book.value.price,
      userid: parseInt(localStorage.getItem('userid'))
    })
    ElMessage.success('已加入购物车')
  } catch (e) {
    ElMessage.error(e.response?.data?.msg || '加入购物车失败')
  } finally {
    cartLoading.value = false
  }
}

const buyNow = async () => {
  if (!isLogin) {
    ElMessage.warning('请先登录')
    return router.push('/login')
  }
  buyLoading.value = true
  await addToCart()
  buyLoading.value = false
  if (!cartLoading.value) {
    router.push('/front/cart')
  }
}

const toggleFav = async () => {
  if (!isLogin) {
    ElMessage.warning('请先登录')
    return router.push('/login')
  }

  favLoading.value = true
  try {
    const uid = localStorage.getItem('userid')
    if (isFav.value) {
      const res = await http.get('/storeup/list', {
        params: { page: 1, limit: 1, userid: uid, refid: route.params.id, tablename: 'ershoushuji' }
      })
      const items = res.data?.data?.list || []
      if (items.length) await http.post('/storeup/delete', [items[0].id])
      isFav.value = false
      ElMessage.success('已取消收藏')
    } else {
      await http.post('/storeup/add', {
        userid: parseInt(uid),
        refid: book.value.id,
        tablename: 'ershoushuji',
        name: book.value.shujimingcheng,
        picture: book.value.shujifengmian,
        type: '1'
      })
      isFav.value = true
      ElMessage.success('收藏成功')
    }
  } catch (e) {
    ElMessage.error('操作失败')
    console.error(e)
  } finally {
    favLoading.value = false
  }
}

const submitComment = async () => {
  if (!commentText.value.trim()) {
    return ElMessage.warning('请输入评论内容')
  }

  commentLoading.value = true
  try {
    await http.post('/discussershoushuji/add', {
      refid: parseInt(route.params.id),
      userid: parseInt(localStorage.getItem('userid')),
      nickname: localStorage.getItem('username'),
      content: commentText.value
    })
    commentText.value = ''
    ElMessage.success('评论成功')
    loadComments()
  } catch (e) {
    ElMessage.error('评论失败')
    console.error(e)
  } finally {
    commentLoading.value = false
  }
}

onMounted(() => {
  loadBook()
  loadComments()
  checkFav()
})
</script>

<style scoped>
.book-detail-container {
  min-height: calc(100vh - 200px);
}

.detail-card {
  border-radius: 8px;
  margin-bottom: 16px;
}

.book-image-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
}

.book-image {
  width: 100%;
  display: block;
  border-radius: 8px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  gap: 12px;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.book-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.book-stats {
  display: flex;
  gap: 8px;
}

.price-section {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-size: 36px;
  font-weight: bold;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
}

.stock-info.stock-good {
  color: #67c23a;
}

.stock-info.stock-low {
  color: #e6a23c;
}

.stock-info.stock-out {
  color: #f56c6c;
}

.book-descriptions {
  margin-bottom: 24px;
}

.hierarchy-path {
  margin-bottom: 18px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 14px;
  line-height: 1.6;
}

.action-section {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.quantity-selector .label {
  font-weight: 500;
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.intro-card,
.comment-card {
  border-radius: 8px;
  margin-top: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
}

.book-intro {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.comment-item:hover {
  background: #ecf5ff;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-user {
  font-weight: bold;
  color: #303133;
}

.comment-time {
  color: #909399;
  font-size: 12px;
}

.comment-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-reply {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #409eff;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 6px;
}

.comment-input-section {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-title {
    font-size: 22px;
  }

  .price {
    font-size: 28px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
