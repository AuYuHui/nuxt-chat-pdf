import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'
import { Chroma } from 'langchain/vectorstores/chroma'
import { CallbackManager } from 'langchain/callbacks'
import type { Message } from 'ai'
import { LangChainStream, streamToResponse } from 'ai'
import { makeChain } from '~/utils/makechain'

export const runtime = 'edge'

export default defineEventHandler(async (event) => {
  const { prompt, messages } = await readBody<{
    prompt: string
    messages: Message[]
  }>(event)

  const { stream, handlers } = LangChainStream()

  const openaiApiKey = process.env.OPENAI_API_KEY || ''

  if (!openaiApiKey)
    throw new Error('OPENAI_API_KEY is not set in the environment')

  if (!prompt)
    return setResponseStatus(event, 400, 'No question in the request')

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = prompt.trim().replaceAll('\n', ' ')
  try {
    /* create vectorstore */
    const vectorStore = await Chroma.fromExistingCollection(
      new OpenAIEmbeddings(
        {
          openAIApiKey: process.env.OPENAI_API_KEY,
        },
        {
          basePath: process.env.OPENAI_PROXY_URL,
        },
      ),
      {
        collectionName: process.env.CHROMA_COLLECTION_NAME || 'my_collection',
      },
    )

    // create chain
    const chain = makeChain(vectorStore)

    // Ask a question using chat history
    chain.call({
      question: sanitizedQuestion,
      chat_history: (messages).map(message =>
        message.role === 'user'
          ? new HumanChatMessage(message.content)
          : new AIChatMessage(message.content),
      ),
    }, CallbackManager.fromHandlers(handlers)).catch((err) => {
      console.error('err', err)
    })

    return streamToResponse(stream, event.node.res)
  }
  catch (error: any) {
    setResponseStatus(event, 500)
    send(event, { error: error.message || 'Something went wrong' })
  }
})
