import { Ref } from 'vue'

function insertResult(result: Ref<string>, insertType: Ref<string>): void {
  const paragraph = result.value
    .replace(/\n+/g, '\n')
    .replace(/\r+/g, '\n')
    .split('\n')
  switch (insertType.value) {
    case 'replace':
      Word.run(async context => {
        const range = context.document.getSelection()
        range.insertText(paragraph[0], 'Replace')
        for (let i = paragraph.length - 1; i > 0; i--) {
          range.insertParagraph(paragraph[i], 'After')
        }
        await context.sync()
      })
      break
    case 'append':
      Word.run(async context => {
        const range = context.document.getSelection()
        range.insertText(paragraph[0], 'End')
        for (let i = paragraph.length - 1; i > 0; i--) {
          range.insertParagraph(paragraph[i], 'After')
        }
        await context.sync()
      })
      break
    case 'newLine':
      Word.run(async context => {
        const range = context.document.getSelection()
        for (let i = paragraph.length - 1; i >= 0; i--) {
          range.insertParagraph(paragraph[i], 'After')
        }
        await context.sync()
      })
      break
    case 'NoAction':
      break
  }
}

export default {
  insertResult
}
