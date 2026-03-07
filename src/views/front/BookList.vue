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
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.result-info {
  padding: 12px 0;
  color: #666;
  font-size: 14px;
}

.result-info strong {
  color: #409eff;
  font-size: 16px;
}

.book-card-skeleton {
  margin-bottom: 16px;
}

.book-card {
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.book-img-wrapper {
  position: relative;
  overflow: hidden;
}

.book-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.3s ease;
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
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-weight: 700;
}

.book-info {
  padding: 12px 0;
}

.book-name {
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  color: #999;
  font-size: 13px;
  margin-bottom: 8px;
}

.book-path {
  min-height: 38px;
  margin-bottom: 8px;
  color: #606266;
  font-size: 12px;
  line-height: 1.5;
}

.book-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 700;
  margin: 8px 0;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.condition {
  color: #999;
  font-size: 12px;
}

.book-stock {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.stock-good {
  color: #67c23a;
}

.stock-low {
  color: #e6a23c;
}

.stock-out {
  color: #f56c6c;
}
</style>
