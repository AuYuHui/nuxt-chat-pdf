import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BaseChatMessage } from "langchain/schema";
import { ChatMessageHistory } from "langchain/memory";
import { Chroma } from "langchain/vectorstores/chroma";
import { makeChain } from "~/utils/makechain";
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { prompt, history, collectionName } = await readBody<{
    prompt: string;
    history: BaseChatMessage[];
    collectionName: string;
  }>(event);

  if (!prompt) {
    return setResponseStatus(event, 400, "No question in the request");
  }
  console.log("question:", prompt);
  console.log(history);

  history.map((val) => {
    console.log(val);
  });

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = prompt.trim().replaceAll("\n", " ");
  try {
    if (!collectionName) {
      throw new Error("Chroma collection name is missing");
    }
    /* create vectorstore*/
    const vectorStore = await Chroma.fromExistingCollection(
      new OpenAIEmbeddings(
        {
          openAIApiKey: config.OPENAI_API_KEY,
        },
        {
          basePath: "https://openai.wndbac.cn/v1",
        }
      ),
      {
        collectionName: collectionName,
      }
    );

    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: new ChatMessageHistory(history),
    });

    console.log("response", response);
    return {
      msg: "success",
      data: response,
    };
  } catch (error: any) {
    console.log("error:", error);
    setResponseStatus(event, 500);
    send(event, { error: error.message || "Something went wrong" });
  }
});
