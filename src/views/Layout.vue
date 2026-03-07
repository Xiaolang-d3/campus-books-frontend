<template>
  <el-container style="height: 100vh">
    <el-aside :width="isCollapse ? '64px' : '220px'" style="background: #304156; transition: width 0.3s">
      <div class="logo">{{ isCollapse ? '书' : '二手书籍交易平台' }}</div>
      <el-menu
        :default-active="$route.path"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
        unique-opened
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
          </el-sub-menu>
        </template>

        <el-sub-menu index="book-mgmt">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>书籍管理</span>
          </template>
          <el-menu-item index="/shujifenlei" v-if="role === 'admin'">书籍分类</el-menu-item>
          <el-menu-item index="/ershoushuji">二手书籍</el-menu-item>
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

        <el-menu-item index="/discussershoushuji">
          <el-icon><ChatDotRound /></el-icon>
          <span>书籍评论</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; background: #fff">
        <el-icon style="cursor: pointer; font-size: 20px" @click="isCollapse = !isCollapse">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <div style="display: flex; align-items: center; gap: 16px">
          <el-button text @click="$router.push('/front/home')" style="color: #409eff">前台入口</el-button>
          <el-dropdown @command="handleCommand">
            <span style="cursor: pointer; display: flex; align-items: center; gap: 4px">
              <el-icon><UserFilled /></el-icon>{{ roleName }}
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

      <el-main style="background: #f0f2f5; padding: 16px">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isCollapse = ref(false)
const role = localStorage.getItem('role') || 'admin'
const roleMap = { admin: '管理员', yonghu: '用户' }
const roleName = computed(() => roleMap[role] || role)

const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    localStorage.clear()
    router.push('/login')
    return
  }
  router.push(`/${cmd}`)
}
</script>

<style scoped>
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
}
</style>
