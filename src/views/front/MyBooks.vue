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
        <el-form-item label="书籍名称">
          <el-input v-model="searchForm.shujimingcheng" placeholder="请输入书籍名称" clearable />
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
        <el-table-column prop="shujimingcheng" label="书籍名称" min-width="180" />
        <el-table-column prop="isbn" label="ISBN" min-width="140" />
        <el-table-column label="专业路径" min-width="240">
          <template #default="{ row }">
            {{ resolveHierarchyPath(row) || '未标注' }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="kucun" label="库存" width="80" />
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
        <el-form-item label="书籍编号"><el-input v-model="form.shujibianhao" /></el-form-item>
        <el-form-item label="书籍名称"><el-input v-model="form.shujimingcheng" /></el-form-item>
        <el-form-item label="封面"><FileUpload v-model="form.shujifengmian" /></el-form-item>
        <el-form-item label="作者"><el-input v-model="form.shujizuozhe" /></el-form-item>
        <el-form-item label="ISBN"><el-input v-model="form.isbn" /></el-form-item>
        <el-form-item label="课程编号"><el-input v-model="form.kechengbianhao" /></el-form-item>
        <el-form-item label="教材版本"><el-input v-model="form.jiaocaibanben" /></el-form-item>
        <el-form-item label="适用专业"><el-input v-model="form.shiyongzhuanye" /></el-form-item>
        <el-form-item label="适用课程"><el-input v-model="form.shiyongkecheng" /></el-form-item>
        <el-form-item label="书籍分类">
          <el-input v-model="form.shujifenlei" />
        </el-form-item>
        <el-form-item label="学院">
          <el-select v-model="form.xueyuan" placeholder="请选择学院" @change="handleCollegeChange">
            <el-option v-for="college in colleges" :key="college" :label="college" :value="college" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="form.zhuanye" placeholder="请选择专业" @change="handleMajorChange">
            <el-option v-for="major in majors" :key="major" :label="major" :value="major" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="form.kecheng" placeholder="请选择课程" @change="handleCourseChange">
            <el-option v-for="course in courses" :key="course" :label="course" :value="course" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本">
          <el-select v-model="form.banben" placeholder="请选择版本">
            <el-option v-for="version in versions" :key="version" :label="version" :value="version" />
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度">
          <el-select v-model="form.xinjiuchengdu">
            <el-option label="全新" value="全新" />
            <el-option label="九成新" value="九成新" />
            <el-option label="八成新" value="八成新" />
            <el-option label="七成新" value="七成新" />
          </el-select>
        </el-form-item>
        <el-form-item label="出版社"><el-input v-model="form.chubanshe" /></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="form.kucun" :min="0" :step="1" /></el-form-item>
        <el-form-item label="简介"><el-input v-model="form.shujijianjie" type="textarea" :rows="4" /></el-form-item>
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
const searchForm = reactive({ shujimingcheng: '', isbn: '' })
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
  shujibianhao: '',
  shujimingcheng: '',
  shujifengmian: '',
  shujizuozhe: '',
  isbn: '',
  kechengbianhao: '',
  jiaocaibanben: '',
  shiyongzhuanye: '',
  shiyongkecheng: '',
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

const loadData = async () => {
  const { data: res } = await http.get('/ershoushuji/page', {
    params: { ...searchForm, myPublished: 1, page: page.value, limit: 10 },
  })
  list.value = res.data?.list || []
  total.value = res.data?.total || 0
}

const resetSearch = () => {
  searchForm.shujimingcheng = ''
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
  const requiredFields = [
    ['shujimingcheng', '书籍名称'],
    ['isbn', 'ISBN'],
    ['kechengbianhao', '课程编号'],
    ['jiaocaibanben', '教材版本'],
    ['shiyongzhuanye', '适用专业'],
    ['shiyongkecheng', '适用课程'],
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

const saveBook = async () => {
  if (!validateForm()) return
  const url = isEdit.value ? '/ershoushuji/update' : '/ershoushuji/save'
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
  const { data: res } = await http.post('/ershoushuji/delete', [row.id])
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

onMounted(loadData)
</script>
