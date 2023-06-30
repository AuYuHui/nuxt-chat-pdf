import { acceptHMRUpdate, defineStore, skipHydrate } from 'pinia'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'

const DBName = 'chat-history-store'

export const useChatStore = defineStore('chat', () => {
  const { data: chatHistory } = useIDBKeyval<Chat.History[]>(DBName, [])

  /**
   * 添加聊天记录在本地
   * @param history
   */
  function addHistory(history: Chat.History) {
    chatHistory.value.unshift(history)
  }
  /**
   * 更新记录
   * @param uuid 目标ID
   * @param edit 要更新的数据
   */
  function updateHistory(uuid: number, edit: Partial<Chat.History>) {
    const index = chatHistory.value.findIndex(item => item.uuid === uuid)
    if (index !== -1)
      chatHistory.value[index] = { ...chatHistory.value[index], ...edit }
  }

  /**
   * 删除目标记录
   * @param uuid 要删除的记录ID
   */
  function deleteHistory(uuid: number) {
    const index = chatHistory.value.findIndex(item => item.uuid === uuid)
    if (index !== -1)
      chatHistory.value.splice(index, 1)
  }

  return {
    chatHistory: skipHydrate(chatHistory), // https://pinia.vuejs.org/zh/cookbook/composables.html
    addHistory,
    updateHistory,
    deleteHistory,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot))
