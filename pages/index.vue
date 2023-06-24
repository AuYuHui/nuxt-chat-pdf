<template>
  <div class="flex h-full">
    <div class="max-w-200px overflow-hidden">
      <Upload></Upload>
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
const prompt = ref("");
const loading = ref(false);
const history = ref<
  Array<{
    role: string;
    content: string;
  }>
>([]);
async function handleQuery() {
  const ctrl = new AbortController();
  let text = "";
  try {
    loading.value = true;
    history.value.push({
      role: "user",
      content: prompt.value,
    });
    history.value.push({
      role: "assistant",
      content: "",
    });
    fetchEventSource("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt.value,
        history: history.value,
      }),
      signal: ctrl.signal,
      onmessage: (event) => {
        if (event.data === "[DONE]") {
          console.log("[DONE]", event.data);
          ctrl.abort();
        } else {
          const data = JSON.parse(event.data);
          history.value[history.value.length - 1] = {
            role: "assistant",
            content: (text += data.data),
          };
        }
        console.log("[event]", event.data);
      },
    });

    loading.value = false;
    prompt.value = "";
  } catch (error) {
    console.log("error", error);
  }
}
</script>

<style scoped></style>
