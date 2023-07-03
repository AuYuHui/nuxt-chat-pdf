import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { WebPageLoader } from '~/utils/loaders/web-page'

export default defineEventHandler(async (event) => {
  const { url } = await readBody<{ url: string }>(event)
  const web_page = new WebPageLoader()

  const content = await web_page.load_data(url.trim())
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
    keepSeparator: false,
  })

  console.log('content', content)

  return 'Hello webpage'
})
