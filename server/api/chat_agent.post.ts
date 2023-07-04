import { ChatOpenAI } from 'langchain/chat_models/openai'
import { SerpAPI } from 'langchain/tools'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { Calculator } from 'langchain/tools/calculator'

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody<{ prompt: string }>(event)
  const { GOOGLE_CUSTOM_SEARCH_ENGINE_ID, GOOGLE_CUSTOM_SEARCH_API_KEY }
		= process.env
  const model = new ChatOpenAI({ temperature: 0 }, {
    basePath: process.env.OPENAI_PROXY_URL,
  })
  const tools = [
    new SerpAPI('', {
      location: 'China',
      hl: 'zh-cn',
      gl: 'cn',
    }),
    new Calculator(),
  ]

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'zero-shot-react-description',
  })
  console.log('Loaded agent.')

  const input = encodeURIComponent('蔡徐坤最近做了什么事情?')

  console.log(`Executing with input "${input}"...`)

  const result = await executor.call({ input })

  console.log(`Got output ${result.output}`)

  return 'Hello chat_agent'
})
