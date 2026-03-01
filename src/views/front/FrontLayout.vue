<template>
  <div class="front-layout">
    <el-header class="front-header">
      <div class="header-inner">
        <div class="logo" @click="$router.push('/front/home')">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">校园书市</span>
        </div>

        <div class="nav-links">
          <a
            v-for="item in navItems"
            :key="item.path"
            :class="['nav-link', { active: $route.path === item.path }]"
            @click="$router.push(item.path)"
          >
            {{ item.label }}
          </a>
        </div>

        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索书籍..."
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </div>

        <div class="header-actions">
          <template v-if="isLogin">
            <div class="cart-btn" @click="$router.push('/front/cart')">
              <el-badge :value="cartCount" :hidden="!cartCount">
                <el-icon :size="22"><ShoppingCart /></el-icon>
              </el-badge>
            </div>

            <el-dropdown @command="handleCmd" trigger="click" :hide-on-click="true">
              <div class="user-btn">
                <div class="avatar">{{ username[0]?.toUpperCase() }}</div>
                <span class="username-text">{{ username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown">
                  <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                  <el-dropdown-item command="storeup">我的收藏</el-dropdown-item>
                  <el-dropdown-item command="address">收货地址</el-dropdown-item>
                  <el-dropdown-item command="center">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>

          <template v-else>
            <button class="auth-btn login" @click="$router.push('/login')">登录</button>
            <button class="auth-btn signup" @click="$router.push('/register')">注册</button>
          </template>
        </div>
      </div>
    </el-header>

    <el-main class="front-main">
      <router-view />
    </el-main>

    <el-footer class="front-footer">
      <div class="footer-inner">
        <p>© 2026 校园书市 · 让知识流动起来</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ShoppingCart, Search } from '@element-plus/icons-vue'
import http from '@/utils/http'

const router = useRouter()
const route = useRoute()
const isLogin = ref(!!localStorage.getItem('token'))
const username = ref(localStorage.getItem('username') || '')
const cartCount = ref(0)
const searchKeyword = ref('')

const navItems = [
  { label: '首页', path: '/front/home' },
  { label: '书籍市场', path: '/front/books' }
]

const loadCartCount = async () => {
  if (!isLogin.value) return
  try {
    const res = await http.get('/cart/page', { params: { page: 1, limit: 999 } })
    cartCount.value = res.data?.data?.total || 0
  } catch (e) { /* ignore */ }
}

const handleSearch = () => {
  if (route.path !== '/front/books') {
    router.push({ path: '/front/books', query: { keyword: searchKeyword.value } })
  } else {
    router.push({ query: { keyword: searchKeyword.value } })
  }
}

watch(() => route.query.keyword, (newVal) => {
  searchKeyword.value = newVal || ''
}, { immediate: true })

onMounted(() => {
  loadCartCount()
})

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
* {
  box-sizing: border-box;
}

.front-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.front-header {
  background: #fff;
  padding: 0;
  height: 64px;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.7;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: #1a1a1a;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  user-select: none;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: #1a1a1a;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.nav-link:hover {
  color: #1a1a1a;
}

.nav-link:hover::after {
  transform: scaleX(1);
}

.nav-link.active {
  color: #1a1a1a;
  font-weight: 500;
}

.nav-link.active::after {
  transform: scaleX(1);
}

.search-box {
  width: 280px;
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 0 0 1px #e8e8e8 inset;
  transition: all 0.3s;
}

.search-box :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #d0d0d0 inset;
}

.search-box :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #1a1a1a inset;
}

.search-box :deep(.el-input__inner) {
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  position: relative;
}

.cart-btn:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.cart-btn svg {
  width: 22px;
  height: 22px;
  color: #1a1a1a;
}

.cart-btn :deep(.el-badge__content) {
  background: #ff4d4f;
  border: none;
  font-size: 11px;
  height: 18px;
  line-height: 18px;
  padding: 0 5px;
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 4px rgba(255, 77, 79, 0);
  }
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-btn:hover {
  background: #f5f5f5;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.user-btn:hover .avatar {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.username-text {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-btn {
  height: 36px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  outline: none;
}

.auth-btn.login {
  background: transparent;
  color: #1a1a1a;
}

.auth-btn.login:hover {
  background: #f5f5f5;
}

.auth-btn.signup {
  background: #1a1a1a;
  color: #fff;
}

.auth-btn.signup:hover {
  background: #000;
}

.user-dropdown {
  margin-top: 8px;
}

.user-dropdown :deep(.el-dropdown-menu__item) {
  padding: 10px 20px;
  font-size: 14px;
}

.front-main {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 32px;
}

.front-footer {
  background: #fff;
  border-top: 1px solid #e8e8e8;
  height: auto;
  padding: 24px 0;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  text-align: center;
}

.footer-inner p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .header-inner {
    padding: 0 16px;
    gap: 16px;
  }

  .logo-text {
    font-size: 16px;
  }

  .nav-links {
    gap: 4px;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }

  .nav-link::after {
    left: 12px;
    right: 12px;
  }

  .search-box {
    display: none;
  }

  .username-text {
    display: none;
  }

  .front-main {
    padding: 16px;
  }

  .footer-inner {
    padding: 0 16px;
  }
}
</style>
