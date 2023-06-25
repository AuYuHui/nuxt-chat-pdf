import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  setHeader(event, "cache-control", "no-cache");
  setHeader(event, "connection", "keep-alive");
  setHeader(event, "content-type", "text/event-stream");

  const body = await readBody<{
    prompt: string;
    history: any[];
  }>(event);
  const pinecone = await initPinecone();
  const pineconeIndex = pinecone.Index(config.PINECONE_INDEX_NAME);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(
      { openAIApiKey: config.OPENAI_API_KEY },
      {
        basePath: "https://openai.wndbac.cn/v1",
      }
    ),
    {
      pineconeIndex,
      textKey: "text",
      namespace: config.PINECONE_INDEX_NAME,
    }
  );

  // /* Search the vector DB independently with meta filters */
  const sanitizedQuestion = `${body.prompt.trim().replaceAll("\n", " ")}`;
  /** 做相似性搜索 */
  await vectorStore.similaritySearch(sanitizedQuestion);

  const model = new OpenAI(
    {
      openAIApiKey: config.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      streaming: true,
      maxConcurrency: 5,
    },
    {
      basePath: "https://openai.wndbac.cn/v1",
    }
  );
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 1,
    returnSourceDocuments: true,
  });

  const sendData = (data: string) => {
    event.node.res.write(`data: ${data}\n\n`);
  };

  try {
    const res = await chain.call({ query: body.prompt, chat_history: body.history || [] }, [
      {
        handleLLMNewToken(token: string) {
          sendData(JSON.stringify({ data: token }));
        },
      },
    ]);
    console.log(res);
  } finally {
    sendData("[DONE]");
    event.node.res.end();
  }
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
