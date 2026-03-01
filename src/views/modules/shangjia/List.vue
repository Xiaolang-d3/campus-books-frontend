<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="账号"><el-input v-model="searchForm.shangjiazhanghao" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="searchForm.shangjiaxingming" placeholder="请输入" clearable /></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="Object.assign(searchForm, { shangjiazhanghao: '', shangjiaxingming: '' }); loadData()">重置</el-button>
          <el-button type="success" @click="openDialog()">新增</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" @selection-change="sel => selectedIds = sel.map(r=>r.id)" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="shangjiazhanghao" label="商家账号" />
        <el-table-column prop="shangjiaxingming" label="商家姓名" />
        <el-table-column prop="xingbie" label="性别" width="80" />
        <el-table-column prop="dianhuahaoma" label="电话号码" />
        <el-table-column prop="money" label="余额" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination style="margin-top:16px;justify-content:flex-end" v-model:current-page="page"
        v-model:page-size="limit" :total="total" :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next" @change="loadData" />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑' : '新增'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="商家账号"><el-input v-model="form.shangjiazhanghao" :disabled="isEdit" /></el-form-item>
        <el-form-item label="商家姓名"><el-input v-model="form.shangjiaxingming" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.mima" type="password" show-password /></el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.xingbie"><el-radio value="男">男</el-radio><el-radio value="女">女</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="电话号码"><el-input v-model="form.dianhuahaoma" /></el-form-item>
        <el-form-item label="余额"><el-input-number v-model="form.money" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const searchForm = reactive({ shangjiazhanghao: '', shangjiaxingming: '' })
const tableData = ref([]); const page = ref(1); const limit = ref(10); const total = ref(0)
const dialogVisible = ref(false); const isEdit = ref(false); const form = ref({}); const selectedIds = ref([])

const loadData = async () => {
  const { data: res } = await http.get('/shangjia/page', { params: { ...searchForm, page: page.value, limit: limit.value } })
  if (res.code === 0) { tableData.value = res.data.list; total.value = res.data.total }
}
const openDialog = (row) => { isEdit.value = !!row; form.value = row ? { ...row } : { xingbie: '男', money: 0, mima: '123456' }; dialogVisible.value = true }
const handleSave = async () => {
  const { data: res } = await http.post(isEdit.value ? '/shangjia/update' : '/shangjia/save', form.value)
  if (res.code === 0) { ElMessage.success('操作成功'); dialogVisible.value = false; loadData() } else ElMessage.error(res.msg)
}
const handleDelete = async (id) => { await ElMessageBox.confirm('确定删除？'); const { data: res } = await http.post('/shangjia/delete', [id]); if (res.code === 0) { ElMessage.success('删除成功'); loadData() } }
const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return ElMessage.warning('请选择数据')
  await ElMessageBox.confirm(`确定删除${selectedIds.value.length}条？`); const { data: res } = await http.post('/shangjia/delete', selectedIds.value); if (res.code === 0) { ElMessage.success('删除成功'); loadData() }
}
onMounted(loadData)
</script>
