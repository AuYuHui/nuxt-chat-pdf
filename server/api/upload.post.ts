import { copyFileSync } from "node:fs"
import { join } from "node:path"
import { readFiles } from "h3-formidable"
import { PineconeClient } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export default defineEventHandler(async (event) => {
  const {
		files: {
			document: [{ filepath, mimetype, newFilename }]
		}
	} = await readFiles(event, {
		includeFields: true
	});
	const newPath = `${join('docs', newFilename)}.${
		mimetype.split('/')[1]
	}`;
  copyFileSync(filepath, newPath);
  storeDocumentsInPinecone(filepath)
  return {
    code: 0,
    msg: 'success'
  }
})


export async function initPinecone() {
	const config = useRuntimeConfig();
	try {
		const pinecone = new PineconeClient();
		await pinecone.init({
			environment: config.PINECONE_ENVIRONMENT ?? '', // this is in the dashboard
			apiKey: config.PINECONE_API_KEY ?? ''
		});

		return pinecone;
	} catch (error) {
		throw new Error('Failed to initialize Pinecone Client');
	}
}

async function storeDocumentsInPinecone(filepath: string) {
	const config = useRuntimeConfig();
	const pinecone = await initPinecone();
	const embeddings = new OpenAIEmbeddings(
		{
			openAIApiKey: config.OPENAI_API_KEY,
			timeout: 60000,
			maxConcurrency: 5,
			stripNewLines: true,
			verbose: true
		},
		{
			basePath: 'https://openai.wndbac.cn/v1'
		}
	);
	const pineconeIndex = pinecone.Index(config.PINECONE_INDEX_NAME);
	const loader = new PDFLoader(filepath);

	const rawDocs = await loader.load();
  console.log(rawDocs);
    
	/* Split text into chunks */
	const textSplitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1536,
		chunkOverlap: 200
	});

	const docs = await textSplitter.splitDocuments(rawDocs);

	await PineconeStore.fromDocuments(docs, embeddings, {
		pineconeIndex,
		namespace: config.PINECONE_INDEX_NAME,
		textKey: 'text'
	});
}