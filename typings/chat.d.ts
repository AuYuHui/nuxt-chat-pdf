declare namespace Chat {

  interface ChatData {
    uuid?: number
    dateTime: string
    text: string
    inversion?: boolean
    error?: boolean
    loading?: boolean
		role?: string;
  }

  interface History {
    title: string
    isEdit: boolean
    uuid: number
    loading?: boolean
  }

}
