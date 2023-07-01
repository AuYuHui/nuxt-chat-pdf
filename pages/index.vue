<script setup lang="tsx">
import type { BaseChatMessage, ChainValues } from 'langchain/schema'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'
import { ClientOnly } from '#components'

const prompt = ref('')
const loading = ref(false)
const collectionName = ref('')
const isGoogle = ref(false)
const history = ref<Array<BaseChatMessage>>([])
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

function RenderIcon() {
  return (
		<>
			<RenderClearIcon />
			<RenderGoogleIcon />
		</>
  )
}

async function handleQuery() {
  const ctrl = new AbortController()
  const text = ''
  try {
    loading.value = true
    history.value.push(new HumanChatMessage(prompt.value))

    $fetch('/api/query', {
      method: 'POST',
      body: JSON.stringify({
        prompt: prompt.value,
        history: history.value,
        collectionName: collectionName.value,
      }),
    }).then((res) => {
      const { text } = res.data as ChainValues
      history.value.push(new AIChatMessage(text))
    })

    loading.value = false
    prompt.value = ''
  }
  catch (error) {
    loading.value = false
    prompt.value = ''
  }
}

function handleSuccess(val: string) {
  collectionName.value = val
}
</script>

<template>
  <div class="flex h-full">
    <ChatSlider />
    <div class="flex-grow flex flex-col justify-between border-l-1">
      <ChatMessage />
      <div class="border-t-1 bg-white py-[10px] px-[20px]">
        <el-input
          v-model="prompt" :autosize="{ minRows: 3, maxRows: 10 }" type="textarea" placeholder="输入问题"
          resize="none"
        />
        <div class="flex-cb pt-2">
          <div class="flex">
            <RenderIcon />
          </div>
          <el-button type="primary" :disabled="!prompt" :icon="ElIconPosition">
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
