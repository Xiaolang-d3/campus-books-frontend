<template>
  <div>
    <el-card>
      <template #header><span style="font-size:18px;font-weight:bold">个人中心</span></template>
      <el-form :model="form" label-width="100px" style="max-width:500px">
        <el-form-item label="账号">
          <el-input v-model="form.account" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
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
          <el-input v-model="form.money" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const role = localStorage.getItem('role')
const form = ref({ account: '', name: '', xingbie: '', dianhuahaoma: '', money: 0 })

onMounted(async () => {
  const uid = localStorage.getItem('userid')
  const table = role === 'shangjia' ? 'shangjia' : 'yonghu'
  const res = await http.get(`/${table}/info/${uid}`)
  const d = res.data?.data
  if (d) {
    form.value = {
      id: d.id,
      account: d[`${table}zhanghao`] || d.yonghuzhanghao || d.shangjiazhanghao,
      name: d[`${table}xingming`] || d.yonghuxingming || d.shangjiaxingming,
      xingbie: d.xingbie, dianhuahaoma: d.dianhuahaoma, money: d.money
    }
  }
})

const save = async () => {
  const table = role === 'shangjia' ? 'shangjia' : 'yonghu'
  const nameKey = role === 'shangjia' ? 'shangjiaxingming' : 'yonghuxingming'
  await http.post(`/${table}/update`, { id: form.value.id, [nameKey]: form.value.name, xingbie: form.value.xingbie, dianhuahaoma: form.value.dianhuahaoma })
  ElMessage.success('保存成功')
}
</script>
