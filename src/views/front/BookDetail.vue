<template>
  <div v-if="book">
    <el-card>
      <el-row :gutter="24">
        <el-col :span="10">
          <img :src="getImg(book.shujifengmian)" style="width:100%;border-radius:8px" />
        </el-col>
        <el-col :span="14">
          <h2>{{ book.shujimingcheng }}</h2>
          <div class="price">¥{{ book.price }}</div>
          <el-descriptions :column="2" border style="margin-top:16px">
            <el-descriptions-item label="书籍编号">{{ book.shujibianhao }}</el-descriptions-item>
            <el-descriptions-item label="作者">{{ book.shujizuozhe }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ book.shujifenlei }}</el-descriptions-item>
            <el-descriptions-item label="新旧程度">{{ book.xinjiuchengdu }}</el-descriptions-item>
            <el-descriptions-item label="出版社">{{ book.chubanshe }}</el-descriptions-item>
            <el-descriptions-item label="上架日期">{{ book.shangjiariqi }}</el-descriptions-item>
            <el-descriptions-item label="商家">{{ book.shangjiaxingming }}</el-descriptions-item>
          </el-descriptions>
          <div style="margin-top:20px;display:flex;gap:12px">
            <el-input-number v-model="buyNum" :min="1" :max="99" />
            <el-button type="warning" size="large" @click="addToCart"><el-icon><ShoppingCart /></el-icon> 加入购物车</el-button>
            <el-button type="danger" size="large" @click="buyNow">立即购买</el-button>
            <el-button :type="isFav ? 'warning' : 'default'" size="large" @click="toggleFav">
              <el-icon><Star /></el-icon> {{ isFav ? '已收藏' : '收藏' }}
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-card style="margin-top:16px">
      <template #header>书籍简介</template>
      <div v-html="book.shujijianjie || '暂无简介'"></div>
    </el-card>
    <!-- 评论区 -->
    <el-card style="margin-top:16px">
      <template #header>用户评论</template>
      <div v-if="comments.length === 0" style="color:#999;text-align:center;padding:20px">暂无评论</div>
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <div class="comment-header">
          <span class="comment-user">{{ c.nickname || '匿名用户' }}</span>
          <span class="comment-time">{{ c.addtime }}</span>
        </div>
        <div class="comment-content">{{ c.content }}</div>
        <div v-if="c.reply" class="comment-reply">回复：{{ c.reply }}</div>
      </div>
      <el-divider v-if="isLogin" />
      <div v-if="isLogin" style="display:flex;gap:12px">
        <el-input v-model="commentText" placeholder="写下你的评论..." />
        <el-button type="primary" @click="submitComment">发表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const buyNum = ref(1)
const isFav = ref(false)
const comments = ref([])
const commentText = ref('')
const isLogin = !!localStorage.getItem('token')
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const loadBook = async () => {
  const res = await http.get(`/ershoushuji/detail/${route.params.id}`)
  book.value = res.data?.data
}

const loadComments = async () => {
  const res = await http.get('/discussershoushuji/list', { params: { page: 1, limit: 100, refid: route.params.id } })
  comments.value = res.data?.data?.list || []
}

const checkFav = async () => {
  if (!isLogin) return
  const uid = localStorage.getItem('userid')
  const res = await http.get('/storeup/list', { params: { page: 1, limit: 1, userid: uid, refid: route.params.id, tablename: 'ershoushuji' } })
  isFav.value = (res.data?.data?.total || 0) > 0
}

const addToCart = async () => {
  if (!isLogin) return router.push('/login')
  await http.post('/cart/add', {
    tablename: 'ershoushuji', goodid: book.value.id, goodname: book.value.shujimingcheng,
    picture: book.value.shujifengmian, buynumber: buyNum.value, price: book.value.price,
    userid: parseInt(localStorage.getItem('userid'))
  })
  ElMessage.success('已加入购物车')
}

const buyNow = async () => {
  if (!isLogin) return router.push('/login')
  await addToCart()
  router.push('/front/cart')
}

const toggleFav = async () => {
  if (!isLogin) return router.push('/login')
  const uid = localStorage.getItem('userid')
  if (isFav.value) {
    const res = await http.get('/storeup/list', { params: { page: 1, limit: 1, userid: uid, refid: route.params.id, tablename: 'ershoushuji' } })
    const items = res.data?.data?.list || []
    if (items.length) await http.post('/storeup/delete', [items[0].id])
    isFav.value = false
    ElMessage.success('已取消收藏')
  } else {
    await http.post('/storeup/add', {
      userid: parseInt(uid), refid: book.value.id, tablename: 'ershoushuji',
      name: book.value.shujimingcheng, picture: book.value.shujifengmian, type: '1'
    })
    isFav.value = true
    ElMessage.success('收藏成功')
  }
}

const submitComment = async () => {
  if (!commentText.value.trim()) return ElMessage.warning('请输入评论内容')
  await http.post('/discussershoushuji/add', {
    refid: parseInt(route.params.id), userid: parseInt(localStorage.getItem('userid')),
    nickname: localStorage.getItem('username'), content: commentText.value
  })
  commentText.value = ''
  ElMessage.success('评论成功')
  loadComments()
}

onMounted(() => { loadBook(); loadComments(); checkFav() })
</script>

<style scoped>
.price { color: #f56c6c; font-size: 28px; font-weight: bold; }
.comment-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.comment-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.comment-user { font-weight: bold; }
.comment-time { color: #999; font-size: 12px; }
.comment-content { color: #333; }
.comment-reply { color: #409eff; margin-top: 8px; padding: 8px; background: #f5f7fa; border-radius: 4px; }
</style>
