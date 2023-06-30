<script setup lang="tsx">
import type { FunctionalComponent } from 'vue-demi'
import { vOnClickOutside } from '@vueuse/components'
import { ClientOnly } from '#components'
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
			<el-icon class="cursor-pointer">
				<ElIconDelete />
			</el-icon>
    ),
  }
  return (
		<ClientOnly>
			<el-popconfirm title="是否删除此记录?" hide-after={0} onConfirm={() => handleDelete(chat)}>
				{slot}
			</el-popconfirm>
		</ClientOnly>
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

function handleEnter({ uuid }: Chat.History, isEdit: boolean) {
  chatStore.updateHistory(uuid, { isEdit })
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
            <div class="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap font-500">
              <el-input
                v-if="chat.isEdit" v-model="chat.title"
                v-on-click-outside="() => chat.title && (chat.isEdit = false)" size="small" maxlength="50"
                @keyup.enter.stop="handleEnter(chat, false)"
              />
              <span v-else>{{ chat.title }}</span>
            </div>
            <div class="flex justify-end">
              <ClientOnly>
                <el-icon class="mr-3 cursor-pointer">
                  <ElIconEditPen @click.stop="handleEdit(chat, true)" />
                </el-icon>
              </ClientOnly>
              <RenderDeleteIcon :chat="chat" />
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped></style>
