<template>
  <div class="flex h-full">
    <div class="w-200px overflow-hidden">
      <Upload @success="handleSuccess"></Upload>
    </div>
    <div class="flex-1">
      <Chat :history="history"></Chat>
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="3"
        resize="none"
        placeholder="Please input"
      />
      <el-button
        type="primary"
        class="mt-2"
        :loading="loading"
        :disabled="loading"
        @click="handleQuery"
        >发送</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  AIChatMessage,
  BaseChatMessage,
  ChainValues,
  HumanChatMessage,
} from "langchain/schema";
const prompt = ref("");
const loading = ref(false);
const collectionName = ref("2cbe0ac9c68b0f836567d1b00");
const history = ref<Array<BaseChatMessage>>([]);
async function handleQuery() {
  const ctrl = new AbortController();
  let text = "";
  try {
    loading.value = true;
    history.value.push(new HumanChatMessage(prompt.value));

    $fetch("/api/query", {
      method: "POST",
      body: JSON.stringify({
        prompt: prompt.value,
        history: history.value,
        collectionName: collectionName.value,
      }),
    }).then((res) => {
      const { text } = res.data as ChainValues;
      history.value.push(new AIChatMessage(text));
    });

    loading.value = false;
    prompt.value = "";
  } catch (error) {
    loading.value = false;
    prompt.value = "";
    console.log("error", error);
  }
}

function handleSuccess(val: string) {
  collectionName.value = val;
}
</script>

<style scoped></style>
