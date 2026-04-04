function stripTag(content: string, tagName: string): string {
  const open = new RegExp(`<${tagName}\\b[^>]*>`, 'gi')
  const close = new RegExp(`</${tagName}>`, 'gi')
  return content.replace(open, '').replace(close, '')
}

export function sanitizeTelegramHtml(content: string): string {
  let text = content

  text = text.replace(/<li\b[^>]*>/gi, '\n• ')
  text = text.replace(/<\/li>/gi, '')
  text = stripTag(text, 'ul')
  text = stripTag(text, 'ol')

  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}
