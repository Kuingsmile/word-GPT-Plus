import type { Ref } from 'vue'

import { logDiagnostic } from '@/utils/diagnostics'
import { WordFormatter } from '@/utils/wordFormatter'

export function insertResult(result: string, insertType: Ref<insertTypes>): void {
  const paragraph = result
    .replace(/(\r\n|\n|\r)/g, '\n')
    .replace(/\n+/g, '\n')
    .split('\n')
  switch (insertType.value) {
    case 'replace':
      Word.run(async context => {
        const range = context.document.getSelection()
        range.insertText(paragraph[0] ?? '', 'Replace')
        for (const text of paragraph.slice(1).reverse()) {
          range.insertParagraph(text, 'After')
        }
        await context.sync()
      }).catch(error => logDiagnostic('error', '[Word] Plain text insertion failed', { error }))
      break
    case 'append':
      Word.run(async context => {
        const range = context.document.getSelection()
        range.insertText(paragraph[0] ?? '', 'End')
        for (const text of paragraph.slice(1).reverse()) {
          range.insertParagraph(text, 'After')
        }
        await context.sync()
      }).catch(error => logDiagnostic('error', '[Word] Plain text insertion failed', { error }))
      break
    case 'newLine':
      Word.run(async context => {
        const range = context.document.getSelection()
        for (const text of paragraph.slice().reverse()) {
          range.insertParagraph(text, 'After')
        }
        await context.sync()
      }).catch(error => logDiagnostic('error', '[Word] Plain text insertion failed', { error }))
      break
    case 'NoAction':
      break
  }
}

export async function insertFormattedResult(result: string, insertType: Ref<insertTypes>): Promise<void> {
  try {
    await WordFormatter.insertFormattedResult(result, insertType)
  } catch (error) {
    logDiagnostic('warn', '[Word] Formatted insertion failed, falling back to plain text', { error })
    insertResult(result, insertType)
  }
}
