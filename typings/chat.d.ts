declare namespace Chat {

	interface ChatData {
		content: string,
		role: "user" | "system" | "assistant";
    loading?: boolean
  }

  interface History {
    title: string
    isEdit: boolean
    uuid: number
		context: ChatData[]
		loading?: boolean,
	}

	interface ChatState {
    active: number | null
    history: History[]
  }

}
