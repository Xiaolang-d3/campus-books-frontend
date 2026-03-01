<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单编号"><el-input v-model="searchForm.orderid" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="商品名称"><el-input v-model="searchForm.goodname" placeholder="请输入" clearable /></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" @selection-change="sel => selectedIds = sel.map(r=>r.id)" border stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="orderid" label="订单编号" />
        <el-table-column prop="goodname" label="商品名称" />
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image v-if="row.picture" :src="`/api/file/download/${row.picture}`" style="width:50px;height:50px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="buynumber" label="数量" width="70" />
        <el-table-column prop="price" label="单价" width="80" />
        <el-table-column prop="total" label="总价" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="consignee" label="收货人" width="100" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status==='未支付'" size="small" type="success" @click="changeStatus(row, '已支付')">支付</el-button>
            <el-button v-if="row.status==='已支付'" size="small" type="warning" @click="changeStatus(row, '已发货')">发货</el-button>
            <el-button v-if="row.status==='已发货'" size="small" type="primary" @click="changeStatus(row, '已完成')">确认收货</el-button>
            <el-button v-if="row.status==='已支付'||row.status==='已发货'" size="small" type="info" @click="changeStatus(row, '已退款')">退款</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination style="margin-top:16px;justify-content:flex-end" v-model:current-page="page"
        v-model:page-size="limit" :total="total" :page-sizes="[10,20,50]"
        layout="total, sizes, prev, pager, next" @change="loadData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const route = useRoute()
const searchForm = reactive({ orderid: '', goodname: '' })
const tableData = ref([]); const page = ref(1); const limit = ref(10); const total = ref(0); const selectedIds = ref([])

const statusType = (s) => ({ '未支付': 'danger', '已支付': 'warning', '已发货': '', '已完成': 'success', '已退款': 'info' }[s] || '')

const loadData = async () => {
  const status = route.params.status || ''
  const { data: res } = await http.get('/orders/page', { params: { ...searchForm, status, page: page.value, limit: limit.value } })
  if (res.code === 0) { tableData.value = res.data.list; total.value = res.data.total }
}

const resetSearch = () => { Object.assign(searchForm, { orderid: '', goodname: '' }); loadData() }

const changeStatus = async (row, status) => {
  await ElMessageBox.confirm(`确定将订单状态改为"${status}"？`)
  const { data: res } = await http.post('/orders/update', { ...row, status })
  if (res.code === 0) { ElMessage.success('操作成功'); loadData() }
}

const handleDelete = async (id) => { await ElMessageBox.confirm('确定删除？'); const { data: res } = await http.post('/orders/delete', [id]); if (res.code === 0) { ElMessage.success('删除成功'); loadData() } }
const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return ElMessage.warning('请选择数据')
  await ElMessageBox.confirm(`确定删除${selectedIds.value.length}条？`); const { data: res } = await http.post('/orders/delete', selectedIds.value); if (res.code === 0) { ElMessage.success('删除成功'); loadData() }
}

watch(() => route.params.status, loadData)
onMounted(loadData)
</script>
