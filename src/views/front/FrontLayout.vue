<template>
  <div class="front-layout">
    <!-- 移动端遮罩层 -->
    <div v-if="showMobileMenu" class="mobile-overlay" @click="showMobileMenu = false" />

    <!-- 顶部导航 -->
    <el-header :class="['front-header', { scrolled: isScrolled }]">
      <div class="header-inner">
        <!-- Logo -->
        <div class="logo" @click="$router.push('/front/home')">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="logo-text">校园二手专业书籍在线交易平台</span>
        </div>

        <!-- 桌面端导航 -->
        <nav class="nav-links" aria-label="主导航">
          <a
            v-for="item in navItems"
            :key="item.path"
            :class="['nav-link', { active: $route.path === item.path }]"
            @click="$router.push(item.path)"
          >
            {{ item.label }}
          </a>
        </nav>

        <!-- 右侧操作区 -->
        <div class="header-actions">
          <!-- 已登录 -->
          <template v-if="isLogin">
            <div class="cart-btn" @click="$router.push('/front/cart')">
              <el-badge :value="cartCount" :hidden="!cartCount" class="hide-on-mobile">
                <el-icon :size="22"><ShoppingCart /></el-icon>
              </el-badge>
              <!-- 移动端购物车图标（无徽章） -->
              <el-icon :size="22" class="show-on-mobile"><ShoppingCart /></el-icon>
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
                <el-icon class="hide-on-mobile"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="center">个人中心</el-dropdown-item>
                  <el-dropdown-item command="ai-chat">AI 助手</el-dropdown-item>
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

          <!-- 未登录 -->
          <template v-else>
            <button class="auth-btn login" @click="$router.push('/login')">登录</button>
            <button class="auth-btn signup" @click="$router.push('/register')">注册</button>
          </template>

          <!-- 移动端汉堡按钮 -->
          <el-icon class="hamburger-btn" @click="showMobileMenu = true">
            <DArrowLeft v-if="false" />
            <MoreFilled />
          </el-icon>
        </div>
      </div>

    </el-header>

    <!-- 移动端侧边抽屉导航 -->
    <transition name="slide-left">
      <aside v-if="showMobileMenu" class="mobile-drawer">
        <div class="mobile-drawer__header">
          <div class="logo" @click="$router.push('/front/home'); showMobileMenu = false">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="logo-text">校园二手专业书籍在线交易平台</span>
          </div>
          <el-icon class="close-btn" @click="showMobileMenu = false"><Close /></el-icon>
        </div>

        <nav class="mobile-nav">
          <a
            v-for="item in navItems"
            :key="item.path"
            :class="['mobile-nav__link', { active: $route.path === item.path }]"
            @click="$router.push(item.path); showMobileMenu = false"
          >
            <el-icon><HomeFilled v-if="item.path === '/front/home'" /><Reading v-else /></el-icon>
            {{ item.label }}
          </a>
        </nav>

        <div class="mobile-drawer__divider" />

        <nav class="mobile-nav mobile-nav--user">
          <a class="mobile-nav__link" @click="$router.push('/front/cart'); showMobileMenu = false">
            <el-icon><ShoppingCart /></el-icon>
            购物车
          </a>
          <a v-if="!isLogin" class="mobile-nav__link" @click="$router.push('/login'); showMobileMenu = false">
            <el-icon><User /></el-icon>
            登录 / 注册
          </a>
          <template v-else>
            <a class="mobile-nav__link" @click="$router.push('/front/center'); showMobileMenu = false">
              <el-icon><User /></el-icon>
              个人中心
            </a>
            <a class="mobile-nav__link" @click="$router.push('/front/orders'); showMobileMenu = false">
              <el-icon><Document /></el-icon>
              我的订单
            </a>
            <a class="mobile-nav__link" @click="$router.push('/front/storeup'); showMobileMenu = false">
              <el-icon><Star /></el-icon>
              我的收藏
            </a>
            <a class="mobile-nav__link" @click="$router.push('/front/address'); showMobileMenu = false">
              <el-icon><Location /></el-icon>
              收货地址
            </a>
            <a class="mobile-nav__link mobile-nav__link--danger" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </a>
          </template>
        </nav>
      </aside>
    </transition>

    <!-- 页面内容 -->
    <el-main class="front-main">
      <router-view />
    </el-main>

    <!-- 底部 -->
    <el-footer class="front-footer">
      <div class="footer-inner">
        <div class="footer-info">
          <span class="footer-logo-text">校园二手专业书籍在线交易平台</span>
          <span class="footer-divider-line">|</span>
          <span class="footer-copy">© 2026</span>
        </div>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ShoppingCart, ArrowDown,
  HomeFilled, Reading, Document, Star, Location,
  User, Close, MoreFilled, SwitchButton, MagicStick
} from '@element-plus/icons-vue'
import http from '@/utils/http'

const router = useRouter()
const route = useRoute()
const isLogin = ref(!!localStorage.getItem('token'))
const username = ref(localStorage.getItem('username') || '')
const userAvatar = ref(localStorage.getItem('avatar') || '')
const cartCount = ref(0)
const showMobileMenu = ref(false)
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const navItems = [
  { label: '首页', path: '/front/home' },
  { label: '书籍市场', path: '/front/books' },
  { label: 'AI助手', path: '/front/ai-chat' },
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
      if (res.data.data.avatar) {
        userAvatar.value = res.data.data.avatar
        localStorage.setItem('avatar', res.data.data.avatar)
      }
    }
  } catch {}
}

