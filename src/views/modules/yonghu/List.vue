<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="学号">
          <el-input v-model="searchForm.yonghuzhanghao" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.yonghuxingming" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="学院">
          <el-input v-model="searchForm.xueyuan" placeholder="请输入学院" clearable />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="searchForm.zhuanye" placeholder="请输入专业" clearable />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="searchForm.nianji" placeholder="请输入年级" clearable />
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
        <el-table-column prop="yonghuzhanghao" label="学号" min-width="120" />
        <el-table-column prop="yonghuxingming" label="姓名" min-width="120" />
        <el-table-column prop="xueyuan" label="学院" min-width="140" />
        <el-table-column prop="zhuanye" label="专业" min-width="140" />
        <el-table-column prop="nianji" label="年级" min-width="110" />
        <el-table-column prop="xingbie" label="性别" width="80" />
        <el-table-column prop="dianhuahaoma" label="电话号码" min-width="140" />
        <el-table-column prop="money" label="余额" width="100" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="学号">
          <el-input v-model="form.yonghuzhanghao" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.yonghuxingming" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.mima" type="password" show-password />
        </el-form-item>
        <el-form-item label="学院">
          <el-input v-model="form.xueyuan" />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="form.zhuanye" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="form.nianji" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.xingbie">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话号码">
          <el-input v-model="form.dianhuahaoma" />
        </el-form-item>
        <el-form-item label="余额">
          <el-input-number v-model="form.money" :min="0" />
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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const searchForm = reactive({
  yonghuzhanghao: '',
  yonghuxingming: '',
  xueyuan: '',
  zhuanye: '',
  nianji: '',
})
const tableData = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({})
const selectedIds = ref([])

const loadData = async () => {
  const { data: res } = await http.get('/yonghu/page', {
    params: { ...searchForm, page: page.value, limit: limit.value },
  })
  if (res.code === 0) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

const resetSearch = () => {
  Object.assign(searchForm, {
    yonghuzhanghao: '',
    yonghuxingming: '',
    xueyuan: '',
    zhuanye: '',
    nianji: '',
  })
  loadData()
}

const openDialog = (row) => {
  isEdit.value = !!row
  form.value = row
    ? { ...row }
    : {
        yonghuzhanghao: '',
        yonghuxingming: '',
        mima: '123456',
        xueyuan: '',
        zhuanye: '',
        nianji: '',
        xingbie: '男',
        dianhuahaoma: '',
        money: 0,
      }
  dialogVisible.value = true
}

const validateForm = () => {
  if (!form.value.yonghuzhanghao || !form.value.yonghuxingming || !form.value.mima) {
    ElMessage.error('请完整填写学号、姓名和密码')
    return false
  }
  if (!form.value.xueyuan || !form.value.zhuanye || !form.value.nianji) {
    ElMessage.error('请完整填写学院、专业和年级')
    return false
  }
  return true
}

const handleSave = async () => {
  if (!validateForm()) return
  const url = isEdit.value ? '/yonghu/update' : '/yonghu/save'
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
  await ElMessageBox.confirm('确定删除该用户吗？', '提示')
  const { data: res } = await http.post('/yonghu/delete', [id])
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
    ElMessage.warning('请选择要删除的数据')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条数据吗？`, '提示')
  const { data: res } = await http.post('/yonghu/delete', selectedIds.value)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    loadData()
  }
}

onMounted(loadData)
</script>
