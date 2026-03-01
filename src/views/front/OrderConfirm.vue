<template>
  <div>
    <el-card>
      <template #header><span style="font-size:18px;font-weight:bold">确认订单</span></template>
      <!-- 收货地址 -->
      <div style="margin-bottom:20px">
        <div style="font-weight:bold;margin-bottom:12px">收货地址</div>
        <el-radio-group v-model="selectedAddr" v-if="addrList.length">
          <el-radio v-for="a in addrList" :key="a.id" :value="a.id" style="display:block;margin-bottom:8px">
            {{ a.name }} {{ a.phone }} - {{ a.address }} <el-tag v-if="a.isdefault==='是'" size="small" type="warning">默认</el-tag>
          </el-radio>
        </el-radio-group>
        <el-button text type="primary" @click="showAddrForm = true">+ 新增地址</el-button>
      </div>
      <el-divider />
      <!-- 商品列表 -->
      <el-table :data="items">
        <el-table-column label="商品" min-width="200">
          <template #default="{ row }">
            <div style="display:flex;align-items:center;gap:12px">
              <img :src="getImg(row.picture)" style="width:50px;height:50px;object-fit:cover;border-radius:4px" />
              <span>{{ row.goodname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="100"><template #default="{ row }">¥{{ row.price }}</template></el-table-column>
        <el-table-column label="数量" width="80" prop="buynumber" />
        <el-table-column label="小计" width="120"><template #default="{ row }">¥{{ (row.price * row.buynumber).toFixed(2) }}</template></el-table-column>
      </el-table>
      <el-divider />
      <div style="display:flex;justify-content:flex-end;align-items:center;gap:20px">
        <el-input v-model="remark" placeholder="备注（选填）" style="width:300px" />
        <span style="font-size:22px;color:#f56c6c;font-weight:bold">合计：¥{{ totalPrice }}</span>
        <el-button type="danger" size="large" @click="submitOrder" :loading="submitting">提交订单</el-button>
      </div>
    </el-card>

    <!-- 新增地址弹窗 -->
    <el-dialog v-model="showAddrForm" title="新增地址" width="500px">
      <el-form :model="addrForm" label-width="80px">
        <el-form-item label="收货人"><el-input v-model="addrForm.name" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="addrForm.phone" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="addrForm.address" /></el-form-item>
        <el-form-item label="默认地址"><el-switch v-model="addrForm.isdefault" active-value="是" inactive-value="否" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddrForm = false">取消</el-button>
        <el-button type="primary" @click="saveAddr">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const router = useRouter()
const items = ref(JSON.parse(sessionStorage.getItem('checkout_items') || '[]'))
const addrList = ref([])
const selectedAddr = ref(null)
const remark = ref('')
const submitting = ref(false)
const showAddrForm = ref(false)
const addrForm = ref({ name: '', phone: '', address: '', isdefault: '否' })
const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''
const totalPrice = computed(() => items.value.reduce((s, r) => s + r.price * r.buynumber, 0).toFixed(2))

const loadAddr = async () => {
  const res = await http.get('/address/list', { params: { page: 1, limit: 100 } })
  addrList.value = res.data?.data?.list || []
  const def = addrList.value.find(a => a.isdefault === '是')
  if (def) selectedAddr.value = def.id
  else if (addrList.value.length) selectedAddr.value = addrList.value[0].id
}

const saveAddr = async () => {
  if (!addrForm.value.name || !addrForm.value.phone || !addrForm.value.address) return ElMessage.warning('请填写完整')
  await http.post('/address/save', addrForm.value)
  showAddrForm.value = false
  addrForm.value = { name: '', phone: '', address: '', isdefault: '否' }
  loadAddr()
}

const submitOrder = async () => {
  if (!selectedAddr.value) return ElMessage.warning('请选择收货地址')
  if (!items.value.length) return ElMessage.warning('没有商品')
  submitting.value = true
  const addr = addrList.value.find(a => a.id === selectedAddr.value)
  try {
    for (const item of items.value) {
      await http.post('/orders/save', {
        tablename: 'ershoushuji', goodid: item.goodid, goodname: item.goodname,
        picture: item.picture, buynumber: item.buynumber, price: item.price,
        total: item.price * item.buynumber, discountprice: 0, discounttotal: 0,
        type: 1, status: '未支付', address: addr.address, tel: addr.phone,
        consignee: addr.name, remark: remark.value
      })
      // 删除购物车项
      if (item.id) await http.post('/cart/delete', [item.id])
    }
    ElMessage.success('下单成功')
    sessionStorage.removeItem('checkout_items')
    router.push('/front/orders')
  } catch (e) {
    ElMessage.error('下单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadAddr)
</script>
