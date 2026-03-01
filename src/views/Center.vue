<template>
  <el-card>
    <template #header>个人信息</template>
    <el-form :model="form" label-width="100px" style="max-width:500px">
      <template v-if="tableName === 'users'">
        <el-form-item label="用户名"><el-input v-model="form.username" disabled /></el-form-item>
        <el-form-item label="角色"><el-input v-model="form.role" disabled /></el-form-item>
      </template>
      <template v-else-if="tableName === 'yonghu'">
        <el-form-item label="账号"><el-input v-model="form.yonghuzhanghao" disabled /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.yonghuxingming" /></el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.xingbie"><el-radio value="男">男</el-radio><el-radio value="女">女</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="电话"><el-input v-model="form.dianhuahaoma" /></el-form-item>
      </template>
      <template v-else-if="tableName === 'shangjia'">
        <el-form-item label="账号"><el-input v-model="form.shangjiazhanghao" disabled /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.shangjiaxingming" /></el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.xingbie"><el-radio value="男">男</el-radio><el-radio value="女">女</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item label="电话"><el-input v-model="form.dianhuahaoma" /></el-form-item>
      </template>
      <el-form-item><el-button type="primary" @click="handleSave">保存</el-button></el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const tableName = localStorage.getItem('tableName') || 'users'
const form = ref({})

onMounted(async () => {
  const url = tableName === 'users' ? '/users/session' : `/${tableName}/session`
  const { data: res } = await http.get(url)
  if (res.code === 0) form.value = res.data
})

const handleSave = async () => {
  const url = tableName === 'users' ? '/users/update' : `/${tableName}/update`
  const { data: res } = await http.post(url, form.value)
  res.code === 0 ? ElMessage.success('保存成功') : ElMessage.error(res.msg)
}
</script>
