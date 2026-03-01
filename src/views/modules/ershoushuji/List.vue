<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="书籍名称"><el-input v-model="searchForm.shujimingcheng" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="书籍分类">
          <el-select v-model="searchForm.shujifenlei" placeholder="全部" clearable>
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openDialog()">新增</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" @selection-change="sel => selectedIds = sel.map(r=>r.id)" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="shujibianhao" label="书籍编号" />
        <el-table-column prop="shujimingcheng" label="书籍名称" />
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image v-if="row.shujifengmian" :src="getImg(row.shujifengmian)" style="width:60px;height:60px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="shujizuozhe" label="作者" />
        <el-table-column prop="shujifenlei" label="分类" />
        <el-table-column prop="xinjiuchengdu" label="新旧程度" width="100" />
        <el-table-column prop="price" label="价格" width="80" />
        <el-table-column prop="kucun" label="库存" width="80">
          <template #default="{ row }">
            <el-tag :type="row.kucun > 10 ? 'success' : row.kucun > 0 ? 'warning' : 'danger'">{{ row.kucun || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shangjiaxingming" label="商家" />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑书籍' : '新增书籍'" width="650px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="书籍编号"><el-input v-model="form.shujibianhao" /></el-form-item>
        <el-form-item label="书籍名称"><el-input v-model="form.shujimingcheng" /></el-form-item>
        <el-form-item label="书籍封面"><FileUpload v-model="form.shujifengmian" /></el-form-item>
        <el-form-item label="书籍作者"><el-input v-model="form.shujizuozhe" /></el-form-item>
        <el-form-item label="书籍分类">
          <el-select v-model="form.shujifenlei" placeholder="请选择">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度">
          <el-select v-model="form.xinjiuchengdu" placeholder="请选择">
            <el-option label="全新" value="全新" /><el-option label="九成新" value="九成新" />
            <el-option label="八成新" value="八成新" /><el-option label="七成新" value="七成新" />
          </el-select>
        </el-form-item>
        <el-form-item label="出版社"><el-input v-model="form.chubanshe" /></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="库存数量"><el-input-number v-model="form.kucun" :min="0" :step="1" /></el-form-item>
        <el-form-item label="书籍简介"><el-input v-model="form.shujijianjie" type="textarea" :rows="4" /></el-form-item>
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
import FileUpload from '@/components/FileUpload.vue'

const searchForm = reactive({ shujimingcheng: '', shujifenlei: '' })
const tableData = ref([]); const page = ref(1); const limit = ref(10); const total = ref(0)
const dialogVisible = ref(false); const isEdit = ref(false); const form = ref({}); const selectedIds = ref([])
const categories = ref([])
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const loadData = async () => {
  const { data: res } = await http.get('/ershoushuji/page', { params: { ...searchForm, page: page.value, limit: limit.value } })
  if (res.code === 0) { tableData.value = res.data.list; total.value = res.data.total }
}
const resetSearch = () => { Object.assign(searchForm, { shujimingcheng: '', shujifenlei: '' }); loadData() }
const openDialog = (row) => { isEdit.value = !!row; form.value = row ? { ...row } : { xinjiuchengdu: '全新', price: 0, kucun: 1 }; dialogVisible.value = true }
const handleSave = async () => {
  const url = isEdit.value ? '/ershoushuji/update' : '/ershoushuji/save'
  const { data: res } = await http.post(url, form.value)
  if (res.code === 0) { ElMessage.success('操作成功'); dialogVisible.value = false; loadData() } else ElMessage.error(res.msg)
}
const handleDelete = async (id) => { await ElMessageBox.confirm('确定删除？'); const { data: res } = await http.post('/ershoushuji/delete', [id]); if (res.code === 0) { ElMessage.success('删除成功'); loadData() } }
const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return ElMessage.warning('请选择数据')
  await ElMessageBox.confirm(`确定删除${selectedIds.value.length}条？`); const { data: res } = await http.post('/ershoushuji/delete', selectedIds.value); if (res.code === 0) { ElMessage.success('删除成功'); loadData() }
}
onMounted(async () => {
  loadData()
  try { const res = await http.get('/option/shujifenlei/shujifenlei'); categories.value = res.data?.data || [] } catch(e) {}
})
</script>
