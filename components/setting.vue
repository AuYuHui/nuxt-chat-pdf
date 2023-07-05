<script setup lang="ts">
import { useAppStore } from '~/stores/app'

export interface Props {
  visible: boolean // 可见性
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

const emit = defineEmits<Emit>()

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const appStore = useAppStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (visible: boolean) => {
    emit('update:visible', visible)
  },
})
const form = reactive({
  APIKey: '',
  SerpAPI: '',
})

function handleChangeAPIKey(val: string) {
  appStore.SET_API_KEY(val)
}
function handleChangeSerpAPI(val: string) {
  appStore.SET_SERP_API_KEY(val)
}
</script>

<template>
  <div>
    <el-dialog v-model="dialogVisible" title="设置" width="30%" draggable>
      <el-form
        label-width="100px"
        :model="form"
        style="max-width: 800px"
      >
        <el-form-item label="API Key">
          <el-input v-model="form.APIKey" placeholder="OpenAI API Key" show-password @input="handleChangeAPIKey" />
        </el-form-item>
        <el-form-item label="SerpAPI KEY">
          <el-input v-model="form.SerpAPI" placeholder="SerpAPI KEY" show-password @input="handleChangeSerpAPI" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped>

</style>
