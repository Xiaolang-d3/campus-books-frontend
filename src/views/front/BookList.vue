<template>
  <div>
    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="书名">
          <el-input v-model="search.shujimingcheng" placeholder="搜索书名" clearable @clear="loadData" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="search.shujifenlei" placeholder="全部" clearable @change="loadData">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="6" v-for="book in list" :key="book.id">
        <el-card shadow="hover" class="book-card" @click="$router.push(`/front/book/${book.id}`)">
          <img :src="getImg(book.shujifengmian)" class="book-img" />
          <div class="book-info">
            <div class="book-name">{{ book.shujimingcheng }}</div>
            <div class="book-price">¥{{ book.price }}</div>
            <div class="book-meta">{{ book.shujizuozhe }} · {{ book.xinjiuchengdu }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-pagination v-if="total > 0" style="margin-top:16px;justify-content:center" background
      layout="prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="loadData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/utils/http'

const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 12
const search = ref({ shujimingcheng: '', shujifenlei: '' })
const categories = ref([])
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const loadData = async () => {
  const params = { page: page.value, limit: pageSize, sort: 'addtime', order: 'desc' }
  if (search.value.shujimingcheng) params.shujimingcheng = search.value.shujimingcheng
  if (search.value.shujifenlei) params.shujifenlei = search.value.shujifenlei
  const res = await http.get('/ershoushuji/list', { params })
  list.value = res.data?.data?.list || []
  total.value = res.data?.data?.total || 0
}

onMounted(async () => {
  loadData()
  const res = await http.get('/option/shujifenlei/shujifenlei')
  categories.value = res.data?.data || []
})
</script>

<style scoped>
.filter-card { margin-bottom: 8px; }
.book-card { cursor: pointer; margin-bottom: 16px; }
.book-card:hover { transform: translateY(-2px); transition: .2s; }
.book-img { width: 100%; height: 180px; object-fit: cover; border-radius: 4px; }
.book-info { padding: 8px 0; }
.book-name { font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.book-price { color: #f56c6c; font-size: 16px; font-weight: bold; margin-top: 4px; }
.book-meta { color: #999; font-size: 12px; margin-top: 4px; }
</style>
