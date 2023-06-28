<template>
  <div class="h-full w-full">
    <el-container class="h-full">
      <el-aside width="64px">
        <Slider />
      </el-aside>
      <el-main>
        <slot />
      </el-main>
    </el-container>
  </div>
</template>
