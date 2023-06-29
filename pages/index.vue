<script setup lang="ts">
import type { BaseChatMessage, ChainValues } from 'langchain/schema'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'

const prompt = ref('')
const loading = ref(false)
const collectionName = ref('2cbe0ac9c68b0f836567d1b00')
const history = ref<Array<BaseChatMessage>>([])
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
    <ChatMessage />
  </div>
</template>

<style scoped></style>
