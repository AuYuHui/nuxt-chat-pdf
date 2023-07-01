<script setup lang="tsx">
import type { FunctionalComponent } from 'vue-demi'
import { vOnClickOutside } from '@vueuse/components'
import { ClientOnly } from '#components'
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()

const dataSources = computed(() => chatStore.history)

interface IconProps {
  chat: Chat.History
}

const RenderDeleteIcon: FunctionalComponent<IconProps> = ({
  chat,
}) => {
  const slot = {
    reference: () => (
			<el-icon class="cursor-pointer hover:text-[--text-color-primary]">
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
    context: [],
  })
}

function handleEdit({ uuid }: Chat.History, isEdit: boolean) {
  chatStore.updateHistory(uuid, { isEdit })
}

function handleDelete({ uuid }: Chat.History) {
  chatStore.deleteHistory(uuid)
}

function handleEnter({ uuid, title }: Chat.History, isEdit: boolean) {
  if (title)
    chatStore.updateHistory(uuid, { isEdit })
}

function handleSelect(uuid: number) {
  if (isActive(uuid))
    return
  chatStore.setActive(uuid)
}

function isActive(uuid: number) {
  return chatStore.active === uuid
}
</script>

<template>
  <div class="bg-white min-w-[260px] h-full flex-col-c py-5 px-2">
    <!-- 创建聊天 -->
    <div
      class="flex-c w-full h-10 rounded-1 text-center line-height-10 cursor-pointer bg-[--btnBgColor] text-[--text-color-primary]"
      @click="handleClickHistory"
    >
      <el-icon class="mr-1">
        <ElIconCirclePlus />
      </el-icon>
      创建聊天
    </div>

    <!-- 历史 记录 -->
    <el-scrollbar class="w-full">
      <div v-for="chat in dataSources" :key="chat.uuid" class="w-full mt-2">
        <div
          class="flex items-center px-3 py-1 gap-x-2  rounded-1 h-[55px] text-[--text-silder-color]"
          :class="isActive(chat.uuid) ? 'bg-[--btnBgColor]' : 'bg-[#F3F5FB] hover:bg-[--btnBgColor]'"
          @click="handleSelect(chat.uuid)"
        >
          <div>
            <el-icon>
              <ElIconChatSquare />
            </el-icon>
          </div>
          <div class="flex-1 flex flex-col justify-between h-full cursor-pointer">
            <div class="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap font-500 mb-1" :class="{ 'text-[--text-color-primary]': isActive(chat.uuid) }">
              <el-input
                v-if="chat.isEdit" v-model="chat.title"
                v-on-click-outside="() => handleEnter(chat, false)" size="small" maxlength="50"
                @keyup.enter.stop="handleEnter(chat, false)"
              />
              <span v-else>{{ chat.title }}</span>
            </div>
            <div v-if="isActive(chat.uuid)" class="flex justify-end">
              <el-icon class="mr-3 cursor-pointer hover:text-[--text-color-primary]">
                <ElIconEditPen @click.stop="handleEdit(chat, true)" />
              </el-icon>
              <RenderDeleteIcon :chat="chat" />
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>

</style>
