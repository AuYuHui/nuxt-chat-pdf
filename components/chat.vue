<template>
  <div>
    <ul>
      <li
        v-for="item in history"
        class="-ml-4 px-4 transition-colors md:hover:bg-slate/3"
      >
        <div class="py-2 -mx-4 px-4 transition-colors md:hover:bg-slate/3">
          <div class="flex gap-3 rounded-lg op-75">
            <div
              class="shrink-0 w-7 h-7 rounded-full op-80 bg-gradient-to-r"
              :class="
                item.role === 'user'
                  ? 'from-purple-400 to-yellow-400'
                  : 'from-yellow-200 via-green-200 to-green-300'
              "
            ></div>
            <div class="message prose break-words overflow-hidden">
              <p>{{ item.content }}</p>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  history: Array<{
    role: string;
    content: string;
  }>;
}

const props = withDefaults(defineProps<Props>(), {
  history: () => [],
});
</script>

<style scoped></style>
