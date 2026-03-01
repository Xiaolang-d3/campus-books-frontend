<template>
  <div class="login-container">
    <div class="login-box">
      <h2>二手书籍交易平台</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="账号" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="role">
          <el-radio-group v-model="form.role">
            <el-radio value="admin">管理员</el-radio>
            <el-radio value="shangjia">商家</el-radio>
            <el-radio value="yonghu">用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" @click="handleLogin">登 录</el-button>
        </el-form-item>
        <div style="text-align:center">
          <el-link type="primary" @click="$router.push('/register')">没有账号？去注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const router = useRouter()
const formRef = ref()
const form = reactive({ username: '', password: '', role: 'admin' })
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    const { data: res } = await http.post('/login', form)
    if (res.code === 0) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', form.role)
      localStorage.setItem('tableName', form.role === 'admin' ? 'users' : form.role)
      localStorage.setItem('userid', res.data.userid)
      localStorage.setItem('username', res.data.username)
      ElMessage.success('登录成功')
      if (form.role === 'admin') {
        router.push('/')
      } else {
        router.push('/front/home')
      }
    } else {
      ElMessage.error(res.msg)
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex; justify-content: center; align-items: center;
  height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-box {
  width: 400px; padding: 40px; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.login-box h2 { text-align: center; margin-bottom: 30px; color: #333; }
</style>
