import { acceptHMRUpdate, defineStore } from 'pinia'
import { storageLocal } from '@pureadmin/utils'

const LOCAL_NAME = 'chat-history-store'

function defaultState(): Chat.ChatState {
  const uuid = 12138
  return {
    active: uuid,
    history: [
      { uuid, title: 'New Chat', isEdit: false, context: [] },
    ],
  }
}

function loadState(): Chat.ChatState {
  const localState = storageLocal().getItem<Chat.ChatState>(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export const useChatStore = defineStore('chat', {
  state: (): Chat.ChatState => loadState(),
  getters: {
    getCurrentHistory(state: Chat.ChatState) {
      const index = state.history.findIndex(item => item.uuid === state.active)
      if (index !== -1)
        return state.history[index]
      return null
    },
  },
  actions: {
    /**
   * 添加聊天记录在本地
   * @param history
   */
    addHistory(history: Chat.History) {
      this.history.unshift(history)
      this.active = history.uuid
      this.recordState()
    },
    /**
   * 更新记录
   * @param uuid 目标ID
   * @param edit 要更新的数据
   */
    updateHistory(uuid: number, edit: Partial<Chat.History>) {
      const index = this.history.findIndex(item => item.uuid === uuid)
      if (index !== -1)
        this.history[index] = { ...this.history[index], ...edit }

      this.recordState()
    },

    /**
   * 删除目标记录
   * @param uuid 要删除的记录ID
   */
    deleteHistory(uuid: number) {
      const index = this.history.findIndex(item => item.uuid === uuid)

      if (index !== -1)
        this.history.splice(index, 1)

      /** 判断 为空的情况下自动添加 */
      if (this.history.length === 0)
        return this.addHistory({ title: 'New Chat', uuid: Date.now(), isEdit: false, context: [] })

      if (index > 0 && index <= this.history.length) {
        const uuid = this.history[index - 1].uuid
        this.active = uuid
        return
      }

      if (index === 0 && this.history.length) {
        const uuid = this.history[0].uuid
        this.active = uuid
      }

      if (index > this.history.length) {
        const uuid = this.history[this.history.length - 1].uuid
        this.active = uuid
      }
      this.recordState()
    },
    /**
		 * 更新当前激活的聊天记录
		 * @param context 聊天记录
		 */
    updateHistoryContext(context: Chat.ChatData) {
      const index = this.history.findIndex(item => item.uuid === this.active)
      if (index !== -1) {
        this.history[index].context.push(context)
        this.recordState()
      }
    },

    /**
	 *
	 * @param uuid 设置当前激活的聊天记录
	 */
    setActive(uuid: number) {
      this.active = uuid
      this.recordState()
    },

    recordState() {
      storageLocal().setItem(LOCAL_NAME, this.$state)
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot))
