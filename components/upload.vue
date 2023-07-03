<script setup lang="ts">
import { genFileId } from 'element-plus'
import type {
  UploadInstance,
  UploadProps,
  UploadRawFile,
  UploadUserFile,
} from 'element-plus'

export interface Props {
  visible: boolean // 可见性
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 1,
})

const emit = defineEmits<Emit>()

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const accept
  = 'application/pdf,.pdf,application/json,.json,text/plain,.txt,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,'

const dialogVisible = computed({
  get: () => props.visible,
  set: (visible: boolean) => {
    emit('update:visible', visible)
  },
})
const activeName = ref(0)
const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadUserFile[]>([])
const loading = ref(false)
const handleBeforeUpdate: UploadProps['beforeUpload'] = (rawFile) => {
  // 判断 文件类型是否是约束中的一种
  if (accept.includes(rawFile.type)) {
    return true
  }
  else if (Math.floor(rawFile.size / 1024 / 1024) > 10) {
    ElMessage.error('上传的文件大于10M,请重新选择上传')
  }
  else {
    ElMessage.error('上传失败，不符合上传文件类型')
    return false
  }
}

const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}
/**
 *
 * 自定义上传文件
 */
function handleHttpRequest() {
  loading.value = true
  return new Promise((resolve, reject) => {
    const fd = new FormData()
    Array.from(fileList.value).forEach((file) => {
      fd.append('document', file.raw as File)
    })

    $fetch('/api/upload', {
      method: 'POST',
      body: fd,
    })
      .then((res) => {
        ElMessage.success('上传成功')
        resolve(true)
        loading.value = false
      })
      .catch((err) => {
        reject(err)
        loading.value = false
      })
  })
}

function handleUpload() {
  uploadRef.value!.submit()
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加资料"
    width="50%"
  >
    <el-tabs v-model="activeName" type="border-card">
      <el-tab-pane label="上传文件" :name="0">
        <div class="flex flex-col items-center">
          <el-upload
            ref="uploadRef"
            v-model:file-list="fileList"
            action=""
            drag
            :accept="accept"
            :limit="props.limit"
            :auto-upload="false"
            :before-upload="handleBeforeUpdate"
            :on-exceed="handleExceed"
            :http-request="handleHttpRequest"
          >
            <el-icon class="el-icon--upload">
              <ElIconUploadFilled />
            </el-icon>
            <div class="el-upload__text">
              上传文件 <em>.txt .pdf .docx</em>
            </div>
          </el-upload>
          <el-button type="primary" :disabled="loading" :loading="loading" @click.stop="handleUpload">
            上传文件
          </el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="网页抓取" :name="1">
        网页抓取
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<style scoped></style>
