<template>
  <div>
    <el-card>
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:18px;font-weight:bold">地址管理</span>
          <el-button type="primary" @click="openForm()">新增地址</el-button>
        </div>
      </template>
      <el-table :data="list">
        <el-table-column label="收货人" prop="name" width="120" />
        <el-table-column label="电话" prop="phone" width="140" />
        <el-table-column label="地址" prop="address" />
        <el-table-column label="默认" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isdefault==='是'" type="warning">默认</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button text type="primary" @click="openForm(row)">编辑</el-button>
            <el-button text type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="showForm" :title="form.id ? '编辑地址' : '新增地址'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="收货人"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="默认地址"><el-switch v-model="form.isdefault" active-value="是" inactive-value="否" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const list = ref([])
const showForm = ref(false)
const form = ref({ name: '', phone: '', address: '', isdefault: '否' })

const loadData = async () => {
  const res = await http.get('/address/list', { params: { page: 1, limit: 100 } })
  list.value = res.data?.data?.list || []
}

const openForm = (row) => {
  form.value = row ? { ...row } : { name: '', phone: '', address: '', isdefault: '否' }
  showForm.value = true
}

const save = async () => {
  if (!form.value.name || !form.value.phone || !form.value.address) return ElMessage.warning('请填写完整')
  const url = form.value.id ? '/address/update' : '/address/save'
  await http.post(url, form.value)
  showForm.value = false
  ElMessage.success('保存成功')
  loadData()
}

const del = async (row) => {
  await ElMessageBox.confirm('确定删除？', '提示')
  await http.post('/address/delete', [row.id])
  ElMessage.success('已删除')
  loadData()
}

onMounted(loadData)
</script>
