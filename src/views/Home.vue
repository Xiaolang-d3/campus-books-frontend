<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="书籍总数" :value="stats.books" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="校园用户数" :value="stats.users" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="订单总数" :value="stats.orders" />
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 16px">
      <template #header>管理首页</template>
      <p>当前角色：{{ roleMap[role] || role }}</p>
      <p>系统角色已收敛为管理员和校园用户两类，校园用户可同时买书和卖书。</p>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import http from '@/utils/http'

const role = localStorage.getItem('role') || 'admin'
const roleMap = { admin: '管理员', yonghu: '校园用户' }
const stats = ref({ books: 0, users: 0, orders: 0 })

onMounted(async () => {
  try {
    const [books, users, orders] = await Promise.all([
      http.get('/book/list', { params: { page: 1, limit: 1 } }),
      http.get('/yonghu/list', { params: { page: 1, limit: 1 } }),
      http.get('/order/list', { params: { page: 1, limit: 1 } }),
    ])

    stats.value = {
      books: books.data?.data?.total || 0,
      users: users.data?.data?.total || 0,
      orders: orders.data?.data?.total || 0,
    }
  } catch {
    stats.value = { books: 0, users: 0, orders: 0 }
  }
})
</script>
