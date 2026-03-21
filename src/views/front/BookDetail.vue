<template>
  <div class="book-detail-container">
    <el-skeleton :loading="loading" animated>
      <template #default>
        <el-card v-if="book" class="detail-card">
          <el-row :gutter="28">
            <el-col :xs="24" :md="10">
              <div class="book-image-wrapper">
                <img :src="getImg(book.cover)" class="book-image" />
                <div v-if="!book.stock || book.stock <= 0" class="image-overlay">已售罄</div>
              </div>
            </el-col>

            <el-col :xs="24" :md="14">
              <div class="book-header">
                <h1 class="book-title">{{ book.title }}</h1>
                <div class="price">¥{{ book.price }}</div>
              </div>

              <div v-if="resolveHierarchyPath(book)" class="hierarchy-path">
                {{ resolveHierarchyPath(book) }}
              </div>

                <el-descriptions :column="2" border class="book-descriptions">
                <el-descriptions-item label="ISBN">{{ book.isbn || '-' }}</el-descriptions-item>
                <el-descriptions-item label="作者">{{ book.author || '-' }}</el-descriptions-item>
                <el-descriptions-item label="书籍分类">{{ book.category_name || '-' }}</el-descriptions-item>
                <el-descriptions-item label="成色">{{ book.condition_name || '-' }}</el-descriptions-item>
                <el-descriptions-item label="出版社">{{ book.publisher || '-' }}</el-descriptions-item>
                <el-descriptions-item label="发布人">{{ book.seller_name || '-' }}</el-descriptions-item>
              </el-descriptions>

              <div class="action-section">
                <div class="stock-line">
                  <span>库存：</span>
                  <el-tag :type="stockType">{{ stockText }}</el-tag>
                </div>

                <div class="quantity-line">
                  <span>购买数量</span>
                  <el-input-number
                    v-model="buyNum"
                    :min="1"
                    :max="book.stock || 1"
                    :disabled="!book.stock || book.stock <= 0"
                  />
                </div>

                <div class="action-buttons">
                  <el-button
                    type="warning"
                    size="large"
                    :loading="cartLoading"
                    :disabled="!book.stock || book.stock <= 0"
                    @click="addToCart"
                  >
                    加入购物车
                  </el-button>
                  <el-button
                    type="danger"
                    size="large"
                    :loading="buyLoading"
                    :disabled="!book.stock || book.stock <= 0"
                    @click="buyNow"
                  >
                    立即购买
                  </el-button>
                  <el-button :type="isFav ? 'warning' : 'default'" size="large" :loading="favLoading" @click="toggleFav">
                    {{ isFav ? '已收藏' : '收藏' }}
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </template>
    </el-skeleton>

    <el-card v-if="book && !loading" class="section-card">
      <template #header>书籍简介</template>
      <div class="book-intro">{{ book.description || '暂无简介' }}</div>
    </el-card>

    <el-card v-if="!loading" class="section-card">
      <template #header>用户评论（{{ comments.length }}）</template>

      <el-empty v-if="comments.length === 0" description="暂无评论" />
      <div v-else class="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-head">
            <span class="comment-user">{{ comment.nickname || '匿名用户' }}</span>
            <span class="comment-time">{{ formatDate(comment.addtime) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div v-if="comment.reply" class="comment-reply">回复：{{ comment.reply }}</div>
        </div>
      </div>

      <el-divider v-if="isLogin" />
      <div v-if="isLogin">
        <el-input
          v-model="commentText"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="写下你的评论"
        />
        <el-button type="primary" style="margin-top: 12px" :loading="commentLoading" @click="submitComment">
          发表评论
        </el-button>
      </div>
      <el-alert v-else type="info" :closable="false" style="margin-top: 12px">
        <template #default>
          请先 <el-link type="primary" @click="$router.push('/login')">登录</el-link> 后再发表评论
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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

const getImg = (value) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:image')) return value
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '')
  if (normalized.startsWith('upload/')) {
    return `/api/file/download/${normalized}`
  }
  return `/api/file/download/upload/${normalized}`
}

const stockType = computed(() => {
  if (!book.value || !book.value.stock) return 'danger'
  if (book.value.stock > 10) return 'success'
  if (book.value.stock > 0) return 'warning'
  return 'danger'
})

const stockText = computed(() => {
  if (!book.value || !book.value.stock) return '已售罄'
  if (book.value.stock > 10) return '库存充足'
  if (book.value.stock > 0) return `仅剩 ${book.value.stock} 件`
  return '已售罄'
})

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const loadBook = async () => {
  loading.value = true
  try {
    const { data: res } = await http.get(`/book/detail/${route.params.id}`)
    if (res.code === 0) {
      book.value = res.data
    }
  } catch {
    ElMessage.error('加载书籍信息失败')
  } finally {
    loading.value = false
  }
}

const loadComments = async () => {
  try {
    const { data: res } = await http.get('/review/list', {
      params: { page: 1, limit: 100, book_id: route.params.id },
    })
    comments.value = res.data?.list || res.data?.data?.list || []
  } catch {
    comments.value = []
  }
}

const checkFav = async () => {
  if (!isLogin) return
  try {
    const uid = localStorage.getItem('userid')
    const { data: res } = await http.get('/storeup/list', {
      params: { page: 1, limit: 1, userid: uid, refid: route.params.id, tablename: 'ershoushuji' },
    })
    isFav.value = (res.data?.total || res.data?.data?.total || 0) > 0
  } catch {
    isFav.value = false
  }
}

const ensureLogin = () => {
  if (isLogin) return true
  ElMessage.warning('请先登录')
  router.push('/login')
  return false
}

