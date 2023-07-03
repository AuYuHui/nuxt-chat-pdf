import axios from 'axios'
import { JSDOM } from 'jsdom'
import { clean_string } from '../utils'

/** https://github.dev/embedchain/embedchainjs */
export class WebPageLoader {
  async load_data(url: string) {
    const response = await axios.get(url)
    const html = response.data
    const dom = new JSDOM(html)
    const document = dom.window.document
    const unwantedTags = [
      'nav',
      'aside',
      'form',
      'header',
      'noscript',
      'svg',
      'canvas',
      'footer',
      'script',
      'style',
    ]
    unwantedTags.forEach((tagName) => {
      const elements = document.getElementsByTagName(tagName)
      for (const element of elements)
        element.textContent = ' '
    })

    const output = []
    let content = document.body.textContent
    if (content)
      content = clean_string(content)

    const meta_data = {
      source: url,
    }
    output.push({
      pageContent: content,
      metadata: meta_data,
    })
    return output
  }
}
