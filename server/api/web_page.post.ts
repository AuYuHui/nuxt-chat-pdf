import type { Browser, Page } from 'langchain/document_loaders/web/playwright'
import { PlaywrightWebBaseLoader } from 'langchain/document_loaders/web/playwright'
import addSlashUrl from '~/utils/add-slash-url'

export default defineEventHandler(async (event) => {
  const { url } = await readBody<{ url: string }>(event)
  const urlWithSlash = addSlashUrl(url.trim())

  const loader = new PlaywrightWebBaseLoader(urlWithSlash, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: 'domcontentloaded',
      timeout: 100000,
    },
    /** Pass custom evaluate, in this case you get page and browser instances */
    async evaluate(page: Page, browser: Browser) {
      await page.waitForResponse(urlWithSlash)

      const result = await page.evaluate(() => document.body.innerHTML)
      console.log('result', result)

      return result
    },
  })

  const docs = await loader.load()
  // console.log('docs', docs)

  return 'Hello webpage'
})
