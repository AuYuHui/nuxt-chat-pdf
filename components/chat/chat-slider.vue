<script setup lang="ts">
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()

const dataSources = computed(() => chatStore.chatHistory)

function handleClickHistory() {
  chatStore.addHistory({
    title: '大幅低开反对反对反对法',
    isEdit: false,
    uuid: Date.now(),
    loading: false,
  })
}
</script>

<template>
  <div class="bg-white w-[260px] h-full flex-col-c py-5 px-2">
    <!-- 创建聊天 -->
    <div
      class="flex-c w-full h-10 rounded-1 text-center line-height-10 cursor-pointer bg-[--btnBgColor] text-[--text-color-primary]"
      @click="handleClickHistory"
    >
      <el-icon class="mr-1">
        <ElIconCirclePlus />
      </el-icon>
      快速创建
    </div>

    <!-- 历史 记录 -->
    <el-scrollbar>
      <div v-for="chat in dataSources" :key="chat.uuid" class="w-full mt-2">
        <div class="flex items-center px-3 py-1 gap-x-2  bg-[--btnBgColor] text-[--text-color-primary] rounded-1">
          <div>
            <el-icon>
              <ElIconChatSquare />
            </el-icon>
          </div>
          <div class="flex-1">
            <div class="max-w-[200px] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
              45454564654654654654645654
            </div>
            <div class="flex justify-end">
              <ClientOnly>
                <el-tooltip
                  effect="dark"
                  content="编辑标题"
                  placement="bottom"
                >
                  <el-icon class="mr-3 cursor-pointer">
                    <ElIconEditPen />
                  </el-icon>
                </el-tooltip>
                <el-tooltip
                  effect="dark"
                  content="删除记录"
                  placement="bottom"
                >
                  <el-icon class="cursor-pointer">
                    <ElIconDelete />
                  </el-icon>
                </el-tooltip>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>

</style>
