<template>
  <div class="payment-container">
    <el-card class="payment-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><ShoppingBag /></el-icon>
          <span>订单支付</span>
        </div>
      </template>

      <el-skeleton :loading="loading" animated>
        <template #template>
          <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 16px" />
          <el-skeleton-item variant="text" style="width: 40%; margin-bottom: 16px" />
          <el-skeleton-item variant="text" style="width: 50%" />
        </template>

        <template #default>
          <div v-if="orderInfo.order_no" class="order-info">
            <div class="info-row">
              <span class="label">订单号：</span>
              <span class="value">{{ orderInfo.order_no }}</span>
            </div>
            <div class="info-row">
              <span class="label">商品名称：</span>
              <span class="value">{{ orderInfo.book_title }}</span>
            </div>
            <div class="info-row">
              <span class="label">购买数量：</span>
              <span class="value">{{ orderInfo.quantity }}</span>
            </div>
            <div class="info-row">
              <span class="label">收货地址：</span>
              <span class="value">{{ orderInfo.receiver_address }}</span>
            </div>
            <div class="info-row">
              <span class="label">收货人：</span>
              <span class="value">{{ orderInfo.receiver_name }} {{ orderInfo.receiver_phone }}</span>
            </div>
            <div class="total-row">
              <span class="label">应付金额：</span>
              <span class="amount">¥{{ orderInfo.total_amount }}</span>
            </div>
          </div>
        </template>
      </el-skeleton>

      <el-divider />

      <!-- 支付方式选择 -->
      <div class="payment-methods">
        <div class="method-title">选择支付方式</div>
        <el-radio-group v-model="paymentMethod" class="method-list">
          <el-radio value="balance" border>
            <div class="method-item">
              <el-icon class="method-icon"><Wallet /></el-icon>
              <div class="method-info">
                <div class="method-name">余额支付</div>
                <div class="method-desc">当前余额：¥{{ balance.toFixed(2) }}</div>
              </div>
            </div>
          </el-radio>
          <el-radio value="alipay" border disabled>
            <div class="method-item">
              <el-icon class="method-icon"><CreditCard /></el-icon>
              <div class="method-info">
                <div class="method-name">支付宝</div>
                <div class="method-desc">暂未开通</div>
              </div>
            </div>
          </el-radio>
          <el-radio value="wechat" border disabled>
            <div class="method-item">
              <el-icon class="method-icon"><ChatDotRound /></el-icon>
              <div class="method-info">
                <div class="method-name">微信支付</div>
                <div class="method-desc">暂未开通</div>
              </div>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <el-alert
        v-if="Number(balance) < Number(orderInfo.total_amount)"
        title="余额不足，无法支付"
        type="error"
        show-icon
        :closable="false"
        style="margin-top: 16px"
      >
        <template #default>
          <div>当前余额：¥{{ Number(balance).toFixed(2) }}</div>
          <div>需要支付：¥{{ Number(orderInfo.total_amount || 0).toFixed(2) }}</div>
          <div>还需充值：¥{{ (Number(orderInfo.total_amount || 0) - Number(balance)).toFixed(2) }}</div>
        </template>
      </el-alert>

      <div class="payment-actions">
        <el-button size="large" @click="$router.back()">取消</el-button>
        <el-button
          type="primary"
          size="large"
          @click="handlePay"
          :loading="paying"
          :disabled="Number(balance) < Number(orderInfo.total_amount)"
        >
          确认支付 ¥{{ Number(orderInfo.total_amount || 0).toFixed(2) }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingBag, Wallet, CreditCard, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const paying = ref(false)
const orderInfo = ref({})
const balance = ref(0)
const paymentMethod = ref('balance')

const loadOrder = async () => {
  loading.value = true
  try {
    const res = await http.get(`/order/info/${route.params.id}`)
    orderInfo.value = res.data?.data || {}
    
    // 确保 total_amount 是数字类型
    orderInfo.value.total_amount = Number(orderInfo.value.total_amount || 0)

    if (orderInfo.value.status !== '未支付') {
      ElMessage.warning('订单状态异常')
      router.back()
    }
  } catch (e) {
    ElMessage.error('加载订单失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const loadBalance = async () => {
  try {
    const res = await http.get('/wallet/balance')
    console.log('余额API响应:', res.data)
    
    if (res.data?.code === 500 && res.data?.msg?.includes('仅校园用户支持钱包功能')) {
      ElMessage.error('登录信息已过期，请重新登录')
      setTimeout(() => {
        localStorage.clear()
        router.push('/login')
      }, 2000)
      return
    }
    
    // 确保 balance 是数字类型
    balance.value = Number(res.data?.data?.balance || 0)
    console.log('当前余额:', balance.value, '订单金额:', orderInfo.value.total_amount)
  } catch (e) {
    console.error('获取余额失败:', e)
    console.error('错误详情:', e.response?.data)
    
    if (e.response?.data?.msg?.includes('仅校园用户支持钱包功能')) {
      ElMessage.error('登录信息已过期，请重新登录')
      setTimeout(() => {
        localStorage.clear()
        router.push('/login')
      }, 2000)
    }
    balance.value = 0
  }
}

const handlePay = async () => {
  const orderAmount = Number(orderInfo.value.total_amount || 0)
  const currentBalance = Number(balance.value || 0)
  
  console.log('支付检查 - 余额:', currentBalance, '订单金额:', orderAmount)
  
  if (currentBalance < orderAmount) {
    ElMessage.warning(`余额不足，无法支付。当前余额：¥${currentBalance.toFixed(2)}，需要：¥${orderAmount.toFixed(2)}`)
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认支付 ¥${orderAmount.toFixed(2)} 吗？`,
      '确认支付',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    paying.value = true
    await http.post('/wallet/pay', { orderid: orderInfo.value.order_no })

    ElMessage.success('支付成功')

    // 跳转到订单详情
    setTimeout(() => {
      router.push('/front/orders')
    }, 1000)
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.response?.data?.msg || '支付失败')
    }
  } finally {
    paying.value = false
  }
}

onMounted(async () => {
  await loadOrder()  // 先加载订单
  await loadBalance() // 再加载余额，这样可以正确比较
})
</script>

<style scoped>
.payment-container {
  max-width: 700px;
  margin: 40px auto;
}

.payment-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.order-info {
  padding: 16px 0;
}

.info-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  width: 100px;
  color: #666;
  flex-shrink: 0;
}

.info-row .value {
  flex: 1;
  color: #1a1a1a;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 16px;
  border-top: 2px solid #f0f0f0;
}

.total-row .label {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.total-row .amount {
  font-size: 28px;
  font-weight: 700;
  color: #ff4d4f;
}

.payment-methods {
  margin-top: 24px;
}

.method-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.method-list {
  width: 100%;
}

.method-list :deep(.el-radio) {
  width: 100%;
  margin-right: 0;
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 8px;
  height: auto;
}

.method-list :deep(.el-radio.is-bordered.is-checked) {
  border-color: #409eff;
  background: #f0f7ff;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.method-icon {
  font-size: 24px;
  color: #409eff;
}

.method-info {
  flex: 1;
  text-align: left;
}

.method-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #999;
}

.payment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .payment-container {
    margin: 16px;
  }

  .info-row {
    flex-direction: column;
    gap: 4px;
  }

  .info-row .label {
    width: auto;
  }

  .total-row .amount {
    font-size: 24px;
  }

  .payment-actions {
    flex-direction: column-reverse;
  }

  .payment-actions .el-button {
    width: 100%;
  }
}
</style>
