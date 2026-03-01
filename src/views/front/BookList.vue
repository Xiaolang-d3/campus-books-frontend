<template>
  <div class="book-list-container">
    <!-- 搜索筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="书名">
          <el-input
            v-model="search.shujimingcheng"
            placeholder="搜索书名、作者"
            clearable
            @clear="loadData"
            @keyup.enter="loadData"
            style="width: 200px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="search.shujifenlei"
            placeholder="全部分类"
            clearable
            @change="loadData"
            style="width: 150px"
          >
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="sortType" @change="loadData" style="width: 150px">
            <el-option label="最新上架" value="addtime" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
            <el-option label="热度最高" value="clicknum" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData" :loading="loading">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 结果统计 -->
    <div class="result-info" v-if="!loading">
      <span>共找到 <strong>{{ total }}</strong> 本书籍</span>
    </div>

    <!-- 书籍列表 -->
    <el-skeleton :loading="loading" animated :count="8">
      <template #template>
        <el-row :gutter="16" style="margin-top:16px">
          <el-col :xs="12" :sm="8" :md="6" v-for="i in 8" :key="i">
            <el-card class="book-card-skeleton">
              <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
              <div style="padding: 12px 0">
                <el-skeleton-item variant="text" style="width: 80%" />
                <el-skeleton-item variant="text" style="width: 40%; margin-top: 8px" />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <template #default>
        <el-empty v-if="!list.length" description="暂无书籍数据" />
        <el-row :gutter="16" style="margin-top:16px" v-else>
          <el-col :xs="12" :sm="8" :md="6" v-for="book in list" :key="book.id">
            <el-card
              shadow="hover"
              class="book-card"
              @click="$router.push(`/front/book/${book.id}`)"
            >
              <div class="book-img-wrapper">
                <img :src="getImg(book.shujifengmian)" class="book-img" loading="lazy" />
                <div class="book-overlay" v-if="!book.kucun || book.kucun <= 0">
                  <span>已售罄</span>
                </div>
                <div class="book-badge hot" v-else-if="book.clicknum > 100">
                  <el-icon><TrendCharts /></el-icon> 热销
                </div>
              </div>
              <div class="book-info">
                <div class="book-name" :title="book.shujimingcheng">
                  {{ book.shujimingcheng }}
                </div>
                <div class="book-author">{{ book.shujizuozhe }}</div>
                <div class="book-price">¥{{ book.price }}</div>
                <div class="book-meta">
                  <el-tag size="small" effect="plain">{{ book.shujifenlei }}</el-tag>
                  <span class="condition">{{ book.xinjiuchengdu }}</span>
                </div>
                <div class="book-stock">
                  <span v-if="book.kucun > 10" class="stock-good">
                    <el-icon><CircleCheck /></el-icon> 库存充足
                  </span>
                  <span v-else-if="book.kucun > 0" class="stock-low">
                    <el-icon><Warning /></el-icon> 仅剩{{ book.kucun }}件
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

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0 && !loading"
      style="margin-top:24px;justify-content:center"
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
import { ref, onMounted } from 'vue'
import { Search, TrendCharts, CircleCheck, Warning, CircleClose } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 12
const search = ref({ shujimingcheng: '', shujifenlei: '' })
const sortType = ref('addtime')
const categories = ref([])
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, limit: pageSize }

    // 排序处理
    if (sortType.value === 'price_asc') {
      params.sort = 'price'
      params.order = 'asc'
    } else if (sortType.value === 'price_desc') {
      params.sort = 'price'
      params.order = 'desc'
    } else if (sortType.value === 'clicknum') {
      params.sort = 'clicknum'
      params.order = 'desc'
    } else {
      params.sort = 'addtime'
      params.order = 'desc'
    }

    if (search.value.shujimingcheng) params.shujimingcheng = search.value.shujimingcheng
    if (search.value.shujifenlei) params.shujifenlei = search.value.shujifenlei

    const res = await http.get('/ershoushuji/list', { params })
    list.value = res.data?.data?.list || []
    total.value = res.data?.data?.total || 0

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    ElMessage.error('加载数据失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loadData()
  try {
    const res = await http.get('/option/shujifenlei/shujifenlei')
    categories.value = res.data?.data || []
  } catch (e) {
    console.error(e)
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
  box-shadow: 0 8px 16px rgba(0,0,0,.1);
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.book-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 152, 0, 0.9);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
}

.book-info {
  padding: 12px 0;
}

.book-name {
  font-weight: bold;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.book-author {
  color: #999;
  font-size: 13px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin: 8px 0;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.book-meta .condition {
  color: #999;
  font-size: 12px;
}

.book-stock {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stock-good {
  color: #67c23a;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stock-low {
  color: #e6a23c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stock-out {
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-card :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  .book-img {
    height: 180px;
  }

  .book-name {
    font-size: 14px;
  }

  .book-price {
    font-size: 16px;
  }
}
</style>
