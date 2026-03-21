<template>
  <div class="center-container">
    <el-card class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img
              v-if="form.avatar"
              :src="getImg(form.avatar)"
              class="avatar-image"
              alt="头像"
            />
            <div v-else class="avatar-placeholder">
              {{ form.name?.[0] || 'U' }}
            </div>
            <div class="avatar-overlay" @click="showUploadDialog = true">
              <el-icon><Camera /></el-icon>
              <span>更换头像</span>
            </div>
          </div>
          <div class="user-info">
            <h2 class="user-name">{{ form.name }}</h2>
            <p class="user-id">学号：{{ form.student_no }}</p>
          </div>
        </div>
        <div class="wallet-section">
          <div class="wallet-label">账户余额</div>
          <div class="wallet-amount">¥{{ Number(form.balance || 0).toFixed(2) }}</div>
          <el-button size="small" text @click="$router.push('/front/wallet')">
            充值 →
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
          <el-button type="primary" size="small" @click="save" :loading="saving">
            保存修改
          </el-button>
        </div>
      </template>

      <el-form :model="form" label-width="80px" class="info-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="电话">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 头像上传对话框 -->
    <el-dialog 
      v-model="showUploadDialog" 
      title="更换头像" 
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="upload-section">
        <el-upload
          :action="uploadUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
          accept="image/*"
          drag
        >
          <div class="upload-area">
            <el-icon class="upload-icon"><Upload /></el-icon>
            <div class="upload-text">点击或拖拽图片到此处上传</div>
            <div class="upload-hint">支持 JPG、PNG 格式，大小不超过 2MB</div>
          </div>
        </el-upload>
        
        <div v-if="tempAvatar" class="preview-section">
          <div class="preview-label">预览</div>
          <img :src="getImg(tempAvatar)" class="preview-image" />
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="saveAvatar" 
          :disabled="!tempAvatar"
          :loading="uploading"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera, Upload } from '@element-plus/icons-vue'
import http from '@/utils/http'

const form = ref({
  student_no: '',
  name: '',
  gender: '男',
  phone: '',
  avatar: '',
  balance: 0,
})

const saving = ref(false)
const showUploadDialog = ref(false)
const tempAvatar = ref('')
const uploading = ref(false)

const uploadUrl = '/api/file/upload'
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`
}

const getImg = (v) => v ? (v.startsWith('http') ? v : `/api/file/download/${v}`) : ''

const loadUserInfo = async () => {
  const uid = localStorage.getItem('userid')
  const { data: res } = await http.get(`/yonghu/info/${uid}`)
  if (res.code === 0 && res.data) {
    form.value = {
      ...form.value,
      ...res.data,
    }
  }
}

onMounted(loadUserInfo)

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

const handleUploadSuccess = (response) => {
  if (response.code === 0 && response.data?.file) {
    tempAvatar.value = response.data.file
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

const saveAvatar = async () => {
  if (!tempAvatar.value) return
  
  uploading.value = true
  try {
    const { data: res } = await http.post('/yonghu/update', {
      id: form.value.id,
      avatar: tempAvatar.value
    })
    
    if (res.code === 0) {
      form.value.avatar = tempAvatar.value
      localStorage.setItem('avatar', tempAvatar.value)
      ElMessage.success('头像更新成功')
      showUploadDialog.value = false
      tempAvatar.value = ''
      
      // 触发全局头像更新事件
      window.dispatchEvent(new CustomEvent('avatar-updated', { 
        detail: { avatar: form.value.avatar } 
      }))
    } else {
      ElMessage.error(res.msg || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    uploading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    const { data: res } = await http.post('/yonghu/update', {
      id: form.value.id,
      name: form.value.name,
      gender: form.value.gender,
      phone: form.value.phone,
    })
    if (res.code === 0) {
      localStorage.setItem('username', form.value.name)
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.center-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.profile-card {
  margin-bottom: 24px;
  border-radius: 4px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.avatar-image,
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: #0a0a0a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
  font-size: 12px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #0a0a0a;
}

.user-id {
  margin: 0;
  font-size: 14px;
  color: #737373;
}

.wallet-section {
  text-align: right;
}

.wallet-label {
  font-size: 13px;
  color: #737373;
  margin-bottom: 8px;
}

.wallet-amount {
  font-size: 32px;
  font-weight: 600;
  color: #0a0a0a;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.info-card {
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.info-form {
  padding: 24px 0;
}

/* 上传对话框 */
.upload-section {
  padding: 24px 0;
}

.upload-area {
  padding: 48px 24px;
  text-align: center;
  border: 2px dashed #e5e5e5;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #0a0a0a;
}

.upload-icon {
  font-size: 48px;
  color: #737373;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 14px;
  color: #0a0a0a;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #a3a3a3;
}

.preview-section {
  margin-top: 24px;
  text-align: center;
}

.preview-label {
  font-size: 13px;
  color: #737373;
  margin-bottom: 12px;
}

.preview-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e5e5;
}

/* 响应式 */
@media (max-width: 768px) {
  .center-container {
    padding: 16px;
  }

  .profile-header {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }

  .avatar-section {
    flex-direction: column;
  }

  .wallet-section {
    text-align: center;
  }
}
</style>
