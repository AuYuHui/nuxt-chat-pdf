<template>
  <div class="h-full w-full">
    <el-container class="h-full">
      <el-aside width="64px">
        <layout-slider />
      </el-aside>
      <el-container>
        <el-header>
          <layout-header />
        </el-header>
        <el-main>
          <slot />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
