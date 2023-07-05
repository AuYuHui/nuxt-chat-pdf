import { SerpAPI } from 'langchain/tools'
import { AgentExecutor, ZeroShotAgent } from 'langchain/agents'
import { Calculator } from 'langchain/tools/calculator'
import { OpenAI } from 'langchain/llms/openai'
import { LLMChain } from 'langchain/chains'

export default defineEventHandler(async (event) => {
  const { prompt: input } = await readBody<{ prompt: string }>(event)
  const { SerpAPI_KEY }
		= process.env
  const model = new OpenAI({
    temperature: 0.9,
  }, {
    basePath: process.env.OPENAI_PROXY_URL,
  })
  const tools = [
    new SerpAPI(SerpAPI_KEY, {
      location: 'China',
      hl: 'zh-cn',
      gl: 'cn',
    }),
    new Calculator(),
  ]
  const prefix = 'Answer the following questions as best you can. And answer according to the language of the user\'s question. You have access to the following tools:\n\nsearch: a search engine. useful for when you need to answer questions about current events. input should be a search query.\ncalculator:'
  const suffix = `Begin! And answer according to the language of the user's question."

Question: {input}
{agent_scratchpad}`
  const createPromptArgs = {
    suffix,
    prefix,
    inputVariables: ['input', 'agent_scratchpad'],
  }
  try {
    const prompt = ZeroShotAgent.createPrompt(tools, createPromptArgs)
    const llmChain = new LLMChain({ llm: model, prompt })
    const agent = new ZeroShotAgent({
      llmChain,
      allowedTools: ['search', 'calculator'],
    })
    const agentExecutor = AgentExecutor.fromAgentAndTools({ agent, tools })
    console.log('Loaded agent.')

    console.log(`Executing with input "${input}"...`)

    const result = await agentExecutor.call({ input })
    console.log('result', result)

    console.log(`Got output ${result.output}`)

    return result.output
  }
  catch (error) {
    console.log(error)
    throw new Error('出错了')
  }
})
