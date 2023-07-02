<script setup lang="ts">
const visible = ref(true)

function handleClick() {
  visible.value = true
}
</script>

<template>
  <div>
    <div class="h-50px bg-white flex-cb px-2">
      <el-button @click="handleClick">
        上传文件
      </el-button>
    </div>
    <Upload v-model:visible="visible" />
  </div>
</template>

<style scoped>

</style>
