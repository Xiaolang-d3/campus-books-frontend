<template>
  <div class="front-layout">
    <el-header class="front-header">
      <div class="header-inner">
        <div class="logo" @click="$router.push('/front/home')">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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

            <el-dropdown @command="handleCmd" trigger="click">
              <div class="user-btn">
                <img 
                  v-if="userAvatar" 
                  :src="getImg(userAvatar)" 
                  class="avatar"
                  alt="头像"
                />
                <div v-else class="avatar">{{ username[0]?.toUpperCase() }}</div>
                <span class="username-text">{{ username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown">
                  <el-dropdown-item command="center">个人中心</el-dropdown-item>
                  <el-dropdown-item command="wallet">我的钱包</el-dropdown-item>
                  <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                  <el-dropdown-item command="my-books">我的发布</el-dropdown-item>
                  <el-dropdown-item command="storeup">我的收藏</el-dropdown-item>
                  <el-dropdown-item command="address">收货地址</el-dropdown-item>
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
        <p>© 2026 校园书市</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, ShoppingCart } from '@element-plus/icons-vue'
import http from '@/utils/http'

const router = useRouter()
const route = useRoute()
const isLogin = ref(!!localStorage.getItem('token'))
const username = ref(localStorage.getItem('username') || '')
const userAvatar = ref(localStorage.getItem('avatar') || '')
const cartCount = ref(0)
const searchKeyword = ref('')

const navItems = [
  { label: '首页', path: '/front/home' },
  { label: '书籍市场', path: '/front/books' },
]

const loadCartCount = async () => {
  if (!isLogin.value) return
  try {
    const res = await http.get('/cart/page', { params: { page: 1, limit: 999 } })
    cartCount.value = res.data?.data?.total || 0
  } catch {}
}

const loadUserInfo = async () => {
  if (!isLogin.value) return
  try {
    const uid = localStorage.getItem('userid')
    const res = await http.get(`/yonghu/info/${uid}`)
    if (res.data?.code === 0 && res.data?.data) {
      if (res.data.data.touxiang) {
        userAvatar.value = res.data.data.touxiang
        localStorage.setItem('avatar', res.data.data.touxiang)
      }
    }
  } catch {}
}

const handleSearch = () => {
  const query = { keyword: searchKeyword.value }
  if (route.path !== '/front/books') {
    router.push({ path: '/front/books', query })
  } else {
    router.push({ query })
  }
}

watch(
  () => route.query.keyword,
  (newVal) => {
    searchKeyword.value = newVal || ''
  },
  { immediate: true }
)

// 监听头像更新事件
const handleAvatarUpdate = (event) => {
  userAvatar.value = event.detail.avatar
}

onMounted(() => {
  loadCartCount()
  loadUserInfo()
  window.addEventListener('avatar-updated', handleAvatarUpdate)
})

onUnmounted(() => {
  window.removeEventListener('avatar-updated', handleAvatarUpdate)
})

const handleCmd = (cmd) => {
  if (cmd === 'logout') {
    localStorage.clear()
    isLogin.value = false
    userAvatar.value = ''
    router.push('/front/home')
    return
  }
  router.push(`/front/${cmd}`)
}

const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.front-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.front-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 0;
  height: 64px;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(20px);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  padding: 0 24px;
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
  width: 24px;
  height: 24px;
  color: #0a0a0a;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #0a0a0a;
  letter-spacing: -0.01em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 400;
  color: #737373;
  cursor: pointer;
  transition: color 0.2s;
  position: relative;
}

.nav-link:hover {
  color: #0a0a0a;
}

.nav-link.active {
  color: #0a0a0a;
  font-weight: 500;
}

.search-box {
  width: 280px;
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid transparent;
  box-shadow: none;
  transition: all 0.2s;
}

.search-box :deep(.el-input__wrapper:hover) {
  background: #fff;
  border-color: #e5e5e5;
}

.search-box :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: #0a0a0a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;
}

.cart-btn:hover {
  background: #fafafa;
}

.cart-btn :deep(.el-badge__content) {
  background: #0a0a0a;
  border: 2px solid #fff;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 4px 4px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-btn:hover {
  background: #fafafa;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0a0a0a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  object-fit: cover;
  flex-shrink: 0;
}

.username-text {
  font-size: 14px;
  color: #0a0a0a;
  font-weight: 500;
}

.auth-btn {
  height: 36px;
  padding: 0 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.auth-btn.login {
  background: transparent;
  color: #0a0a0a;
  border: 1px solid #e5e5e5;
}

.auth-btn.login:hover {
  border-color: #0a0a0a;
}

.auth-btn.signup {
  background: #0a0a0a;
  color: #fff;
}

.auth-btn.signup:hover {
  background: #2a2a2a;
}

.front-main {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 32px;
}

.front-footer {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-top: none;
  padding: 32px 0;
  margin-top: 64px;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  text-align: center;
}

.footer-inner p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .header-inner {
    gap: 24px;
  }

  .search-box {
    width: 200px;
  }

  .nav-links {
    display: none;
  }
}

@media (max-width: 768px) {
  .front-header {
    height: 64px;
  }

  .header-inner {
    height: 64px;
    padding: 0 16px;
    gap: 16px;
  }

  .logo-text {
    font-size: 18px;
  }

  .search-box {
    flex: 1;
    min-width: 0;
  }

  .username-text {
    display: none;
  }

  .auth-btn {
    padding: 0 16px;
    font-size: 14px;
  }

  .front-main {
    padding: 20px 16px;
  }
}
</style>

.front-main {
  flex: 1;
  max-width: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.front-footer {
  background: #fafafa;
  border-top: 1px solid #e5e5e5;
  padding: 32px 0;
  margin-top: 80px;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}

.footer-inner p {
  margin: 0;
  color: #a3a3a3;
  font-size: 13px;
  letter-spacing: 0.02em;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .header-inner {
    gap: 24px;
  }

  .search-box {
    width: 200px;
  }

  .nav-links {
    display: none;
  }
}

@media (max-width: 768px) {
  .front-header {
    height: 56px;
  }

  .header-inner {
    height: 56px;
    padding: 0 16px;
    gap: 16px;
  }

  .logo-text {
    font-size: 16px;
  }

  .search-box {
    flex: 1;
    min-width: 0;
  }

  .username-text {
    display: none;
  }

  .auth-btn {
    padding: 0 16px;
    font-size: 13px;
  }
}
