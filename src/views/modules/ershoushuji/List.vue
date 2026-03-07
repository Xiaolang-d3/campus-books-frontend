<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="书籍名称">
          <el-input v-model="searchForm.shujimingcheng" placeholder="请输入书籍名称" clearable />
        </el-form-item>
        <el-form-item label="书籍分类">
          <el-select v-model="searchForm.shujifenlei" placeholder="全部" clearable>
            <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
          </el-select>
        </el-form-item>
        <el-form-item label="学院">
          <el-select v-model="searchForm.xueyuan" placeholder="全部" clearable @change="handleSearchCollegeChange">
            <el-option v-for="college in colleges" :key="college" :label="college" :value="college" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="searchForm.zhuanye" placeholder="全部" clearable @change="handleSearchMajorChange">
            <el-option v-for="major in searchMajors" :key="major" :label="major" :value="major" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="searchForm.kecheng" placeholder="全部" clearable @change="handleSearchCourseChange">
            <el-option v-for="course in searchCourses" :key="course" :label="course" :value="course" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本">
          <el-select v-model="searchForm.banben" placeholder="全部" clearable>
            <el-option v-for="version in searchVersions" :key="version" :label="version" :value="version" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openDialog()">新增</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" @selection-change="handleSelectionChange" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="shujibianhao" label="书籍编号" min-width="120" />
        <el-table-column prop="shujimingcheng" label="书籍名称" min-width="180" />
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image v-if="row.shujifengmian" :src="getImg(row.shujifengmian)" style="width: 60px; height: 60px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="shujizuozhe" label="作者" min-width="120" />
        <el-table-column prop="shujifenlei" label="分类" min-width="100" />
        <el-table-column label="专业归属" min-width="240">
          <template #default="{ row }">
            <div>{{ row.xueyuan || '-' }}</div>
            <div style="color: #909399">{{ row.zhuanye || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="课程版本" min-width="220">
          <template #default="{ row }">
            <div>{{ row.kecheng || '-' }}</div>
            <div style="color: #909399">{{ row.banben || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="xinjiuchengdu" label="新旧程度" width="100" />
        <el-table-column prop="price" label="价格" width="90" />
        <el-table-column prop="kucun" label="库存" width="80">
          <template #default="{ row }">
            <el-tag :type="row.kucun > 10 ? 'success' : row.kucun > 0 ? 'warning' : 'danger'">
              {{ row.kucun || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shangjiaxingming" label="商家" min-width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 16px; justify-content: flex-end"
        v-model:current-page="page"
        v-model:page-size="limit"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="loadData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑书籍' : '新增书籍'" width="760px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="书籍编号">
          <el-input v-model="form.shujibianhao" />
        </el-form-item>
        <el-form-item label="书籍名称">
          <el-input v-model="form.shujimingcheng" />
        </el-form-item>
        <el-form-item label="书籍封面">
          <FileUpload v-model="form.shujifengmian" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.shujizuozhe" />
        </el-form-item>
        <el-form-item label="书籍分类">
          <el-select v-model="form.shujifenlei" placeholder="请选择">
            <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
          </el-select>
        </el-form-item>
        <el-form-item label="学院">
          <el-select v-model="form.xueyuan" placeholder="请选择学院" @change="handleFormCollegeChange">
            <el-option v-for="college in colleges" :key="college" :label="college" :value="college" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="form.zhuanye" placeholder="请选择专业" @change="handleFormMajorChange">
            <el-option v-for="major in formMajors" :key="major" :label="major" :value="major" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="form.kecheng" placeholder="请选择课程" @change="handleFormCourseChange">
            <el-option v-for="course in formCourses" :key="course" :label="course" :value="course" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本">
          <el-select v-model="form.banben" placeholder="请选择版本">
            <el-option v-for="version in formVersions" :key="version" :label="version" :value="version" />
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度">
          <el-select v-model="form.xinjiuchengdu" placeholder="请选择">
            <el-option label="全新" value="全新" />
            <el-option label="九成新" value="九成新" />
            <el-option label="八成新" value="八成新" />
            <el-option label="七成新" value="七成新" />
          </el-select>
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="form.chubanshe" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number v-model="form.kucun" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="书籍简介">
          <el-input v-model="form.shujijianjie" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import http from '@/utils/http'
import { getColleges, getCourses, getMajors, getVersions } from '@/utils/bookHierarchy'

const categories = ref([])
const colleges = getColleges()
const searchForm = reactive({
  shujimingcheng: '',
  shujifenlei: '',
  xueyuan: '',
  zhuanye: '',
  kecheng: '',
  banben: '',
})
const searchMajors = computed(() => getMajors(searchForm.xueyuan))
const searchCourses = computed(() => getCourses(searchForm.xueyuan, searchForm.zhuanye))
const searchVersions = computed(() => getVersions(searchForm.xueyuan, searchForm.zhuanye, searchForm.kecheng))

const tableData = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const selectedIds = ref([])
const form = ref({})
const formMajors = computed(() => getMajors(form.value.xueyuan))
const formCourses = computed(() => getCourses(form.value.xueyuan, form.value.zhuanye))
const formVersions = computed(() => getVersions(form.value.xueyuan, form.value.zhuanye, form.value.kecheng))

const getImg = (value) => (value ? (value.startsWith('http') ? value : `/api/file/download/${value}`) : '')

const loadData = async () => {
  const { data: res } = await http.get('/ershoushuji/page', {
    params: { ...searchForm, page: page.value, limit: limit.value },
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    shujimingcheng: '',
    shujifenlei: '',
    xueyuan: '',
    zhuanye: '',
    kecheng: '',
    banben: '',
  })
  loadData()
}

const handleSearchCollegeChange = () => {
  searchForm.zhuanye = ''
  searchForm.kecheng = ''
  searchForm.banben = ''
}

const handleSearchMajorChange = () => {
  searchForm.kecheng = ''
  searchForm.banben = ''
}

const handleSearchCourseChange = () => {
  searchForm.banben = ''
}

const handleFormCollegeChange = () => {
  form.value.zhuanye = ''
  form.value.kecheng = ''
  form.value.banben = ''
}

const handleFormMajorChange = () => {
  form.value.kecheng = ''
  form.value.banben = ''
}

const handleFormCourseChange = () => {
  form.value.banben = ''
}

const createDefaultForm = () => ({
  shujibianhao: '',
  shujimingcheng: '',
  shujifengmian: '',
  shujizuozhe: '',
  shujifenlei: '',
  xueyuan: '',
  zhuanye: '',
  kecheng: '',
  banben: '',
  xinjiuchengdu: '全新',
  chubanshe: '',
  price: 0,
  kucun: 1,
  shujijianjie: '',
})

const openDialog = (row) => {
  isEdit.value = !!row
  form.value = row ? { ...row } : createDefaultForm()
  dialogVisible.value = true
}

const validateForm = () => {
  const requiredFields = [
    ['shujimingcheng', '书籍名称'],
    ['shujifenlei', '书籍分类'],
    ['xueyuan', '学院'],
    ['zhuanye', '专业'],
    ['kecheng', '课程'],
    ['banben', '版本'],
  ]
  for (const [field, label] of requiredFields) {
    if (!form.value[field]) {
      ElMessage.error(`${label}不能为空`)
      return false
    }
  }
  return true
}

const handleSave = async () => {
  if (!validateForm()) return
  const url = isEdit.value ? '/ershoushuji/update' : '/ershoushuji/save'
  const { data: res } = await http.post(url, form.value)
  if (res.code === 0) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } else {
    ElMessage.error(res.msg)
  }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除这本书吗？', '提示')
  const { data: res } = await http.post('/ershoushuji/delete', [id])
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(row => row.id)
}

const handleBatchDelete = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择数据')
    return
  }
  await ElMessageBox.confirm(`确定删除 ${selectedIds.value.length} 本书吗？`, '提示')
  const { data: res } = await http.post('/ershoushuji/delete', selectedIds.value)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

onMounted(async () => {
  loadData()
  try {
    const res = await http.get('/option/shujifenlei/shujifenlei')
    categories.value = res.data?.data || []
  } catch {
    categories.value = []
  }
})
</script>
