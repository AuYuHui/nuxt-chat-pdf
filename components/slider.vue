<script setup lang="ts">
const isCollapse = ref(true)
</script>

<template>
  <client-only>
    <el-menu default-active="1" class="h-full" :collapse="isCollapse">
      <el-menu-item index="1">
        <el-icon><ElIconChatRound /></el-icon>
        <template #title>
          知识库
        </template>
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><ElIconWindPower /></el-icon>
        <template #title>
          待开发
        </template>
      </el-menu-item>
    </el-menu>
  </client-only>
</template>

<style scoped></style>
