import type { Message } from "ai"



declare namespace Chat {
  interface History {
    title: string
    isEdit: boolean
    uuid: number
		context: Context[]
		loading?: boolean,
	}

	interface ChatState {
    active: number | null
    history: History[]
  }
	type Context = Message & {
		loading?: boolean
	}
}


export = Chat
export as namespace Chat
