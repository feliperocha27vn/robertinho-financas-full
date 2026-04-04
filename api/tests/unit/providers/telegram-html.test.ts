import { describe, expect, it } from 'vitest'
import { sanitizeTelegramHtml } from '../../../src/providers/messaging/telegram-html'

describe('sanitizeTelegramHtml', () => {
  it('converts unsupported list tags into telegram-safe text', () => {
    const input = [
      '<b>Opcoes</b>',
      '<ul>',
      '<li>Item 1</li>',
      '<li>Item 2</li>',
      '</ul>',
    ].join('')

    const result = sanitizeTelegramHtml(input)

    expect(result).toContain('<b>Opcoes</b>')
    expect(result).toContain('• Item 1')
    expect(result).toContain('• Item 2')
    expect(result).not.toContain('<ul>')
    expect(result).not.toContain('<li>')
  })

  it('removes unsupported heading tags while preserving text', () => {
    const input = '<h3><b>Titulo</b></h3>\n<p>Conteudo</p>'

    const result = sanitizeTelegramHtml(input)

    expect(result).toBe('<b>Titulo</b>\n\nConteudo')
    expect(result).not.toContain('<h3>')
    expect(result).not.toContain('<p>')
  })
})
