import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import mdKatex from '@traptitech/markdown-it-katex'
import mila from 'markdown-it-link-attributes'

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">复制代码</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

export const md = new MarkdownIt({
  html: false,
  linkify: true,
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      try {
        const lang = language ?? ''
        return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
      }
      catch (__) {}
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
}).use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
  .use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })
