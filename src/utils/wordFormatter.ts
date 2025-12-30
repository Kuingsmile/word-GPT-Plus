import { Ref } from 'vue'

interface FormatPart {
  text: string
  style?:
    | 'bold'
    | 'italic'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'heading4'
    | 'heading5'
    | 'heading6'
    | 'code'
    | 'quote'
  listType?: 'bullet' | 'number'
  listLevel?: number
}

class WordFormatter {
  private static parseMarkdown(text: string): FormatPart[] {
    const parts: FormatPart[] = []
    const lines = text.split('\n')
    let inCodeBlock = false
    let codeBlockContent = ''

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          if (codeBlockContent.trim()) {
            parts.push({
              text: codeBlockContent.trim(),
              style: 'code',
            })
          }
          codeBlockContent = ''
          inCodeBlock = false
        } else {
          inCodeBlock = true
        }
        continue
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n'
        continue
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const text = headingMatch[2]
        parts.push({
          text,
          style: `heading${level}` as any,
        })
        continue
      }

      if (line.trim().startsWith('>')) {
        const text = line.replace(/^\s*>\s*/, '')
        parts.push({
          text,
          style: 'quote',
        })
        continue
      }

      const numberedListMatch = line.match(/^\s*(\d+)\.\s+(.+)/)
      if (numberedListMatch) {
        const text = numberedListMatch[2]
        const indent = line.search(/\d/)
        const level = Math.floor(indent / 2) + 1
        parts.push({
          text,
          listType: 'number',
          listLevel: level,
        })
        continue
      }

      const bulletListMatch = line.match(/^\s*[-*+]\s+(.+)/)
      if (bulletListMatch) {
        const text = bulletListMatch[1]
        const indent = line.search(/[-*+]/)
        const level = Math.floor(indent / 2) + 1
        parts.push({
          text,
          listType: 'bullet',
          listLevel: level,
        })
        continue
      }

      if (line.includes('`')) {
        const inlineCodeRegex = /`([^`]+)`/g
        let match
        let processedLastIndex = 0
        const lineParts: FormatPart[] = []

        while ((match = inlineCodeRegex.exec(line)) !== null) {
          if (match.index > processedLastIndex) {
            const beforeText = line.substring(processedLastIndex, match.index)
            if (beforeText) {
              lineParts.push(...this.parseInlineFormatting(beforeText))
            }
          }

          lineParts.push({
            text: match[1],
            style: 'code',
          })

          processedLastIndex = match.index + match[0].length
        }

        if (processedLastIndex < line.length) {
          const remainingText = line.substring(processedLastIndex)
          if (remainingText) {
            lineParts.push(...this.parseInlineFormatting(remainingText))
          }
        }

        parts.push(...lineParts)
        continue
      }

      if (line.trim()) {
        parts.push(...this.parseInlineFormatting(line))
      } else {
        parts.push({ text: '' })
      }
    }

    return parts
  }

  private static parseInlineFormatting(text: string): FormatPart[] {
    const parts: FormatPart[] = []

    const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|(.+?)(?=\*\*\*|\*\*|\*|$))/g
    let match

    while ((match = regex.exec(text)) !== null) {
      if (match[2]) {
        parts.push({ text: match[2], style: 'bold' })
      } else if (match[3]) {
        parts.push({ text: match[3], style: 'bold' })
      } else if (match[4]) {
        parts.push({ text: match[4], style: 'italic' })
      } else if (match[5]) {
        if (match[5].trim()) {
          parts.push({ text: match[5] })
        }
      }
    }

    if (parts.length === 0 && text.trim()) {
      parts.push({ text })
    }

    return parts
  }

  static async insertFormattedResult(result: string, insertType: Ref): Promise<void> {
    const content = result
    if (!content || typeof content !== 'string') return

    const formatParts = this.parseMarkdown(content)

    await Word.run(async context => {
      const range = context.document.getSelection()

      if (insertType.value === 'replace') {
        range.clear()
      }

      let insertionPoint = range

      if (insertType.value === 'append') {
        insertionPoint = range.getRange('End')
      } else if (insertType.value === 'newLine') {
        insertionPoint = range.getRange('After')
        insertionPoint.insertParagraph('', 'Before')
      }

      for (const formatPart of formatParts) {
        if (formatPart.listType) {
          const listParagraph = insertionPoint.insertParagraph(formatPart.text, 'After')

          if (formatPart.listType === 'bullet') {
            listParagraph.listItem.level = (formatPart.listLevel || 1) - 1
          } else if (formatPart.listType === 'number') {
            listParagraph.listItem.level = (formatPart.listLevel || 1) - 1
          }

          insertionPoint = listParagraph.getRange('End')
        } else {
          const paragraph = insertionPoint.insertParagraph(formatPart.text || '', 'After')

          switch (formatPart.style) {
            case 'heading1':
              paragraph.styleBuiltIn = 'Heading1'
              break
            case 'heading2':
              paragraph.styleBuiltIn = 'Heading2'
              break
            case 'heading3':
              paragraph.styleBuiltIn = 'Heading3'
              break
            case 'heading4':
              paragraph.styleBuiltIn = 'Heading4'
              break
            case 'heading5':
              paragraph.styleBuiltIn = 'Heading5'
              break
            case 'heading6':
              paragraph.styleBuiltIn = 'Heading6'
              break
            case 'quote':
              paragraph.styleBuiltIn = 'Quote'
              paragraph.font.italic = true
              break
            case 'code':
              paragraph.font.name = 'Consolas'
              paragraph.font.color = '#d63384'
              paragraph.styleBuiltIn = 'NoSpacing'
              break
            case 'bold':
              paragraph.font.bold = true
              break
            case 'italic':
              paragraph.font.italic = true
              break
          }

          insertionPoint = paragraph.getRange('End')
        }
      }

      await context.sync()
    })
  }

  static async insertPlainResult(result: string, insertType: Ref): Promise<void> {
    const paragraph = result.replace(/\n+/g, '\n').replace(/\r+/g, '\n').split('\n')

    switch (insertType.value) {
      case 'replace':
        await Word.run(async context => {
          const range = context.document.getSelection()
          range.insertText(paragraph[0], 'Replace')
          for (let i = paragraph.length - 1; i > 0; i--) {
            range.insertParagraph(paragraph[i], 'After')
          }
          await context.sync()
        })
        break
      case 'append':
        await Word.run(async context => {
          const range = context.document.getSelection()
          range.insertText(paragraph[0], 'End')
          for (let i = paragraph.length - 1; i > 0; i--) {
            range.insertParagraph(paragraph[i], 'After')
          }
          await context.sync()
        })
        break
      case 'newLine':
        await Word.run(async context => {
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
}

export { WordFormatter }
