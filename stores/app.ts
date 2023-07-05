import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    APIKey: '', // OpenAI API Key
    SerpAPIKey: '', // SerpAPI Key
  }),
  actions: {
    /**
		 * 设置 OpenAI API Key
		 * @param APIKey OpenAI API Key
		 */
    SET_API_KEY(APIKey: string) {
      this.APIKey = APIKey
    },
    /**
		 * 设置搜索 API Key
		 * @param SerpAPIKey SerpAPI Key
		 */
    SET_SERP_API_KEY(SerpAPIKey: string) {
      this.SerpAPIKey = SerpAPIKey
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot))
