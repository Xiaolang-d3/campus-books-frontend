<template>
  <div class="register-container">
    <div class="register-content">
      <div class="register-left">
        <div class="brand-section">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h1 class="brand-title">加入校园书市</h1>
          <p class="brand-slogan">开启你的知识交易之旅</p>
        </div>
        <div class="benefits">
          <div class="benefit-item">
            <div class="benefit-icon">✨</div>
            <div class="benefit-content">
              <h3>快速注册</h3>
              <p>只需简单几步即可完成注册</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">🎯</div>
            <div class="benefit-content">
              <h3>精准匹配</h3>
              <p>根据专业课程智能推荐书籍</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">🤝</div>
            <div class="benefit-content">
              <h3>校园社区</h3>
              <p>与同学安全便捷地交易书籍</p>
            </div>
          </div>
        </div>
      </div>

      <div class="register-right">
        <div class="register-box">
          <h2 class="register-title">创建账号</h2>
          <p class="register-subtitle">填写以下信息完成注册</p>
          
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="学号" prop="username">
                  <el-input 
                    v-model="form.username" 
                    placeholder="请输入学号"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input 
                    v-model="form.name" 
                    placeholder="请输入真实姓名"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Avatar /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="学院" prop="xueyuan">
              <el-input 
                v-model="form.xueyuan" 
                placeholder="如：计算机学院"
                clearable
              >
                <template #prefix>
                  <el-icon><School /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="专业" prop="zhuanye">
                  <el-input 
                    v-model="form.zhuanye" 
                    placeholder="如：软件工程"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Reading /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年级" prop="nianji">
                  <el-input 
                    v-model="form.nianji" 
                    placeholder="如：2022级"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Calendar /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="form.password" 
                type="password" 
                placeholder="请设置登录密码（至少6位）"
                show-password
                clearable
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="确认密码" prop="password2">
              <el-input 
                v-model="form.password2" 
                type="password" 
                placeholder="请再次输入密码"
                show-password
                clearable
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                size="large" 
                style="width: 100%" 
                :loading="loading"
                @click="handleRegister"
              >
                {{ loading ? '注册中...' : '立即注册' }}
              </el-button>
            </el-form-item>

            <div class="register-footer">
              <span class="footer-text">已有账号？</span>
              <el-link type="primary" :underline="false" @click="$router.push('/login')">
                立即登录
              </el-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Avatar, School, Reading, Calendar } from '@element-plus/icons-vue'
import http from '@/utils/http'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: '',
  name: '',
  xueyuan: '',
  zhuanye: '',
  nianji: '',
  password: '',
  password2: '',
})

const validatePassword = (rule, value, callback) => {
  if (value.length < 6) {
    callback(new Error('密码至少需要6位'))
  } else {
    callback()
  }
}

const validatePassword2 = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次密码输入不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 6, max: 20, message: '学号长度在6-20位之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在2-10位之间', trigger: 'blur' }
  ],
  xueyuan: [{ required: true, message: '请输入学院', trigger: 'blur' }],
  zhuanye: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  nianji: [{ required: true, message: '请输入年级', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  password2: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePassword2, trigger: 'blur' }
  ],
}

const handleRegister = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const { data: res } = await http.post('/yonghu/register', {
        yonghuzhanghao: form.username.trim(),
        yonghuxingming: form.name.trim(),
        xueyuan: form.xueyuan.trim(),
        zhuanye: form.zhuanye.trim(),
        nianji: form.nianji.trim(),
        mima: form.password,
      })

      if (res.code === 0) {
        ElMessage.success('注册成功！即将跳转到登录页面')
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        ElMessage.error(res.msg || '注册失败')
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '注册失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.register-container::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  top: -300px;
  left: -300px;
  animation: float 10s ease-in-out infinite;
}

.register-container::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  bottom: -250px;
  right: -250px;
  animation: float 12s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(10deg); }
}

.register-content {
  display: flex;
  max-width: 1200px;
  width: 100%;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.register-left {
  flex: 1;
  padding: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-section {
  margin-bottom: 60px;
}

.brand-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.brand-icon svg {
  width: 48px;
  height: 48px;
  color: #fff;
}

.brand-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: 2px;
}

.brand-slogan {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.benefit-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.benefit-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.benefit-content p {
  margin: 0;
  font-size: 15px;
  opacity: 0.9;
  line-height: 1.6;
}

.register-right {
  flex: 1;
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  max-height: 90vh;
}

.register-box {
  width: 100%;
  max-width: 500px;
}

.register-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  text-align: center;
}

.register-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 32px 0;
  text-align: center;
}

.register-footer {
  text-align: center;
  margin-top: 24px;
}

.footer-text {
  color: #666;
  font-size: 14px;
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .register-left {
    display: none;
  }

  .register-content {
    max-width: 600px;
  }

  .register-right {
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 16px;
  }

  .register-right {
    padding: 30px 20px;
  }

  .register-title {
    font-size: 26px;
  }
}
</style>
