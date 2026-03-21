<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-left">
        <div class="brand-section">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h1 class="brand-title">校园书市</h1>
          <p class="brand-slogan">让知识在校园流动</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">📚</div>
            <div class="feature-text">海量专业书籍</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💰</div>
            <div class="feature-text">价格实惠透明</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔒</div>
            <div class="feature-text">交易安全可靠</div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-box">
          <h2 class="login-title">欢迎登录</h2>
          <p class="login-subtitle">开启你的知识交易之旅</p>
          
          <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
            <el-form-item prop="role">
              <div class="role-selector">
                <div 
                  :class="['role-option', { active: form.role === 'yonghu' }]"
                  @click="form.role = 'yonghu'"
                >
                  <el-icon><User /></el-icon>
                  <span>学生用户</span>
                </div>
                <div 
                  :class="['role-option', { active: form.role === 'admin' }]"
                  @click="form.role = 'admin'"
                >
                  <el-icon><Setting /></el-icon>
                  <span>管理员</span>
                </div>
              </div>
            </el-form-item>

            <el-form-item prop="username">
              <el-input 
                v-model="form.username" 
                :placeholder="form.role === 'admin' ? '请输入管理员账号' : '请输入学号'" 
                size="large"
                clearable
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input 
                v-model="form.password" 
                type="password" 
                placeholder="请输入密码" 
                size="large"
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
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>

            <div class="login-footer">
              <span class="footer-text">还没有账号？</span>
              <el-link type="primary" :underline="false" @click="$router.push('/register')">
                立即注册
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
import { User, Lock, Setting } from '@element-plus/icons-vue'
import http from '@/utils/http'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '', role: 'yonghu' })
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      const { data: res } = await http.post('/login', form)
      if (res.code !== 0) {
        ElMessage.error(res.msg || '登录失败')
        return
      }

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', form.role)
      localStorage.setItem('tableName', form.role === 'admin' ? 'users' : 'yonghu')
      localStorage.setItem('userid', res.data.userid)
      localStorage.setItem('username', res.data.username)
      
      ElMessage.success('登录成功，欢迎回来！')
      
      setTimeout(() => {
        router.push(form.role === 'admin' ? '/' : '/front/home')
      }, 500)
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '登录失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -250px;
  right: -250px;
  animation: float 6s ease-in-out infinite;
}

.login-container::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  bottom: -200px;
  left: -200px;
  animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.login-content {
  display: flex;
  max-width: 1100px;
  width: 100%;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.login-left {
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

.features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(10px);
}

.feature-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.feature-text {
  font-size: 16px;
  font-weight: 500;
}

.login-right {
  flex: 1;
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  width: 100%;
  max-width: 420px;
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  text-align: center;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 40px 0;
  text-align: center;
}

.role-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}

.role-option {
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
}

.role-option:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.role-option.active {
  border-color: #409eff;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  color: #fff;
}

.role-option .el-icon {
  font-size: 24px;
}

.role-option span {
  font-size: 14px;
  font-weight: 500;
}

.login-footer {
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
  .login-left {
    display: none;
  }

  .login-content {
    max-width: 500px;
  }

  .login-right {
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-right {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 26px;
  }

  .role-selector {
    grid-template-columns: 1fr;
  }
}
</style>
