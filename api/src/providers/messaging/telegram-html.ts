function stripTag(content: string, tagName: string): string {
  const open = new RegExp(`<${tagName}\\b[^>]*>`, 'gi')
  const close = new RegExp(`</${tagName}>`, 'gi')
  return content.replace(open, '').replace(close, '')
}

function stripUnsupportedHtmlTags(content: string): string {
  const allowed = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'code', 'pre', 'a'])

  return content.replace(/<\/?([a-zA-Z0-9-]+)(\s+[^>]*)?>/g, (match, tagName) => {
    const normalized = String(tagName).toLowerCase()
    return allowed.has(normalized) ? match : ''
  })
}

export function stripAllHtmlTags(content: string): string {
  return content.replace(/<[^>]+>/g, '')
}

export function sanitizeTelegramHtml(content: string): string {
  let text = content

  text = text.replace(/<\/h[1-6]>/gi, '\n')
  text = text.replace(/<\/p>/gi, '\n')

  text = text.replace(/<br\s*\/?\s*>/gi, '\n')
  text = text.replace(/<p\b[^>]*>/gi, '')
  text = text.replace(/<\/?h[1-6]\b[^>]*>/gi, '')

  text = text.replace(/<li\b[^>]*>/gi, '\n• ')
  text = text.replace(/<\/li>/gi, '')
  text = stripTag(text, 'ul')
  text = stripTag(text, 'ol')
  text = stripUnsupportedHtmlTags(text)

  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}
