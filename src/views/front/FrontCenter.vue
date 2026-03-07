<template>
  <div>
    <el-card>
      <template #header>
        <span style="font-size: 18px; font-weight: bold">个人中心</span>
      </template>

      <el-form :model="form" label-width="100px" style="max-width: 560px">
        <el-form-item :label="isMerchant ? '账号' : '学号'">
          <el-input v-model="form.account" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <template v-if="!isMerchant">
          <el-form-item label="学院">
            <el-input v-model="form.xueyuan" />
          </el-form-item>
          <el-form-item label="专业">
            <el-input v-model="form.zhuanye" />
          </el-form-item>
          <el-form-item label="年级">
            <el-input v-model="form.nianji" />
          </el-form-item>
        </template>
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
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'

const role = localStorage.getItem('role')
const isMerchant = computed(() => role === 'shangjia')
const form = ref({
  account: '',
  name: '',
  xueyuan: '',
  zhuanye: '',
  nianji: '',
  xingbie: '',
  dianhuahaoma: '',
  money: 0,
})

onMounted(async () => {
  const uid = localStorage.getItem('userid')
  const table = isMerchant.value ? 'shangjia' : 'yonghu'
  const res = await http.get(`/${table}/info/${uid}`)
  const d = res.data?.data
  if (!d) return

  form.value = {
    id: d.id,
    account: isMerchant.value ? d.shangjiazhanghao : d.yonghuzhanghao,
    name: isMerchant.value ? d.shangjiaxingming : d.yonghuxingming,
    xueyuan: d.xueyuan || '',
    zhuanye: d.zhuanye || '',
    nianji: d.nianji || '',
    xingbie: d.xingbie || '',
    dianhuahaoma: d.dianhuahaoma || '',
    money: d.money ?? 0,
  }
})

const save = async () => {
  const table = isMerchant.value ? 'shangjia' : 'yonghu'
  if (!isMerchant.value && (!form.value.xueyuan || !form.value.zhuanye || !form.value.nianji)) {
    ElMessage.error('请完整填写学院、专业和年级')
    return
  }

  const payload = isMerchant.value
    ? {
        id: form.value.id,
        shangjiaxingming: form.value.name,
        xingbie: form.value.xingbie,
        dianhuahaoma: form.value.dianhuahaoma,
      }
    : {
        id: form.value.id,
        yonghuxingming: form.value.name,
        xueyuan: form.value.xueyuan,
        zhuanye: form.value.zhuanye,
        nianji: form.value.nianji,
        xingbie: form.value.xingbie,
        dianhuahaoma: form.value.dianhuahaoma,
        yonghuzhanghao: form.value.account,
      }

  const { data: res } = await http.post(`/${table}/update`, payload)
  if (res.code === 0) {
    ElMessage.success('保存成功')
  } else {
    ElMessage.error(res.msg)
  }
}
</script>
