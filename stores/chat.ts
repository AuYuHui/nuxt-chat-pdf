import { acceptHMRUpdate, defineStore, skipHydrate } from 'pinia'
import { useIDBKeyval } from '@vueuse/integrations/useIDBKeyval'

const DBName = 'chat-history-store'

export const useChatStore = defineStore('chat', () => {
  const { data: chatHistory } = useIDBKeyval<Chat.History[]>(DBName, [])
  const active = ref(12138)
  /**
   * 添加聊天记录在本地
   * @param history
   */
  function addHistory(history: Chat.History) {
    chatHistory.value.unshift(history)
    active.value = history.uuid
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

    /** 判断 为空的情况下自动添加 */
    if (chatHistory.value.length === 0)
      return addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false })

    if (index > 0 && index <= chatHistory.value.length) {
      const uuid = chatHistory.value[index - 1].uuid
      active.value = uuid
      return
    }

    if (index === 0 && chatHistory.value.length) {
      const uuid = chatHistory.value[0].uuid
      active.value = uuid
    }

    if (index > chatHistory.value.length) {
      const uuid = chatHistory.value[chatHistory.value.length - 1].uuid
      active.value = uuid
    }
  }
  /**
	 *
	 * @param uuid 设置当前激活的聊天记录
	 */
  function setActive(uuid: number) {
    active.value = uuid
  }

  return {
    chatHistory: skipHydrate(chatHistory), // https://pinia.vuejs.org/zh/cookbook/composables.html
    active,
    setActive,
    addHistory,
    updateHistory,
    deleteHistory,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot))
