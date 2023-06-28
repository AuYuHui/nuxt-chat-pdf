import { OpenAI } from 'langchain/llms/openai'
import type { Chroma } from 'langchain/vectorstores/chroma'
import { ConversationalRetrievalQAChain } from 'langchain/chains'

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language. include it in the standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`

const QA_PROMPT = `Your name is Quivr. You are a second brain. A person will ask you a question and you will provide a helpful answer. Write the answer in the same language as the question. If you don't know the answer, just say that you don't know. Don't try to make up an answer. Use the following context to answer the question:


{context}

Question: {question}
Helpful Answer:`

export function makeChain(vectorstore: Chroma) {
  const model = new OpenAI(
    {
      openAIApiKey: process.env.NUXT_OPENAI_API_KEY,
      temperature: 0, // increase temepreature to get more creative answers
      modelName: 'gpt-3.5-turbo-0613', // change this to gpt-4 if you have access
    },
    {
      basePath: 'https://openai.wndbac.cn/v1',
    },
  )

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, // The number of source documents returned is 4 by default
    },
  )
  return chain
}
