<script setup lang="ts">
export interface Props {
  context: Array<Chat.ChatData>
}

withDefaults(defineProps<Props>(), {
  context: () => [],
})
</script>

<template>
  <div class="flex-grow bg-white overflow-hidden">
    <el-scrollbar class="p-3">
      <div
        v-for="(item, index) in context"
        :key="index"
        class="bubble"
        :class="[item.role === 'user' ? 'justify-end' : 'justify-start']"
      >
        <div :class="[item.role === 'user' ? 'bubble-user break-words' : 'bubble-ai']">
          {{ item.content }}
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.bubble {
	display: flex;
	box-sizing: border-box;
	margin-top: 10px;
	overflow: hidden;
}
.bubble-user {
	max-width: 100%;
	padding: 10px;
	color: #5C6CFF;
	border-radius: 10px 10px 0 10px;
	background-color:rgba(92,108,255,0.15);
	word-break: break-word;
	user-select: text;
	box-sizing: border-box;
}
.bubble-ai {
	max-width: 100%;
	padding: 10px;
	border-radius: 0 10px 10px 10px;
	color: #232A35;
	background-color:rgb(242, 242, 242);
	word-break: break-word;
	user-select: text;
	box-sizing: border-box;
}
</style>
