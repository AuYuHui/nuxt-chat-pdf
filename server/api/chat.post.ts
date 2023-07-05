import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { AIChatMessage, HumanChatMessage } from 'langchain/schema'
import { ChatMessageHistory } from 'langchain/memory'
import { Chroma } from 'langchain/vectorstores/chroma'
import { CallbackManager } from 'langchain/callbacks'

import type { Message } from 'ai'
import { LangChainStream, streamToResponse } from 'ai'
import { makeChain } from '~/utils/makechain'

export const runtime = 'edge'

export default defineEventHandler(async (event) => {
  const { prompt, messages, isGoogle, APIKey } = await readBody<{
    prompt: string
    messages: Message[]
    isGoogle?: boolean
    APIKey?: string
  }>(event)
  const { stream, handlers } = LangChainStream()

  const { OPENAI_API_KEY, OPENAI_PROXY_URL, CHROMA_COLLECTION_NAME } = process.env

  const openaiApiKey = OPENAI_API_KEY || ''

  if (!openaiApiKey && !APIKey)
    throw new Error('OPENAI_API_KEY is not set in the environment')

  if (!prompt)
    throw new Error('No question in the request')

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = prompt.trim().replaceAll('\n', ' ')
  try {
    /* create vectorstore */
    const vectorStore = await Chroma.fromExistingCollection(
      new OpenAIEmbeddings(
        {
          openAIApiKey: APIKey || OPENAI_API_KEY,
        },
        {
          basePath: OPENAI_PROXY_URL,
        },
      ),
      {
        collectionName: CHROMA_COLLECTION_NAME || 'my_collection',
      },
    )

    // create chain
    const { chain } = makeChain(vectorStore)
    // Ask a question using chat history
    const history = (messages).map(message =>
      message.role === 'user'
        ? new HumanChatMessage(message.content)
        : new AIChatMessage(message.content))

    chain.call({
      question: sanitizedQuestion,
      chat_history: new ChatMessageHistory(history) || [],
    }, CallbackManager.fromHandlers(handlers))

    return streamToResponse(stream, event.node.res)
  }
  catch (error: any) {
    throw new Error('报错')
  }
})
