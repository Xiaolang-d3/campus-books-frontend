<template>
  <div>
    <el-card>
      <template #header>
        <span style="font-size: 18px; font-weight: 700">个人中心</span>
      </template>

      <el-form :model="form" label-width="100px" style="max-width: 560px">
        <el-form-item label="学号">
          <el-input v-model="form.yonghuzhanghao" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.yonghuxingming" />
        </el-form-item>
        <el-form-item label="学院">
          <el-input v-model="form.xueyuan" />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="form.zhuanye" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="form.nianji" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.xingbie">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.dianhuahaoma" />
        </el-form-item>
        <el-form-item label="余额">
          <el-input :model-value="Number(form.money || 0).toFixed(2)" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const form = ref({
  yonghuzhanghao: '',
  yonghuxingming: '',
  xueyuan: '',
  zhuanye: '',
  nianji: '',
  xingbie: '',
  dianhuahaoma: '',
  money: 0,
})

onMounted(async () => {
  const uid = localStorage.getItem('userid')
  const { data: res } = await http.get(`/yonghu/info/${uid}`)
  if (res.code === 0 && res.data) {
    form.value = {
      ...form.value,
      ...res.data,
    }
  }
})

const save = async () => {
  const requiredFields = [
    ['yonghuxingming', '姓名'],
    ['xueyuan', '学院'],
    ['zhuanye', '专业'],
    ['nianji', '年级'],
  ]
  for (const [field, label] of requiredFields) {
    if (!form.value[field]) {
      ElMessage.error(`${label}不能为空`)
      return
    }
  }

  const { data: res } = await http.post('/yonghu/update', form.value)
  if (res.code === 0) {
    ElMessage.success('保存成功')
  } else {
    ElMessage.error(res.msg)
  }
}
</script>