const addToCart = async () => {
  if (!ensureLogin()) return
  if (!book.value?.stock || book.value.stock <= 0) {
    ElMessage.warning('当前书籍已售罄')
    return
  }
  if (buyNum.value > book.value.stock) {
    ElMessage.warning(`库存不足，仅剩 ${book.value.stock} 件`)
    return
  }

  cartLoading.value = true
  try {
    const { data: res } = await http.post('/cart/add', {
      book_id: book.value.id,
      book_title: book.value.title,
      book_cover: book.value.cover,
      quantity: buyNum.value,
      price: book.value.price,
      userid: Number(localStorage.getItem('userid')),
    })
    if (res.code === 0) {
      ElMessage.success('已加入购物车')
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '加入购物车失败')
  } finally {
    cartLoading.value = false
  }
}

const buyNow = async () => {
  if (!ensureLogin()) return
  buyLoading.value = true
  await addToCart()
  buyLoading.value = false
  router.push('/front/cart')
}

const toggleFav = async () => {
  if (!ensureLogin()) return
  favLoading.value = true
  try {
    const uid = Number(localStorage.getItem('userid'))
    if (isFav.value) {
      const { data: listRes } = await http.get('/favorite/list', {
        params: { page: 1, limit: 1, userid: uid, book_id: route.params.id },
      })
      const item = listRes.data?.list?.[0] || listRes.data?.data?.list?.[0]
      if (item) {
        await http.post('/storeup/delete', [item.id])
      }
      isFav.value = false
      ElMessage.success('已取消收藏')
    } else {
      const { data: res } = await http.post('/favorite/add', {
        userid: uid,
        book_id: book.value.id,
        name: book.value.title,
        picture: book.value.cover,
        type: '1',
      })
      if (res.code === 0) {
        isFav.value = true
        ElMessage.success('收藏成功')
      } else {
        ElMessage.error(res.msg)
      }
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    favLoading.value = false
  }
}

const submitComment = async () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  commentLoading.value = true
  try {
    const { data: res } = await http.post('/review/add', {
      book_id: Number(route.params.id),
      userid: Number(localStorage.getItem('userid')),
      content: commentText.value.trim(),
    })
    if (res.code === 0) {
      commentText.value = ''
      ElMessage.success('评论成功')
      await loadComments()
    } else {
      ElMessage.error(res.msg)
    }
  } catch {
    ElMessage.error('评论失败')
  } finally {
    commentLoading.value = false
  }
}

onMounted(async () => {
  await loadBook()
  await Promise.all([loadComments(), checkFav()])
})
</script>

<style scoped>
.book-detail-container {
  min-height: calc(100vh - 200px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.detail-card,
.section-card {
  margin-bottom: 24px;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  box-shadow: none;
}

.detail-card :deep(.el-card__body),
.section-card :deep(.el-card__body) {
  padding: 32px;
}

.section-card :deep(.el-card__header) {
  border-bottom: 1px solid #e5e5e5;
  padding: 20px 32px;
  font-size: 18px;
  font-weight: 600;
  color: #0a0a0a;
}

.book-image-wrapper {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  background: #fafafa;
}

.book-image {
  width: 100%;
  display: block;
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.book-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5e5;
}

.book-title {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: #0a0a0a;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.price {
  color: #0a0a0a;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.hierarchy-path {
  margin-bottom: 24px;
  padding: 12px 16px;
  border-radius: 4px;
  background: #fafafa;
  color: #737373;
  font-size: 13px;
  border: 1px solid #e5e5e5;
}

.book-descriptions {
  margin-bottom: 24px;
}

.book-descriptions :deep(.el-descriptions__label) {
  color: #737373;
  font-weight: 500;
}

.book-descriptions :deep(.el-descriptions__content) {
  color: #0a0a0a;
}

.action-section {
  padding: 24px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
}

.stock-line,
.quantity-line {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #0a0a0a;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-buttons :deep(.el-button) {
  border-radius: 4px;
  font-weight: 500;
}

.action-buttons :deep(.el-button--warning) {
  background: #0a0a0a;
  border-color: #0a0a0a;
  color: #fff;
}

.action-buttons :deep(.el-button--warning:hover) {
  background: #2a2a2a;
  border-color: #2a2a2a;
}

.action-buttons :deep(.el-button--danger) {
  background: #0a0a0a;
  border-color: #0a0a0a;
}

.action-buttons :deep(.el-button--danger:hover) {
  background: #2a2a2a;
  border-color: #2a2a2a;
}

.action-buttons :deep(.el-button--default) {
  border-color: #e5e5e5;
  color: #0a0a0a;
}

.action-buttons :deep(.el-button--default:hover) {
  border-color: #0a0a0a;
}

.book-intro {
  line-height: 1.8;
  white-space: pre-wrap;
  color: #0a0a0a;
  font-size: 15px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 20px;
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
}

.comment-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
}

.comment-user {
  color: #0a0a0a;
  font-weight: 600;
}

.comment-time {
  color: #a3a3a3;
}

.comment-content {
  line-height: 1.7;
  color: #0a0a0a;
  font-size: 14px;
}

.comment-reply {
  margin-top: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  color: #737373;
  font-size: 13px;
  border: 1px solid #e5e5e5;
}

@media (max-width: 768px) {
  .book-detail-container {
    padding: 20px 16px;
  }

  .detail-card :deep(.el-card__body),
  .section-card :deep(.el-card__body) {
    padding: 20px;
  }

  .section-card :deep(.el-card__header) {
    padding: 16px 20px;
  }

  .book-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .book-title {
    font-size: 24px;
  }

  .price {
    font-size: 28px;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
