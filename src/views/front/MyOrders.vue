<template>
  <div>
    <el-card>
      <template #header><span style="font-size:18px;font-weight:bold">我的订单</span></template>
      <el-tabs v-model="activeTab" @tab-change="loadData">
        <el-tab-pane label="全部" name="" />
        <el-tab-pane label="未支付" name="未支付" />
        <el-tab-pane label="已支付" name="已支付" />
        <el-tab-pane label="已发货" name="已发货" />
        <el-tab-pane label="已完成" name="已完成" />
        <el-tab-pane label="已退款" name="已退款" />
      </el-tabs>
      <el-table :data="list">
        <el-table-column label="订单号" prop="orderid" width="200" />
        <el-table-column label="商品" min-width="200">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:8px">
              <img :src="getImg(row.picture)" style="width:40px;height:40px;object-fit:cover;border-radius:4px" />
              <span>{{ row.goodname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="数量" prop="buynumber" width="70" />
        <el-table-column label="总价" width="100"><template #default="{ row }">¥{{ row.total }}</template></el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="row.status==='未支付'" type="primary" size="small" @click="pay(row)">支付</el-button>
            <el-button v-if="row.status==='未支付'" size="small" @click="cancel(row)">取消</el-button>
            <el-button v-if="row.status==='已发货'" type="success" size="small" @click="confirm(row)">确认收货</el-button>
            <el-button v-if="row.status==='已支付'" type="warning" size="small" @click="refund(row)">退款</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="total > 0" style="margin-top:16px;justify-content:center" background
        layout="prev, pager, next" :total="total" :page-size="10" v-model:current-page="page" @current-change="loadData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const list = ref([])
const total = ref(0)
const page = ref(1)
const activeTab = ref('')
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''
const statusType = (s) => ({ '未支付': 'info', '已支付': 'primary', '已发货': 'warning', '已完成': 'success', '已退款': 'danger' }[s] || 'info')

const loadData = async () => {
  const params = { page: page.value, limit: 10 }
  if (activeTab.value) params.status = activeTab.value
  const res = await http.get('/orders/page', { params })
  list.value = res.data?.data?.list || []
  total.value = res.data?.data?.total || 0
}

const pay = async (row) => {
  await ElMessageBox.confirm(`确认支付 ¥${row.total}？`, '支付确认')
  await http.post('/orders/update', { id: row.id, status: '已支付' })
  ElMessage.success('支付成功')
  loadData()
}

const cancel = async (row) => {
  await ElMessageBox.confirm('确认取消订单？', '提示')
  await http.post('/orders/update', { id: row.id, status: '已退款' })
  ElMessage.success('已取消')
  loadData()
}

const confirm = async (row) => {
  await http.post('/orders/update', { id: row.id, status: '已完成' })
  ElMessage.success('已确认收货')
  loadData()
}

const refund = async (row) => {
  await ElMessageBox.confirm('确认申请退款？', '提示')
  await http.post('/orders/update', { id: row.id, status: '已退款' })
  ElMessage.success('退款成功')
  loadData()
}

onMounted(loadData)
</script>
