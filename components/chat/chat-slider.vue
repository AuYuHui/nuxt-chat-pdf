<script setup lang="tsx">
import type { FunctionalComponent } from 'nuxt/dist/app/compat/vue-demi'
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()

const dataSources = computed(() => chatStore.chatHistory)

interface IconProps {
  chat: Chat.History
}

const RenderDeleteIcon: FunctionalComponent<IconProps> = ({
  chat,
}) => {
  const slot = {
    reference: () => (
      <div>
        <el-tooltip
          effect="dark"
          content="删除记录"
          placement="bottom"
        >
          <el-icon class="cursor-pointer">
            <ElIconDelete />
          </el-icon>
        </el-tooltip>
      </div>
    ),
  }
  return (
    <el-popconfirm title="是否删除此记录?" hide-after={0} onConfirm={() => handleDelete(chat)}>
      {slot}
    </el-popconfirm>
  )
}

function handleClickHistory() {
  chatStore.addHistory({
    title: 'New Chat',
    isEdit: false,
    uuid: Date.now(),
  })
}

function handleEdit({ uuid }: Chat.History, isEdit: boolean) {
  chatStore.updateHistory(uuid, { isEdit })
}

function handleDelete({ uuid }: Chat.History) {
  chatStore.deleteHistory(uuid)
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
    <el-scrollbar class="w-full">
      <div v-for="chat in dataSources" :key="chat.uuid" class="w-full mt-2">
        <div class="flex items-center px-3 py-1 gap-x-2  bg-[--btnBgColor] text-[--text-color-primary] rounded-1">
          <div>
            <el-icon>
              <ElIconChatSquare />
            </el-icon>
          </div>
          <div class="flex-1">
            <div class="max-w-[200px] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
              {{ chat.title }}
            </div>
            <div class="flex justify-end">
              <ClientOnly>
                <el-tooltip effect="dark" content="编辑标题" placement="bottom">
                  <el-icon class="mr-3 cursor-pointer">
                    <ElIconEditPen @click.stop="handleEdit(chat, true)" />
                  </el-icon>
                </el-tooltip>
                <RenderDeleteIcon :chat="chat" />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped></style>
