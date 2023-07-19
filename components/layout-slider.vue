<script setup lang="ts">
const isCollapse = ref(true)
</script>

<template>
  <client-only>
    <el-menu default-active="1" class="h-full" :collapse="isCollapse">
      <NuxtLink to="/">
        <el-menu-item index="1">
          <el-icon><ElIconChatRound /></el-icon>
          <template #title>
            对话
          </template>
        </el-menu-item>
      </NuxtLink>
      <NuxtLink to="/knowledge">
        <el-menu-item index="2">
          <el-icon><ElIconWindPower /></el-icon>
          <template #title>
            数据集
          </template>
        </el-menu-item>
      </NuxtLink>
      <NuxtLink to="/draw">
        <el-menu-item index="3">
          <el-icon><ElIconPicture /></el-icon>
          <template #title>
            神笔马良(绘画版)
          </template>
        </el-menu-item>
      </NuxtLink>
    </el-menu>
  </client-only>
</template>

<style scoped></style>
