<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-size: 18px; font-weight: 700">我的发布</span>
          <el-button type="primary" @click="openDialog()">发布书籍</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="书名">
          <el-input v-model="searchForm.title" placeholder="请输入书名" clearable />
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="searchForm.isbn" placeholder="请输入ISBN" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" border>
        <el-table-column prop="title" label="书籍名称" min-width="180" />
        <el-table-column prop="isbn" label="ISBN" min-width="140" />
        <el-table-column label="作者" min-width="120">
          <template #default="{ row }">{{ row.author || '-' }}</template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeBook(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        style="margin-top: 16px; justify-content: center"
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="10"
        v-model:current-page="page"
        @current-change="loadData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑书籍' : '发布书籍'" width="760px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="书名"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="封面"><FileUpload v-model="form.cover" /></el-form-item>
        <el-form-item label="作者"><el-input v-model="form.author" /></el-form-item>
        <el-form-item label="ISBN"><el-input v-model="form.isbn" /></el-form-item>
        <el-form-item label="出版社"><el-input v-model="form.publisher" /></el-form-item>
        <el-form-item label="书籍分类">
          <el-input v-model="form.category_name" />
        </el-form-item>
        <el-form-item label="新旧程度">
          <el-select v-model="form.condition_name">
            <el-option label="全新" value="全新" />
            <el-option label="九成新" value="九成新" />
            <el-option label="八成新" value="八成新" />
            <el-option label="七成新" value="七成新" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="原价"><el-input-number v-model="form.original_price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" :step="1" /></el-form-item>
        <el-form-item label="简介"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBook">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import http from '@/utils/http'
import { getColleges, getCourses, getMajors, getVersions, resolveHierarchyPath } from '@/utils/bookHierarchy'

const colleges = getColleges()
const searchForm = reactive({ title: '', isbn: '' })
const list = ref([])
const page = ref(1)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({})

const majors = computed(() => getMajors(form.value.xueyuan))
const courses = computed(() => getCourses(form.value.xueyuan, form.value.zhuanye))
const versions = computed(() => getVersions(form.value.xueyuan, form.value.zhuanye, form.value.kecheng))

const buildDefaultForm = () => ({
  title: '',
  cover: '',
  author: '',
  isbn: '',
  publisher: '',
  category_name: '',
  condition_name: '全新',
  price: 0,
  original_price: 0,
  stock: 1,
  description: '',
})

const loadData = async () => {
    const { data: res } = await http.get('/book/page', {
    params: { ...searchForm, myPublished: 1, page: page.value, limit: 10 },
  })
  list.value = res.data?.data?.list || []
  total.value = res.data?.data?.total || 0
}

const resetSearch = () => {
  searchForm.title = ''
  searchForm.isbn = ''
  loadData()
}

const handleCollegeChange = () => {
  form.value.zhuanye = ''
  form.value.kecheng = ''
  form.value.banben = ''
}

const handleMajorChange = () => {
  form.value.kecheng = ''
  form.value.banben = ''
}

const handleCourseChange = () => {
  form.value.banben = ''
}

const openDialog = (row) => {
  isEdit.value = !!row
  form.value = row ? { ...row } : buildDefaultForm()
  dialogVisible.value = true
}

const validateForm = () => {
  if (!form.value.title) {
    ElMessage.error('书名不能为空')
    return false
  }
  if (!form.value.isbn) {
    ElMessage.error('ISBN不能为空')
    return false
  }
  return true
}

const saveBook = async () => {
  if (!validateForm()) return
  const url = isEdit.value ? '/book/update' : '/book/save'
  const { data: res } = await http.post(url, form.value)
  if (res.code === 0) {
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const removeBook = async (row) => {
  await ElMessageBox.confirm('确定删除这本书吗？', '提示')
  const { data: res } = await http.post('/book/delete', [row.id])
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

onMounted(loadData)
</script>
