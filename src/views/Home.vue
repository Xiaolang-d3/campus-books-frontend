<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="书籍总数" :value="stats.books" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="用户总数" :value="stats.users" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="商家总数" :value="stats.merchants" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="订单总数" :value="stats.orders" /></el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top:16px">
      <template #header>欢迎使用二手书籍交易平台管理系统</template>
      <p>当前角色：{{ roleMap[role] || role }}</p>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '@/utils/http'

const role = localStorage.getItem('role') || 'admin'
const roleMap = { admin: '管理员', yonghu: '用户', shangjia: '商家' }
const stats = ref({ books: 0, users: 0, merchants: 0, orders: 0 })

onMounted(async () => {
  try {
    const [b, u, m, o] = await Promise.all([
      http.get('/ershoushuji/list', { params: { page: 1, limit: 1 } }),
      http.get('/yonghu/list', { params: { page: 1, limit: 1 } }),
      http.get('/shangjia/list', { params: { page: 1, limit: 1 } }),
      http.get('/orders/list', { params: { page: 1, limit: 1 } })
    ])
    stats.value = {
      books: b.data?.data?.total || 0,
      users: u.data?.data?.total || 0,
      merchants: m.data?.data?.total || 0,
      orders: o.data?.data?.total || 0
    }
  } catch (e) { /* ignore */ }
})
</script>
