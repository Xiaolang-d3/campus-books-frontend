<template>
  <el-container class="admin-layout">
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && !isCollapse"
      class="drawer-overlay"
      @click="isCollapse = true"
    />

    <!-- 侧边栏 -->
    <el-aside
      :width="isCollapse ? '0px' : isMobile ? '260px' : '220px'"
      :class="['admin-aside', { 'is-collapsed': isCollapse, 'admin-aside--drawer': isMobile }]"
    >
      <div class="logo">
        <span class="logo-text" v-show="!isCollapse">二手书籍交易平台</span>
        <span class="logo-icon-only" v-show="isCollapse">书</span>
      </div>
      <el-menu
        :default-active="$route.path"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
        unique-opened
        :collapse-transition="false"
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>系统首页</span>
        </el-menu-item>

        <template v-if="role === 'admin'">
          <el-sub-menu index="user-mgmt">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/yonghu">用户列表</el-menu-item>
            <el-menu-item index="/college">学院管理</el-menu-item>
            <el-menu-item index="/major">专业管理</el-menu-item>
          </el-sub-menu>
        </template>

        <el-sub-menu index="book-mgmt">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>书籍管理</span>
          </template>
          <el-menu-item index="/shujifenlei" v-if="role === 'admin'">书籍分类</el-menu-item>
          <el-menu-item index="/book">二手书籍</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="order-mgmt">
          <template #title>
            <el-icon><ShoppingCart /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/orders/未支付">未支付</el-menu-item>
          <el-menu-item index="/orders/已支付">已支付</el-menu-item>
          <el-menu-item index="/orders/已发货">已发货</el-menu-item>
          <el-menu-item index="/orders/已完成">已完成</el-menu-item>
          <el-menu-item index="/orders/已退款">已退款</el-menu-item>
        </el-sub-menu>

        <template v-if="role === 'admin'">
          <el-sub-menu index="content-mgmt">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>内容管理</span>
            </template>
            <el-menu-item index="/news">公告信息</el-menu-item>
            <el-menu-item index="/aboutus">关于我们</el-menu-item>
            <el-menu-item index="/systemintro">系统简介</el-menu-item>
            <el-menu-item index="/config">轮播图管理</el-menu-item>
          </el-sub-menu>
        </template>

        <el-menu-item index="/review">
          <el-icon><ChatDotRound /></el-icon>
          <span>书籍评论</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="admin-main-container">
      <!-- 顶部导航 -->
      <el-header class="admin-header">
        <!-- 移动端汉堡菜单按钮 -->
        <el-icon class="menu-toggle" @click="isCollapse = !isCollapse">
          <Fold v-if="isCollapse" />
          <Expand v-else />
        </el-icon>

        <!-- 移动端logo（仅折叠时显示） -->
        <span class="header-mobile-logo hide-on-desktop">二手书籍交易平台</span>

        <div class="header-right">
          <el-button text @click="$router.push('/front/home')" class="front-entry-btn">
            <el-icon><Shop /></el-icon>
            <span class="hide-on-mobile">前台入口</span>
          </el-button>
          <el-dropdown @command="handleCommand" trigger="click">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              <span class="user-name hide-on-mobile">{{ roleName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="center">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeFilled, User, Reading, ShoppingCart, Document,
  ChatDotRound, Fold, Expand, Shop, UserFilled, ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const isCollapse = ref(false)
const isMobile = ref(false)
const role = localStorage.getItem('role') || 'admin'
const roleMap = { admin: '管理员', yonghu: '用户' }
const roleName = computed(() => roleMap[role] || role)

const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 769
  // 首次进入移动端时自动折叠侧边栏
  if (!wasMobile && isMobile.value) {
    isCollapse.value = true
  }
  // 从移动端切回桌面时恢复展开
  if (wasMobile && !isMobile.value) {
    isCollapse.value = false
  }
}

const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    localStorage.clear()
    router.push('/login')
    return
  }
  router.push(`/${cmd}`)
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* —— 布局容器 —— */
.admin-layout {
  min-height: 100vh;
  position: relative;
}

/* —— 侧边栏 —— */
.admin-aside {
  background: #304156;
  overflow-x: hidden;
  overflow-y: auto;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2001;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
}

/* 移动端抽屉模式 */
.admin-aside--drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}

.admin-aside.is-collapsed {
  width: 0 !important;
  overflow: hidden;
}

/* —— Logo —— */
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  padding: 0 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.logo-text {
  font-size: 15px;
  letter-spacing: 0.02em;
}

.logo-icon-only {
  font-size: 18px;
}

/* —— 主内容区 —— */
.admin-main-container {
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

/* —— 顶部导航 —— */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  background: #fff;
  padding: 0 16px 0 0 !important;
  height: 60px !important;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.menu-toggle {
  cursor: pointer;
  font-size: 20px;
  color: #304156;
  padding: 0 16px;
  height: 60px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.menu-toggle:hover {
  color: #409eff;
}

.header-mobile-logo {
  font-size: 15px;
  font-weight: 700;
  color: #304156;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.front-entry-btn {
  color: #409eff !important;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background 0.2s;
  color: #606266;
  font-size: 14px;
}

.user-info:hover {
  background: #f5f7fa;
}

.user-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* —— 主内容 —— */
.admin-main {
  background: #f0f2f5;
  padding: 16px !important;
  min-height: calc(100vh - 60px);
}

/* —— 遮罩层 —— */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  backdrop-filter: blur(2px);
}

/* —— 响应式 —— */
@media (max-width: 768px) {
  .admin-header {
    padding: 0 !important;
  }

  .admin-main {
    padding: 12px !important;
  }

  /* 移动端表格横向滚动 */
  :deep(.el-table) {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
  }
  :deep(.el-table__body-wrapper) {
    overflow-x: auto !important;
  }
  :deep(.el-table__header-wrapper),
  :deep(.el-table__body-wrapper) {
    min-width: 600px;
  }

  /* 移动端表单 */
  :deep(.el-form--inline .el-form-item) {
    display: flex !important;
    flex-direction: column;
    margin-right: 0 !important;
    width: 100% !important;
  }
  :deep(.el-form--inline .el-form-item__label) {
    text-align: left !important;
    min-width: auto !important;
    padding-bottom: 4px !important;
  }
  :deep(.el-form--inline .el-form-item__content) {
    width: 100%;
  }
  :deep(.el-form--inline .el-form-item__content > *) {
    width: 100% !important;
  }
}
</style>