const handleCmd = (cmd) => {
  if (cmd === 'logout') {
    handleLogout()
    return
  }
  router.push(`/front/${cmd}`)
}

const handleLogout = () => {
  localStorage.clear()
  isLogin.value = false
  userAvatar.value = ''
  showMobileMenu.value = false
  router.push('/front/home')
}

const handleAvatarUpdate = (event) => {
  userAvatar.value = event.detail.avatar
}

watch(
  () => route.path,
  () => {
    showMobileMenu.value = false
  }
)

onMounted(() => {
  loadCartCount()
  loadUserInfo()
  window.addEventListener('avatar-updated', handleAvatarUpdate)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('avatar-updated', handleAvatarUpdate)
  window.removeEventListener('scroll', handleScroll)
})

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

/* —— 顶部导航 —— */
.front-header {
  background: rgba(255, 255, 255, 0.97);
  padding: 0;
  border-bottom: 1px solid transparent;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.front-header.scrolled {
  border-bottom-color: #e5e5e5;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.logo-icon {
  width: 22px;
  height: 22px;
  color: var(--el-color-primary, #409eff);
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  color: var(--el-text-color-primary, #303133);
  letter-spacing: 0;
  white-space: nowrap;
}

/* 桌面端导航 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.nav-link {
  padding: 6px 14px;
  font-size: 14px;
  color: var(--el-text-color-regular, #606266);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
  border-radius: 20px;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--el-color-primary, #409eff);
  background-color: var(--el-fill-color-light, #f5f7fa);
}

.nav-link.active {
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
  background-color: var(--el-fill-color-light, #f5f7fa);
}

/* 右侧操作区 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.cart-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
  flex-shrink: 0;
  position: relative;
}

.cart-btn :deep(.el-badge) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-btn:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}

.cart-btn :deep(.el-badge__content) {
  background: var(--el-color-primary, #409eff);
  border: 2px solid #fff;
  top: 2px;
  right: 2px;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 4px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-btn:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-color-primary, #409eff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  object-fit: cover;
  flex-shrink: 0;
}

.username-text {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  font-weight: 500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-btn {
  height: 36px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.auth-btn.login {
  background: transparent;
  color: var(--el-color-primary, #409eff);
  border: 1px solid var(--el-border-color, #dcdfe6);
}

.auth-btn.login:hover {
  border-color: var(--el-color-primary, #409eff);
  background: var(--el-fill-color-light, #f5f7fa);
}

.auth-btn.signup {
  background: var(--el-color-primary, #409eff);
  color: #fff;
}

.auth-btn.signup:hover {
  background: var(--el-color-primary-light-3, #79bbff);
}

/* 汉堡菜单按钮 */
.hamburger-btn {
  display: none;
  font-size: 20px;
  color: var(--el-text-color-primary, #303133);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.hamburger-btn:hover {
  background: #f5f5f5;
}

/* —— 移动端抽屉 —— */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: #fff;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  overflow-y: auto;
}

.mobile-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.close-btn {
  font-size: 20px;
  color: #737373;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #0a0a0a;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.mobile-nav--user {
  border-top: none;
}

.mobile-nav__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 15px;
  color: #0a0a0a;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
  text-decoration: none;
}

.mobile-nav__link:hover {
  background: #f5f5f5;
}

.mobile-nav__link.active {
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
}

.mobile-nav__link--danger {
  color: #ff4d4f;
}

.mobile-drawer__divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 16px;
}

/* —— 侧边栏滑入动画 —— */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

/* —— 主内容区 —— */
.front-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
}

.front-footer {
  --el-footer-height: auto;
  --el-footer-padding: 0;
  height: auto;
  min-height: 0;
  overflow: visible;
  background: #1a1a1a;
  border-top: none;
  padding: 24px 0;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.footer-logo-text {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: -0.01em;
}

.footer-divider-line {
  color: rgba(255, 255, 255, 0.3);
  font-size: 13px;
}

.footer-copy {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

/* —— 响应式断点 —— */

/* 平板断点（导航隐藏，改用汉堡） */
@media (max-width: 968px) {
  .header-inner {
    gap: 16px;
  }

  .nav-links {
    display: none;
  }

  .hamburger-btn {
    display: flex;
  }
}

/* 移动端（完全重构顶部栏） */
@media (max-width: 768px) {
  .header-inner {
    height: 56px;
    padding: 0 16px;
    gap: 12px;
  }

  .logo-text {
    font-size: 15px;
    max-width: 80px;
  }

  .username-text {
    display: none;
  }

  .auth-btn {
    padding: 0 14px;
    font-size: 13px;
    height: 34px;
  }

  .front-main {
    padding: 16px;
    padding-bottom: 24px;
  }

  .front-footer {
    padding: 20px 0;
  }

  .footer-info {
    gap: 6px;
  }

  .footer-logo-text,
  .footer-divider-line,
  .footer-copy {
    font-size: 12px;
  }
}

/* 超小屏幕 */
@media (max-width: 480px) {
  .header-inner {
    padding: 0 12px;
    gap: 8px;
  }

  .logo-icon {
    width: 22px;
    height: 22px;
  }

  .logo-text {
    font-size: 15px;
  }

  .auth-btn {
    padding: 0 12px;
    height: 32px;
    font-size: 13px;
  }

  .front-main {
    padding: 12px;
  }
}
</style>
