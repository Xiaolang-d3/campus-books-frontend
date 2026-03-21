<template>
  <div class="book-list-container">
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="书名">
          <el-input
            v-model="search.shujimingcheng"
            placeholder="搜索书名、作者"
            clearable
            @clear="loadData"
            @keyup.enter="loadData"
            style="width: 220px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input
            v-model="search.isbn"
            placeholder="搜索 ISBN"
            clearable
            @clear="loadData"
            @keyup.enter="loadData"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="课程编号">
          <el-input
            v-model="search.kechengbianhao"
            placeholder="搜索课程编号"
            clearable
            @clear="loadData"
            @keyup.enter="loadData"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="search.shujifenlei" placeholder="全部分类" clearable @change="loadData" style="width: 150px">
            <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
          </el-select>
        </el-form-item>
        <el-form-item label="学院">
          <el-select v-model="search.xueyuan" placeholder="全部学院" clearable @change="handleCollegeChange" style="width: 150px">
            <el-option v-for="college in colleges" :key="college" :label="college" :value="college" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="search.zhuanye" placeholder="全部专业" clearable @change="handleMajorChange" style="width: 160px">
            <el-option v-for="major in majors" :key="major" :label="major" :value="major" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="search.kecheng" placeholder="全部课程" clearable @change="handleCourseChange" style="width: 180px">
            <el-option v-for="course in courses" :key="course" :label="course" :value="course" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本">
          <el-select v-model="search.banben" placeholder="全部版本" clearable @change="loadData" style="width: 160px">
            <el-option v-for="version in versions" :key="version" :label="version" :value="version" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="sortType" @change="loadData" style="width: 150px">
            <el-option label="最新上架" value="addtime" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="result-info" v-if="!loading">
      共找到 <strong>{{ total }}</strong> 本专业书籍
    </div>

    <el-skeleton :loading="loading" animated :count="8">
      <template #template>
        <el-row :gutter="16" style="margin-top: 16px">
          <el-col :xs="12" :sm="8" :md="6" v-for="item in 8" :key="item">
            <el-card class="book-card-skeleton">
              <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
              <div style="padding: 12px 0">
                <el-skeleton-item variant="text" style="width: 80%" />
                <el-skeleton-item variant="text" style="width: 50%; margin-top: 8px" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <template #default>
        <el-empty v-if="!list.length" description="暂无书籍数据" />
        <el-row v-else :gutter="16" style="margin-top: 16px">
          <el-col :xs="12" :sm="8" :md="6" v-for="book in list" :key="book.id">
            <el-card class="book-card" shadow="hover" @click="$router.push(`/front/book/${book.id}`)">
              <div class="book-img-wrapper">
                <img :src="getImg(book.shujifengmian)" class="book-img" loading="lazy" />
                <div class="book-overlay" v-if="!book.kucun || book.kucun <= 0">已售罄</div>
              </div>
              <div class="book-info">
                <div class="book-name" :title="book.shujimingcheng">{{ book.shujimingcheng }}</div>
                <div class="book-author">{{ book.shujizuozhe }}</div>
                <div class="book-path" :title="resolveHierarchyPath(book)">
                  {{ resolveHierarchyPath(book) || '未标注专业分类' }}
                </div>
                <div class="book-extra">
                  <span>ISBN {{ book.isbn || '-' }}</span>
                  <span>{{ book.kechengbianhao || '-' }}</span>
                </div>
                <div class="book-price">￥{{ book.price }}</div>
                <div class="book-meta">
                  <el-tag size="small" effect="plain">{{ book.shujifenlei }}</el-tag>
                  <span class="condition">{{ book.xinjiuchengdu }}</span>
                </div>
                <div class="book-stock">
                  <span v-if="book.kucun > 10" class="stock-good">
                    <el-icon><CircleCheck /></el-icon> 库存充足
                  </span>
                  <span v-else-if="book.kucun > 0" class="stock-low">
                    <el-icon><Warning /></el-icon> 仅剩 {{ book.kucun }} 件
                  </span>
                  <span v-else class="stock-out">
                    <el-icon><CircleClose /></el-icon> 已售罄
                  </span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>

    <el-pagination
      v-if="total > 0 && !loading"
      style="margin-top: 24px; justify-content: center"
      background
      layout="total, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      v-model:current-page="page"
      @current-change="loadData"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { CircleCheck, CircleClose, Search, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import { getColleges, getCourses, getMajors, getVersions, resolveHierarchyPath } from '@/utils/bookHierarchy'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 12
const sortType = ref('addtime')
const categories = ref([])
const colleges = getColleges()
const search = ref({
  shujimingcheng: '',
  isbn: '',
  kechengbianhao: '',
  shujifenlei: '',
  xueyuan: '',
  zhuanye: '',
  kecheng: '',
  banben: '',
})

const majors = computed(() => getMajors(search.value.xueyuan))
const courses = computed(() => getCourses(search.value.xueyuan, search.value.zhuanye))
const versions = computed(() => getVersions(search.value.xueyuan, search.value.zhuanye, search.value.kecheng))

const getImg = (value) => (value ? (value.startsWith('http') ? value : `/api/file/download/${value}`) : '')

const handleCollegeChange = () => {
  search.value.zhuanye = ''
  search.value.kecheng = ''
  search.value.banben = ''
  loadData()
}

const handleMajorChange = () => {
  search.value.kecheng = ''
  search.value.banben = ''
  loadData()
}

const handleCourseChange = () => {
  search.value.banben = ''
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      limit: pageSize,
      ...search.value,
    }

    if (sortType.value === 'price_asc') {
      params.sort = 'price'
      params.order = 'asc'
    } else if (sortType.value === 'price_desc') {
      params.sort = 'price'
      params.order = 'desc'
    } else {
      params.sort = 'addtime'
      params.order = 'desc'
    }

    const res = await http.get('/ershoushuji/list', { params })
    list.value = res.data?.data?.list || []
    total.value = res.data?.data?.total || 0
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
  try {
    const res = await http.get('/option/shujifenlei/shujifenlei')
    categories.value = res.data?.data || []
  } catch {
    categories.value = []
  }
})
</script>

