import { readFiles } from 'h3-formidable'
import { Chroma } from 'langchain/vectorstores/chroma'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import {
  JSONLinesLoader,
  JSONLoader,
} from 'langchain/document_loaders/fs/json'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { DocxLoader } from 'langchain/document_loaders/fs/docx'
import type { BaseDocumentLoader } from 'langchain/document_loaders/base'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { ensureCollectionName } from '~/utils/utils'

export const runtime = 'edge'

export default defineEventHandler(async (event) => {
  const {
    files: {
      document: [{ filepath, mimetype }],
    },
  } = await readFiles(event, {
    includeFields: true,
  })
  const collectionName = ensureCollectionName()
  await storeDocumentsInChroma(filepath, mimetype, collectionName)
  return {
    code: 0,
    msg: 'success',
    collection: collectionName,
  }
})

async function storeDocumentsInChroma(
  filepath: string,
  mimetype: string,
  collection: string,
) {
  return new Promise<boolean>(async (resolve, reject) => {
    try {
      const embeddings = new OpenAIEmbeddings(
        {
          openAIApiKey: process.env.OPENAI_API_KEY,
        },
        {
          basePath: process.env.OPENAI_PROXY_URL,
        },
      )

      const loader = switchFileLoader(filepath, mimetype)

      const rawDocs = await loader.load()

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      })
      const docs = await textSplitter.splitDocuments(rawDocs)

      /** The name must start and end with a lowercase letter or a digit, and it can contain dots, dashes, and underscores in between. */
      const chroma = new Chroma(embeddings, { collectionName: collection })
      await chroma.index?.reset()

      for (let i = 0; i < docs.length; i += 100) {
        const batch = docs.slice(i, i + 100)
        try {
          await Chroma.fromDocuments(batch, embeddings, {
            collectionName: collection,
          })
        }
        catch (error) {
          console.log('fromDocumentserror', error)
        }
      }

      resolve(true)
    }
    catch (error) {
      reject(new Error('Failed to ingest your data'))
    }
  })
}

function switchFileLoader(filepath: string, mimetype: string) {
  let loader: BaseDocumentLoader
  // 判断不同文件类型加载不同的 loader
  switch (mimetype) {
    case 'application/pdf':
      loader = new PDFLoader(filepath)
      break
    case 'text/plain':
      loader = new TextLoader(filepath)
      break
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': // i.e. docx file
      loader = new DocxLoader(filepath)
      break
    case 'application/msword':
      loader = new DocxLoader(filepath)
      break
    case 'text/csv':
      loader = new CSVLoader(filepath, 'text')
      break
    case 'application/json':
      loader = new JSONLoader(filepath, '/texts')
      break
    case 'application/ld+json':
      loader = new JSONLinesLoader(filepath, '/html')
      break
    default:
      throw new Error('Unsupported file type')
  }

  return loader
}
