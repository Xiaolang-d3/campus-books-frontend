<template>
  <div>
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <el-statistic title="用户总数" :value="dashboard.total_users">
            <template #prefix><el-icon><User /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <el-statistic title="在售书籍" :value="dashboard.on_sale_books">
            <template #prefix><el-icon><Reading /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <el-statistic title="订单总数" :value="dashboard.total_orders">
            <template #prefix><el-icon><Document /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <el-statistic title="总销售额" :value="dashboard.total_sales" :precision="2" prefix="¥">
            <template #prefix><el-icon><Money /></el-icon></template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日数据 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <el-statistic title="今日订单" :value="dashboard.today_orders" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <el-statistic title="今日销售额" :value="dashboard.today_sales" :precision="2" prefix="¥" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>订单趋势（最近7天）</template>
          <div ref="orderTrendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>订单状态分布</template>
          <div ref="orderStatusChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>各分类销售额</template>
          <div ref="salesCategoryChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>销售额趋势（最近30天）</template>
          <div ref="salesTrendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 16px">
      <template #header>系统信息</template>
      <p>当前角色：{{ roleMap[role] || role }}</p>
      <p>系统角色已收敛为管理员和校园用户两类，校园用户可同时买书和卖书。</p>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { User, Reading, Document, Money } from '@element-plus/icons-vue'
import http from '@/utils/http'
import * as echarts from 'echarts'

const role = localStorage.getItem('role') || 'admin'
const roleMap = { admin: '管理员', yonghu: '校园用户' }

const dashboard = ref({
  total_users: 0,
  total_books: 0,
  on_sale_books: 0,
  total_orders: 0,
  completed_orders: 0,
  total_sales: 0,
  today_orders: 0,
  today_sales: 0
})

const orderTrendChart = ref(null)
const orderStatusChart = ref(null)
const salesCategoryChart = ref(null)
const salesTrendChart = ref(null)

const loadDashboard = async () => {
  const { data: res } = await http.get('/statistics/dashboard')
  if (res.code === 0) dashboard.value = res.data
}

const initOrderTrendChart = async () => {
  const { data: res } = await http.get('/statistics/order/trend')
  if (res.code !== 0) return

  const chart = echarts.init(orderTrendChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['总订单', '已支付'] },
    xAxis: { type: 'category', data: res.data.map(d => d.date) },
    yAxis: { type: 'value' },
    series: [
      { name: '总订单', type: 'line', data: res.data.map(d => d.total), smooth: true },
      { name: '已支付', type: 'line', data: res.data.map(d => d.paid), smooth: true }
    ]
  })
}

const initOrderStatusChart = async () => {
  const { data: res } = await http.get('/statistics/order/status')
  if (res.code !== 0) return

  const chart = echarts.init(orderStatusChart.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: res.data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  })
}

const initSalesCategoryChart = async () => {
  const { data: res } = await http.get('/statistics/sales/category')
  if (res.code !== 0) return

  const chart = echarts.init(salesCategoryChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: res.data.map(d => d.name) },
    yAxis: { type: 'value', name: '销售额(元)' },
    series: [{
      type: 'bar',
      data: res.data.map(d => d.value),
      itemStyle: { color: '#409EFF' }
    }]
  })
}

const initSalesTrendChart = async () => {
  const { data: res } = await http.get('/statistics/sales/trend')
  if (res.code !== 0) return

  const chart = echarts.init(salesTrendChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: res.data.map(d => d.date) },
    yAxis: { type: 'value', name: '销售额(元)' },
    series: [{
      type: 'line',
      data: res.data.map(d => d.sales),
      smooth: true,
      areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
      itemStyle: { color: '#409EFF' }
    }]
  })
}

onMounted(async () => {
  await loadDashboard()
  await Promise.all([
    initOrderTrendChart(),
    initOrderStatusChart(),
    initSalesCategoryChart(),
    initSalesTrendChart()
  ])
})
</script>

