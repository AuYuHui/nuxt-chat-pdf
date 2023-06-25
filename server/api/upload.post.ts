import { copyFileSync } from "node:fs";
import { join } from "node:path";
import { readFiles } from "h3-formidable";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { JSONLoader } from "langchain/document_loaders/fs/json";
export default defineEventHandler(async (event) => {
  const {
    files: {
      document: [{ filepath, mimetype, newFilename }],
    },
  } = await readFiles(event, {
    includeFields: true,
  });
  const newPath = `${join("docs", newFilename)}.${mimetype.split("/")[1]}`;
  console.log({ filepath, mimetype, newFilename });

  copyFileSync(filepath, newPath);
  await storeDocumentsInPinecone(filepath, mimetype);
  return {
    code: 0,
    msg: "success",
  };
});

export async function initPinecone() {
  const config = useRuntimeConfig();
  try {
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: config.PINECONE_ENVIRONMENT ?? "", // this is in the dashboard
      apiKey: config.PINECONE_API_KEY ?? "",
    });

    return pinecone;
  } catch (error) {
    throw new Error("Failed to initialize Pinecone Client");
  }
}

async function storeDocumentsInPinecone(filepath: string, mimetype: string) {
  return new Promise(async (resolve, reject) => {
    const config = useRuntimeConfig();
    const pinecone = await initPinecone();
    const embeddings = new OpenAIEmbeddings(
      {
        openAIApiKey: config.OPENAI_API_KEY,
        timeout: 60000,
        maxConcurrency: 5,
        stripNewLines: true,
        verbose: true,
      },
      {
        basePath: "https://openai.wndbac.cn/v1",
      }
    );
    const pineconeIndex = pinecone.Index(config.PINECONE_INDEX_NAME);
    let loader = null;
    // 判断不同文件类型加载不同的 loader
    switch (mimetype) {
      case "application/pdf":
        loader = new PDFLoader(filepath);
        break;
      case "text/plain":
        loader = new TextLoader(filepath);
        break;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": // i.e. docx file
        loader = new DocxLoader(filepath);
        break;
      case "application/json": // i.e. docx file
        loader = new JSONLoader(filepath);
        break;
      default:
        throw new Error("Unsupported file type");
    }

    const rawDocs = await loader.load();
    // console.log(rawDocs);

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1536,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);

    try {
      await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex,
        namespace: config.PINECONE_INDEX_NAME,
        textKey: "text",
      });
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}
