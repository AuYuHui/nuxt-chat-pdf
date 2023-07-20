// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
const lifecycle = process.env.npm_lifecycle_event

export default defineNuxtConfig({
  ssr: false,
  app: {

    // head
    head: {
      title: 'Nuxt-Chat-PDF',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: 'Langchain OpenAi Chroma Nuxt3 ',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  // css
  css: ['@unocss/reset/tailwind.css', '~/assets/scss/lib/index.scss', '~/assets/scss/index.scss'],

  // build modules
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@element-plus/nuxt',
    '@nuxtjs/color-mode',
  ],
  devtools: { enabled: true },

  build: {
    transpile: lifecycle === 'build' ? ['element-plus'] : [],
  },

  // vueuse
  vueuse: {
    ssrHandlers: true,
  },

  // colorMode
  colorMode: {
    classSuffix: '',
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/element/index.scss" as element;',
        },
      },
    },
    server: {
      open: true,
      proxy: {
        '/picture': {
          target: 'http://192.168.10.142:7860',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/picture/, ''),
        },
      },
    },
  },
  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss',
    themes: ['dark'],
  },
  postcss: {
    plugins: {
      '@unocss/postcss': {
        content: ['**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}'],
      },
    },
  },

  typescript: {
    strict: true,
    shim: false,
    tsConfig: {
      include: ['/typings/*.d.ts'],
    },
  },
})
