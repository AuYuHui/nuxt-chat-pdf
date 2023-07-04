<script setup lang="tsx">
import { v4 as uuidv4 } from 'uuid'
import { createChunkDecoder } from '~/utils/utils'
import { useChatStore } from '~/stores/chat'
import { ClientOnly } from '#components'

const chatStore = useChatStore()
const prompt = ref('')
const currentChatHistory = computed(() => chatStore.getCurrentHistory)
const controller = new AbortController()

async function fetchChatStream() {
  const res = await fetch('/api/chat', {
    method: 'POST',
    signal: controller.signal,
    body: JSON.stringify({
      prompt: prompt.value,
      messages: currentChatHistory.value?.context || [],
    }),
  })
  let result = ''
  const reader = res.body!.getReader()
  const decoder = createChunkDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break
    result += decoder(value)
    // 更新聊天信息
    chatStore.updateHistoryContext(currentChatHistory.value!.context.length - 1, {
      content: result,
      loading: false,
    })
    if (controller === null) {
      reader.cancel()
      break
    }
  }
}

const isGoogle = ref(false)

/**
 * 渲染图标
 */
function RenderClearIcon() {
  return (
		<ClientOnly>
			<el-tooltip
				effect="dark"
				content="清理对话上下文"
				placement="top-start"
			>
				<button class="hover:bg-[#f1f5f9] w-8 h-8 rounded-1">
					<i class="i-icon-park-outline:clear w-4"></i>
				</button>
			</el-tooltip>
		</ClientOnly>
  )
}
/**
 * 渲染图标
 */
function RenderGoogleIcon() {
  return (
		<ClientOnly>
			<el-tooltip
				effect="dark"
				content="启用Google搜索,增强AI回答实时性"
				placement="top-start"
			>
				<button class={['w-8 h-8 rounded-1 flex-c', isGoogle.value ? 'bg-[#f1f5f9]' : 'hover:bg-[#f1f5f9]']} onClick={() => isGoogle.value = !isGoogle.value}>
					<i class={['i-icon-park-outline:google w-4', { 'text-[#DD4B39]': isGoogle.value }] }></i>
				</button>
			</el-tooltip>
		</ClientOnly>
  )
}
/**
 * 渲染图标
 */
function RenderIcon() {
  return (
		<>
			<RenderClearIcon />
			<RenderGoogleIcon />
		</>
  )
}
/** 发送信息 */
function handleSend() {
  if (!prompt.value)
    return
  chatStore.addHistoryContext({
    content: prompt.value,
    id: uuidv4(),
    role: 'user',
  })
  fetchChatStream()
  chatStore.addHistoryContext({
    content: '',
    id: uuidv4(),
    role: 'assistant',
    loading: true,
  })
  prompt.value = ''
}
</script>

<template>
  <div class="flex h-full">
    <ChatSlider />
    <div class="flex-grow flex flex-col justify-between border-l-1">
      <ChatMessage :context="currentChatHistory?.context" />
      <div class="border-t-1 bg-white py-[10px] px-[20px]">
        <el-input
          v-model="prompt"
          :autosize="{ minRows: 3, maxRows: 10 }"
          type="textarea"
          placeholder="输入问题"
          resize="none"
        />
        <div class="flex-cb pt-2">
          <div class="flex">
            <RenderIcon />
          </div>
          <el-button type="primary" :disabled="!prompt" :icon="ElIconPosition" @click="handleSend()">
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
