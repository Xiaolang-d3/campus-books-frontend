<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户注册</h2>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="role">
          <el-radio-group v-model="form.role">
            <el-radio value="yonghu">用户注册</el-radio>
            <el-radio value="shangjia">商家注册</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="账号" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="name">
          <el-input v-model="form.name" placeholder="姓名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="password2">
          <el-input v-model="form.password2" type="password" placeholder="确认密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%" @click="handleRegister">注 册</el-button>
        </el-form-item>
        <div style="text-align:center">
          <el-link type="primary" @click="$router.push('/login')">已有账号？去登录</el-link>
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
const form = reactive({ role: 'yonghu', username: '', name: '', password: '', password2: '' })
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  password2: [{ required: true, message: '请确认密码', trigger: 'blur' }]
}

const handleRegister = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (form.password !== form.password2) return ElMessage.error('两次密码不一致')
    const url = form.role === 'yonghu' ? '/yonghu/register' : '/shangjia/register'
    const body = form.role === 'yonghu'
      ? { yonghuzhanghao: form.username, yonghuxingming: form.name, mima: form.password }
      : { shangjiazhanghao: form.username, shangjiaxingming: form.name, mima: form.password }
    const { data: res } = await http.post(url, body)
    if (res.code === 0) {
      ElMessage.success('注册成功')
      router.push('/login')
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
  width: 420px; padding: 40px; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.login-box h2 { text-align: center; margin-bottom: 30px; color: #333; }
</style>
