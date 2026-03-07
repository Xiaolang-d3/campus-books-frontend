<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户注册</h2>
      <el-form ref="formRef" :model="form" :rules="rules">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="学号" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="name">
          <el-input v-model="form.name" placeholder="姓名" />
        </el-form-item>
        <el-form-item prop="xueyuan">
          <el-input v-model="form.xueyuan" placeholder="学院" />
        </el-form-item>
        <el-form-item prop="zhuanye">
          <el-input v-model="form.zhuanye" placeholder="专业" />
        </el-form-item>
        <el-form-item prop="nianji">
          <el-input v-model="form.nianji" placeholder="年级，如 2022级" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="password2">
          <el-input v-model="form.password2" type="password" placeholder="确认密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="handleRegister">注册</el-button>
        </el-form-item>
        <div style="text-align: center">
          <el-link type="primary" @click="$router.push('/login')">已有账号？去登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const router = useRouter()
const formRef = ref()
const form = reactive({
  username: '',
  name: '',
  xueyuan: '',
  zhuanye: '',
  nianji: '',
  password: '',
  password2: '',
})

const rules = {
  username: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  xueyuan: [{ required: true, message: '请输入学院', trigger: 'blur' }],
  zhuanye: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  nianji: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  password2: [{ required: true, message: '请确认密码', trigger: 'blur' }],
}

const handleRegister = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if (form.password !== form.password2) {
      ElMessage.error('两次密码不一致')
      return
    }

    const { data: res } = await http.post('/yonghu/register', {
      yonghuzhanghao: form.username.trim(),
      yonghuxingming: form.name.trim(),
      xueyuan: form.xueyuan.trim(),
      zhuanye: form.zhuanye.trim(),
      nianji: form.nianji.trim(),
      mima: form.password,
    })

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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.login-box h2 {
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}
</style>
