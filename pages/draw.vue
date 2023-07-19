<script setup lang="ts">
import { ref } from 'vue'
import { toRefs } from '@vueuse/core'
import { useDrauu } from '@vueuse/integrations/useDrauu'
import { Canvg } from 'canvg'

const target = ref<SVGElement | null>(null)
// 提示词
const prompt = ref('')
const loading = ref(false)
const image = ref('')
const srcList = ref<string[]>([])
const { undo, redo, clear, brush } = useDrauu(target, {
  brush: {
    color: '#000000',
    size: 3,
  },
})
const { mode, size, dasharray } = toRefs(brush)

function download() {
  return new Promise((resolve) => {
    if (!target.value)
      return
    target.value.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const data = target.value.outerHTML.trim()
    const { width, height } = target.value.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.style.zIndex = '0'
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    const v = Canvg.fromString(ctx!, data)
    v.start()
    const img = canvas.toDataURL('img/png')
    resolve(img)
  })
}

async function Generate() {
  if (!prompt.value)
    return
  loading.value = true
  const encoded_image = await download()
  const payload = {
    prompt: prompt.value,
    override_settings: {
      sd_model_checkpoint: 'chilloutmix_NiPrunedFp32.safetensors',
    },
    alwayson_scripts: {
      controlnet: {
        args: [
          {
            enabled: true,
            input_image: encoded_image,
            module: 'canny',
            processor_res: 512,
            model: 't2iadapter_canny_sd15v2 [cecee02b]',
          },
          {
            enabled: true,
            input_image: encoded_image,
            module: 'scribble_xdog',
            processor_res: 512,
            model: 'control_scribble-fp16 [c508311e]',
          },
        ],
      },
    },
  }
  try {
    const response = await fetch('http://192.168.10.144:3000/picture/sdapi/v1/txt2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const images = await response.json()
    const blob = b64toBlob(images.images[0])
    image.value = URL.createObjectURL(blob)
    srcList.value.push(URL.createObjectURL(blob))
  }
  finally {
    loading.value = false
  }
}

function b64toBlob(b64Data: string, contentType = 'image/png', sliceSize = 512) {
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++)
      byteNumbers[i] = slice.charCodeAt(i)

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}
</script>

<template>
  <div class="w-full h-full flex flex-col  select-none bg-white">
    <div class="h-[170px] p-2">
      <el-input
        v-model="prompt"
        :rows="2"
        type="textarea"
        resize="none"
        placeholder="Please input"
      />
      <el-button type="primary" :loading="loading" class="ml-auto mt-2" @click="Generate">
        Generate
      </el-button>
      <el-image v-if="image" :src="image" :preview-src-list="srcList" style="width: 100px; height: 100px;" />
    </div>
    <div class="flex flex-col flex-auto draw">
      <div class="px-6 p-3 border-b border-gray-200 flex flex-wrap gap-0.5 children:align-middle children:my-auto">
        <button aria-label="撤销" title="撤销" @click="undo">
          ↩️
        </button>
        <button aria-label="恢复" title="恢复" @click="redo">
          ↪️
        </button>
        <button aria-label="清空" title="清空" @click="clear">
          🗑
        </button>
        <div class="mx-4 opacity-25">
          /
        </div>
        <button id="m-stylus" class="active" aria-label="Stylus" title="Stylus" @click="mode = 'stylus'">
          ✍️
        </button>
        <button id="m-draw" aria-label="Draw" title="Draw" @click="mode = 'draw'">
          ✏️
        </button>
        <button id="m-line" aria-label="Line" title="Line" @click="mode = 'line'">
          ⁄
        </button>
        <button id="m-rect" aria-label="Rect" title="Rect" @click="mode = 'rectangle'">
          ⃞
        </button>
        <button id="m-ellipse" aria-label="Ellipse" title="Ellipse" @click="mode = 'ellipse'">
          ⃝
        </button>
        <button id="m-eraser" aria-label="Eraser" title="橡皮擦" @click="mode = 'eraseLine'">
          🧹
        </button>
        <div class="mx-4 opacity-25">
          /
        </div>
        <input v-model="size" type="range" min="1" max="10" step="0.5" name="Size" title="Size">
        <div class="mx-4 opacity-25">
          /
        </div>
        <button id="l-solid" class="active" aria-label="Solid" title="Solid" @click="dasharray = undefined">
          —
        </button>
        <button id="l-dashed" aria-label="Dashed" title="Dashed" @click="dasharray = '4'">
          ┅
        </button>
        <button id="l-dotted" aria-label="Dotted" title="Dotted" @click="dasharray = '1 7'">
          ⋯
        </button>
        <div class="mx-4 opacity-25">
          /
        </div>
      </div>
      <svg ref="target" class="w-full flex-auto z-10" style="touch-action: none" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.draw button {
  @apply !outline-none w-8 h-8;

  &.active {
    @apply bg-gray-100 rounded;
  }

  &:focus {
    @apply bg-gray-200;
  }

}
</style>
