<template>
  <div class="wallet-container">
    <!-- 余额卡片 -->
    <el-card class="balance-card" shadow="never">
      <div class="balance-header">
        <div class="balance-info">
          <div class="balance-label">账户余额</div>
          <div class="balance-amount">¥{{ balance.toFixed(2) }}</div>
        </div>
      </div>
    </el-card>

    <!-- 流水记录 -->
    <el-card class="logs-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>交易记录</span>
          <el-button text @click="loadLogs">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>

      <el-skeleton :loading="loading" animated :count="5">
        <template #template>
          <div v-for="i in 5" :key="i" class="log-item-skeleton">
            <el-skeleton-item variant="text" style="width: 60%" />
            <el-skeleton-item variant="text" style="width: 30%; margin-top: 8px" />
          </div>
        </template>

        <template #default>
          <el-empty v-if="!logs.length" description="暂无交易记录" />
          <div v-else class="logs-list">
            <div v-for="log in logs" :key="log.id" class="log-item">
              <div class="log-icon" :class="getLogTypeClass(log.type)">
                <el-icon v-if="log.type === '充值'"><Plus /></el-icon>
                <el-icon v-else-if="log.type === '消费'"><Minus /></el-icon>
                <el-icon v-else-if="log.type === '退款'"><RefreshLeft /></el-icon>
                <el-icon v-else><Money /></el-icon>
              </div>
              <div class="log-content">
                <div class="log-title">{{ log.remark }}</div>
                <div class="log-time">{{ log.addtime }}</div>
                <div v-if="log.orderid" class="log-order">订单号：{{ log.orderid }}</div>
              </div>
              <div class="log-amount" :class="log.amount > 0 ? 'income' : 'expense'">
                {{ log.amount > 0 ? '+' : '' }}¥{{ Math.abs(log.amount).toFixed(2) }}
              </div>
            </div>
          </div>

          <el-pagination
            v-if="total > 0"
            style="margin-top: 24px; justify-content: center"
            background
            layout="total, prev, pager, next"
            :total="total"
            :page-size="pageSize"
            v-model:current-page="page"
            @current-change="loadLogs"
          />
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh, Plus, Minus, RefreshLeft, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const balance = ref(0)
const logs = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)

const loadBalance = async () => {
  try {
    const res = await http.get('/wallet/balance')
    balance.value = res.data?.data?.balance || 0
  } catch (e) {
    console.error(e)
  }
}

const loadLogs = async () => {
  loading.value = true
  try {
    const res = await http.get('/wallet/logs', {
      params: { page: page.value, limit: pageSize }
    })
    logs.value = res.data?.data?.list || []
    total.value = res.data?.data?.total || 0
  } catch (e) {
    ElMessage.error('加载记录失败')
  } finally {
    loading.value = false
  }
}

const getLogTypeClass = (type) => {
  const map = {
    '充值': 'recharge',
    '消费': 'expense',
    '退款': 'refund',
    '收入': 'income'
  }
  return map[type] || 'default'
}

onMounted(() => {
  loadBalance()
  loadLogs()
})
</script>

<style scoped>
.wallet-container {
  max-width: 900px;
  margin: 0 auto;
}

.balance-card {
  margin-bottom: 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.balance-card :deep(.el-card__body) {
  padding: 32px;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 1px;
}

.logs-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.log-item-skeleton {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.logs-list {
  min-height: 200px;
}

.log-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.log-item:hover {
  background: #fafafa;
  margin: 0 -16px;
  padding: 16px;
  border-radius: 8px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.log-icon.recharge {
  background: #e6f7ff;
  color: #1890ff;
}

.log-icon.expense {
  background: #fff1f0;
  color: #ff4d4f;
}

.log-icon.refund {
  background: #fff7e6;
  color: #faad14;
}

.log-icon.income {
  background: #f6ffed;
  color: #52c41a;
}

.log-content {
  flex: 1;
  margin-left: 16px;
}

.log-title {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.log-time {
  font-size: 12px;
  color: #999;
}

.log-order {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.log-amount {
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.log-amount.income {
  color: #52c41a;
}

.log-amount.expense {
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .balance-card :deep(.el-card__body) {
    padding: 24px;
  }

  .balance-amount {
    font-size: 36px;
  }

  .log-item {
    flex-wrap: wrap;
  }

  .log-amount {
    width: 100%;
    text-align: right;
    margin-top: 8px;
  }
}
</style>
