<script setup lang="ts">
import type { CollectionType } from 'chromadb/src/types'

const visible = ref(false)

const tableData = ref<CollectionType[]>([])

async function init() {
  const res = await $fetch('/api/collections')
  tableData.value = res.collections
}
function handleClick() {
  visible.value = true
}
init()
</script>

<template>
  <div>
    <div class="h-50px bg-white flex-cb px-2">
      <el-button @click="handleClick">
        上传文件
      </el-button>
    </div>
    <div class="w-full">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="集合名称" />
      </el-table>
    </div>
    <Upload v-model:visible="visible" />
  </div>
</template>

<style scoped>

</style>
