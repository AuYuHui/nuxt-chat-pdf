import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
  setHeaders(event, headers);
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
        basePath: config.OPENAI_PROXY_URL,
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
      basePath: config.OPENAI_PROXY_URL,
    }
  );
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 1,
    returnSourceDocuments: true,
  });

  const sendData = (data: string) => {
    event.node.res.write(`id: ${Date.now()}\n`);
    event.node.res.write("type: message\n");
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