<style scoped>
.book-list-container {
  min-height: calc(100vh - 200px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.filter-card {
  margin-bottom: 32px;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  box-shadow: none;
}

.filter-card :deep(.el-card__body) {
  padding: 24px;
}

.filter-card :deep(.el-form-item__label) {
  color: #737373;
  font-size: 13px;
  font-weight: 500;
}

.filter-card :deep(.el-input__wrapper) {
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid transparent;
  box-shadow: none;
}

.filter-card :deep(.el-input__wrapper:hover) {
  background: #fff;
  border-color: #e5e5e5;
}

.filter-card :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: #0a0a0a;
}

.filter-card :deep(.el-button--primary) {
  background: #0a0a0a;
  border-color: #0a0a0a;
}

.filter-card :deep(.el-button--primary:hover) {
  background: #2a2a2a;
  border-color: #2a2a2a;
}

.result-info {
  padding: 16px 0;
  color: #737373;
  font-size: 14px;
  letter-spacing: 0.01em;
}

.result-info strong {
  color: #0a0a0a;
  font-size: 18px;
  font-weight: 600;
}

.book-card-skeleton {
  margin-bottom: 24px;
}

.book-card {
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e5e5e5;
  box-shadow: none;
}

.book-card:hover {
  transform: translateY(-4px);
  border-color: #d4d4d4;
}

.book-img-wrapper {
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.book-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  transition: transform 0.3s;
}

.book-card:hover .book-img {
  transform: scale(1.05);
}

.book-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.05em;
}

.book-info {
  padding: 16px;
}

.book-name {
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #0a0a0a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.book-author {
  color: #737373;
  font-size: 13px;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-path {
  min-height: 38px;
  margin-bottom: 10px;
  color: #737373;
  font-size: 12px;
  line-height: 1.5;
}

.book-extra {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
  color: #a3a3a3;
  font-size: 11px;
}

.book-price {
  color: #0a0a0a;
  font-size: 20px;
  font-weight: 600;
  margin: 10px 0;
  letter-spacing: -0.01em;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.book-meta :deep(.el-tag) {
  background: #fafafa;
  border-color: #e5e5e5;
  color: #737373;
  border-radius: 2px;
  font-size: 11px;
}

.condition {
  color: #a3a3a3;
  font-size: 12px;
}

.book-stock {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.stock-good {
  color: #059669;
}

.stock-low {
  color: #f59e0b;
}

.stock-out {
  color: #dc2626;
}

:deep(.el-pagination) {
  justify-content: center;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background: #0a0a0a;
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  color: #0a0a0a;
}

@media (max-width: 768px) {
  .book-list-container {
    padding: 20px 16px;
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .book-img {
    height: 200px;
  }
}
</style>
