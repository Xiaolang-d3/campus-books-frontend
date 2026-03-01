<template>
  <div>
    <el-card>
      <template #header><span style="font-size:18px;font-weight:bold">我的购物车</span></template>
      <el-table :data="cartList" @selection-change="onSelect" ref="tableRef">
        <el-table-column type="selection" width="50" />
        <el-table-column label="商品" min-width="200">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:12px">
              <img :src="getImg(row.picture)" style="width:60px;height:60px;object-fit:cover;border-radius:4px" />
              <span>{{ row.goodname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="100">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="数量" width="160">
          <template #default="{ row }">
            <el-input-number v-model="row.buynumber" :min="1" :max="99" size="small" @change="updateQty(row)" />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="100">
          <template #default="{ row }">¥{{ (row.price * row.buynumber).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button text type="danger" @click="removeItem(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="cartList.length === 0" style="text-align:center;padding:40px;color:#999">购物车是空的</div>
    </el-card>
    <el-card style="margin-top:16px" v-if="cartList.length">
      <div style="display:flex;justify-content:flex-end;align-items:center;gap:20px">
        <span>已选 <b>{{ selected.length }}</b> 件</span>
        <span style="font-size:20px;color:#f56c6c;font-weight:bold">合计：¥{{ totalPrice }}</span>
        <el-button type="danger" size="large" :disabled="!selected.length" @click="goCheckout">去结算</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const router = useRouter()
const cartList = ref([])
const selected = ref([])
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''
const totalPrice = computed(() => selected.value.reduce((s, r) => s + r.price * r.buynumber, 0).toFixed(2))

const loadCart = async () => {
  const res = await http.get('/cart/page', { params: { page: 1, limit: 999 } })
  cartList.value = res.data?.data?.list || []
}

const onSelect = (rows) => { selected.value = rows }

const updateQty = async (row) => {
  await http.post('/cart/update', { id: row.id, buynumber: row.buynumber })
}

const removeItem = async (row) => {
  await ElMessageBox.confirm('确定删除该商品？', '提示')
  await http.post('/cart/delete', [row.id])
  ElMessage.success('已删除')
  loadCart()
}

const goCheckout = () => {
  sessionStorage.setItem('checkout_items', JSON.stringify(selected.value))
  router.push('/front/order-confirm')
}

onMounted(loadCart)
</script>
