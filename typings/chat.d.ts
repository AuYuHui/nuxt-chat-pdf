declare namespace Chat {

  interface History {
    title: string
    isEdit: boolean
    uuid: number
		context: Message[]
		loading?: boolean,
	}

	interface ChatState {
    active: number | null
    history: History[]
  }

}
