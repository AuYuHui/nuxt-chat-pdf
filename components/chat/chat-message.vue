<script setup lang="ts">
import { ElScrollbar } from 'element-plus'

export interface Props {
  context: Chat.Context[]
}

const props = withDefaults(defineProps<Props>(), {
  context: () => [],
})

const innerRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

watch(() => props.context, () => {
  nextTick(() => scrollToBottom())
}, {
  deep: true,
})
function scrollToBottom() {
  if (innerRef.value) {
    const scrollHeight = innerRef.value.scrollHeight
    scrollbarRef.value!.setScrollTop(scrollHeight)
  }
}

onMounted(() => {
  nextTick(() => scrollToBottom())
})
</script>

<template>
  <div class="flex-grow bg-white overflow-hidden">
    <ElScrollbar ref="scrollbarRef" class="p-3">
      <div ref="innerRef">
        <div
          v-for="item in context"
          :key="item.id"

          class="bubble markdown-body"
          :class="[item.role === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div :class="[item.role === 'user' ? 'bubble-user' : 'bubble-ai']">
            <span v-if="item.role !== 'user' && item.loading" class="i-svg-spinners:3-dots-bounce w-6 h-6" />
            <div v-html="md.render(item.content)" />
          </div>
        </div>
      </div>
    </ElScrollbar>
  </div>
</template>

<style  lang="scss">
@import "./style.scss";
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
