import Markdown from 'markdown-it'
import highlight from 'highlight.js'

const mdOptions: Markdown.Options = {
  html: false,
  linkify: true,
  highlight(str, lang) {
    if (lang && highlight.getLanguage(lang)) {
      try {
        return (
          `<pre class="hljs"><code>${
          highlight.highlight(lang, str, true).value
          }</code></pre>`
        )
      }
      catch (__) {}
    }
    return ''
  },
}

export const md = new Markdown(mdOptions)
