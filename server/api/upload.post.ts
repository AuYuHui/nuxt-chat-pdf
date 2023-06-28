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

export default defineEventHandler(async (event) => {
  const {
    files: {
      document: [{ filepath, mimetype, newFilename }],
    },
  } = await readFiles(event, {
    includeFields: true,
  })
  await storeDocumentsInChroma(filepath, mimetype, newFilename)
  return {
    code: 0,
    msg: 'success',
    collection: newFilename as string,
  }
})

async function storeDocumentsInChroma(
  filepath: string,
  mimetype: string,
  collectionName: string,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const config = useRuntimeConfig()
      const embeddings = new OpenAIEmbeddings(
        {
          openAIApiKey: config.OPENAI_API_KEY,
        },
        {
          basePath: 'https://openai.wndbac.cn/v1',
        },
      )
      console.log('fileLoader')

      const loader = switchFileLoader(filepath, mimetype)

      const rawDocs = await loader.load()

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      })
      const docs = await textSplitter.splitDocuments(rawDocs)
      console.log('create collection ')

      await Chroma.fromDocuments(docs, embeddings, {
        collectionName,
      })
      console.log('升级成功')

      resolve(true)
    }
    catch (error) {
      console.log('error', error)
      reject(false)
      throw new Error('Failed to ingest your data')
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
