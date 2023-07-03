import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { v4 as uuidv4 } from 'uuid'
import { WebPageLoader } from '~/utils/loaders/web-page'

export default defineEventHandler(async (event) => {
  const { url } = await readBody<{ url: string }>(event)
  const web_page = new WebPageLoader()

  const datas = await web_page.load_data(url.trim())
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
    keepSeparator: false,
  })
  const documents = []
  const ids = []
  const metadatas = []
  for (const data of datas) {
    const content = data.pageContent
    const meta_data = data.metadata
    if (content) {
      const chunks = await textSplitter.splitText(content)
      for (const chunk of chunks) {
        const chunk_id = uuidv4()
        ids.push(chunk_id)
        documents.push(chunk)
        metadatas.push(meta_data)
      }
      console.log('documents', documents)
      console.log('ids', ids)
      console.log('metadatas', metadatas)
    }
  }

  return 'Hello webpage'
})
