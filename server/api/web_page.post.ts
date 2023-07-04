import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { Chroma } from 'langchain/vectorstores/chroma'
import { ensureCollectionName } from '~/utils/utils'
import { WebPageLoader } from '~/utils/loaders/web-page'

export const runtime = 'edge'

export default defineEventHandler(async (event) => {
  const { url } = await readBody<{ url: string }>(event)
  const web_page = new WebPageLoader()
  const embeddings = new OpenAIEmbeddings(
    {
      openAIApiKey: process.env.OPENAI_API_KEY,
    },
    {
      basePath: process.env.OPENAI_PROXY_URL,
    },
  )
  const datas = await web_page.load_data(url.trim())
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
    keepSeparator: false,
  })
  const collectionName = ensureCollectionName()
  for (const data of datas) {
    const rawDocs = new Document(data)

    const docs = await textSplitter.splitDocuments([rawDocs])
    const chroma = new Chroma(embeddings, { collectionName })
    await chroma.index?.reset()

    for (let i = 0; i < docs.length; i += 100) {
      const batch = docs.slice(i, i + 100)
      try {
        await Chroma.fromDocuments(batch, embeddings, {
          collectionName,
        })
      }
      catch (error) {
        console.log('fromDocumentserror', error)
      }
    }
  }

  return {
    code: 0,
    msg: 'success',
    collection: collectionName,
  }
})