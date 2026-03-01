<template>
  <div class="front-layout">
    <el-header class="front-header">
      <div class="header-inner">
        <div class="logo" @click="$router.push('/front/home')">📚 二手书籍交易平台</div>
        <el-menu mode="horizontal" :default-active="$route.path" router background-color="#304156"
          text-color="#bfcbd9" active-text-color="#409EFF" class="nav-menu">
          <el-menu-item index="/front/home">首页</el-menu-item>
          <el-menu-item index="/front/books">二手书籍</el-menu-item>
          <el-menu-item index="/front/news">公告信息</el-menu-item>
        </el-menu>
        <div class="header-right">
          <template v-if="isLogin">
            <el-badge :value="cartCount" :hidden="!cartCount" class="cart-badge">
              <el-button text style="color:#fff" @click="$router.push('/front/cart')">
                <el-icon><ShoppingCart /></el-icon> 购物车
              </el-button>
            </el-badge>
            <el-dropdown @command="handleCmd">
              <span class="user-info"><el-icon><User /></el-icon> {{ username }} <el-icon><ArrowDown /></el-icon></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                  <el-dropdown-item command="storeup">我的收藏</el-dropdown-item>
                  <el-dropdown-item command="address">地址管理</el-dropdown-item>
                  <el-dropdown-item command="center">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button text style="color:#fff" @click="$router.push('/login')">登录</el-button>
            <el-button text style="color:#fff" @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </el-header>
    <el-main class="front-main"><router-view /></el-main>
    <el-footer class="front-footer">© 2024 二手书籍交易平台</el-footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/utils/http'

const router = useRouter()
const isLogin = ref(!!localStorage.getItem('token'))
const username = ref(localStorage.getItem('username') || '')
const cartCount = ref(0)

const loadCartCount = async () => {
  if (!isLogin.value) return
  try {
    const res = await http.get('/cart/page', { params: { page: 1, limit: 999 } })
    cartCount.value = res.data?.data?.total || 0
  } catch (e) { /* ignore */ }
}

onMounted(loadCartCount)

const handleCmd = (cmd) => {
  if (cmd === 'logout') {
    localStorage.clear()
    isLogin.value = false
    router.push('/front/home')
  } else {
    router.push(`/front/${cmd}`)
  }
}
</script>

<style scoped>
.front-layout { min-height: 100vh; display: flex; flex-direction: column; }
.front-header { background: #304156; padding: 0; height: 60px; }
.header-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; height: 60px; padding: 0 20px; }
.logo { color: #fff; font-size: 18px; font-weight: bold; cursor: pointer; white-space: nowrap; margin-right: 20px; }
.nav-menu { flex: 1; border-bottom: none; }
.nav-menu .el-menu-item { border-bottom: none; }
.header-right { display: flex; align-items: center; gap: 12px; }
.user-info { color: #bfcbd9; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.cart-badge { margin-right: 8px; }
.front-main { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 20px; }
.front-footer { text-align: center; color: #999; background: #f5f5f5; height: 50px; line-height: 50px; }
</style>
