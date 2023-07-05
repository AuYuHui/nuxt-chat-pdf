<script setup lang="ts">
import Setting from './setting.vue'

const visible = ref(false)
</script>

<template>
  <div class="bg-white h-full flex-cb px-5 border-b-1">
    <div class="font-bold">
      Nuxt-Chat
    </div>
    <div>
      <el-icon :size="24" class="cursor-pointer" @click="visible = !visible">
        <el-icon-setting />
      </el-icon>
    </div>
  </div>
  <Setting v-model:visible="visible" />
</template>

<style scoped>

</style>
